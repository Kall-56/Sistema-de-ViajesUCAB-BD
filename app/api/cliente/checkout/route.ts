import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * POST /api/cliente/checkout
 * 
 * Procesa el checkout de las ventas en el carrito.
 * 
 * Body:
 * - ventas: Array de { id_venta, metodo_pago, datos_metodo_pago }
 * 
 * Para cada venta:
 * 1. Valida que esté pendiente y pertenezca al cliente
 * 2. Crea/obtiene método de pago según tipo
 * 3. Registra el pago usando registrar_pago()
 * 4. El estado se actualiza automáticamente según el monto pagado
 */
export async function POST(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const body = await req.json();
    const { ventas } = body as {
      ventas: Array<{
        id_venta: number;
        metodo_pago: string; // 'tarjeta' | 'deposito' | 'billetera' | 'cheque' | 'cripto' | 'milla'
        datos_metodo_pago: any; // Datos específicos según el método
        monto_pago: number; // Monto a pagar en Bs
        denominacion: string; // 'VEN' u otra
        plan_cuotas?: {
          num_cuotas: number;
          tasa_interes: number;
        };
        usar_millas?: number; // Cantidad de millas a usar
      }>;
    };

    if (!Array.isArray(ventas) || ventas.length === 0) {
      return NextResponse.json(
        { error: "Debe proporcionar al menos una venta para procesar" },
        { status: 400 }
      );
    }

    const resultados: Array<{
      id_venta: number;
      exito: boolean;
      id_pago?: number;
      estado_final?: string;
      error?: string;
    }> = [];

    // Procesar cada venta
    for (const ventaData of ventas) {
      const { id_venta, metodo_pago, datos_metodo_pago, monto_pago, denominacion, plan_cuotas } = ventaData;

      try {
        // 1. Validar que la venta pertenece al cliente y está pendiente
        const { rows: ventaRows } = await pool.query(
          `
          SELECT 
            v.id_venta,
            v.monto_total,
            v.fk_cliente,
            e.nombre AS estado
          FROM venta v
          JOIN ven_est ve ON ve.fk_venta = v.id_venta
          JOIN estado e ON e.id = ve.fk_estado
          WHERE v.id_venta = $1
            AND ve.fecha_fin IS NULL
          ORDER BY ve.fecha_inicio DESC
          LIMIT 1
          `,
          [id_venta]
        );

        if (!ventaRows?.length) {
          resultados.push({
            id_venta,
            exito: false,
            error: "Venta no encontrada",
          });
          continue;
        }

        const venta = ventaRows[0];

        if (venta.fk_cliente !== clienteId) {
          resultados.push({
            id_venta,
            exito: false,
            error: "No autorizado",
          });
          continue;
        }

        if (venta.estado !== "pendiente") {
          resultados.push({
            id_venta,
            exito: false,
            error: `La venta no está pendiente (estado: ${venta.estado})`,
          });
          continue;
        }

        // 2. Crear o obtener método de pago según el tipo
        let id_metodo_pago: number;
        const usar_millas = ventaData.usar_millas || 0;

        if (metodo_pago === "milla") {
          // Obtener el método de pago de millas del cliente
          const { rows: millasRows } = await pool.query(
            `SELECT id_metodo_pago, cantidad_millas FROM metodo_pago WHERE fk_cliente = $1 AND tipo_metodo_pago = 'milla' LIMIT 1`,
            [clienteId]
          );

          if (!millasRows?.length) {
            resultados.push({
              id_venta,
              exito: false,
              error: "No tienes un método de pago con millas configurado",
            });
            continue;
          }

          const millasData = millasRows[0];
          const millasDisponibles = Number(millasData.cantidad_millas) || 0;
          const millasAUsar = usar_millas || 0;

          if (millasAUsar > millasDisponibles) {
            resultados.push({
              id_venta,
              exito: false,
              error: `No tienes suficientes millas. Disponibles: ${millasDisponibles}, solicitadas: ${millasAUsar}`,
            });
            continue;
          }

          id_metodo_pago = millasData.id_metodo_pago;

          // Restar millas del saldo del cliente
          await pool.query(
            `UPDATE metodo_pago SET cantidad_millas = cantidad_millas - $1 WHERE id_metodo_pago = $2 AND fk_cliente = $3`,
            [millasAUsar, id_metodo_pago, clienteId]
          );

          // Registrar transacción de millas en sistema_milla
          await pool.query(
            `INSERT INTO sistema_milla (cantidad_millas, fecha, tipo_transaccion, fk_metodo_pago, fk_cliente, descripcion) VALUES ($1, CURRENT_DATE, 'debito', $2, $3, 'Pago de venta #' || $4)`,
            [millasAUsar, id_metodo_pago, clienteId, id_venta]
          );

          // Si hay un método adicional (combinación de millas + otro método)
          if (datos_metodo_pago?.metodo_adicional && datos_metodo_pago?.datos_metodo_adicional && monto_pago > 0) {
            // Crear método adicional para el resto
            const metodoAdicional = datos_metodo_pago.metodo_adicional;
            const datosAdicional = datos_metodo_pago.datos_metodo_adicional;
            
            // Crear método de pago adicional según tipo
            if (metodoAdicional === "tarjeta") {
              const { rows: metodoRows } = await pool.query(
                `SELECT insertar_metodo_pago_tarjeta($1, $2, $3, $4, $5, $6, $7) AS id_metodo_pago`,
                [
                  clienteId,
                  datosAdicional.numero_tarjeta,
                  datosAdicional.codigo_seguridad || null,
                  datosAdicional.fecha_vencimiento || null,
                  datosAdicional.titular,
                  datosAdicional.emisor || null,
                  datosAdicional.fk_banco || null,
                ]
              );
              id_metodo_pago = metodoRows[0]?.id_metodo_pago;
            } else if (metodoAdicional === "deposito") {
              const { rows: metodoRows } = await pool.query(
                `SELECT insertar_metodo_pago_deposito($1, $2, $3, $4) AS id_metodo_pago`,
                [
                  clienteId,
                  datosAdicional.numero_referencia,
                  datosAdicional.numero_cuenta_destino || null,
                  datosAdicional.fk_banco || null,
                ]
              );
              id_metodo_pago = metodoRows[0]?.id_metodo_pago;
            } else if (metodoAdicional === "billetera") {
              const { rows: metodoRows } = await pool.query(
                `SELECT insertar_metodo_pago_billetera($1, $2, $3, $4) AS id_metodo_pago`,
                [clienteId, datosAdicional.numero_confirmacion, datosAdicional.fk_tbd || null, datosAdicional.fk_banco || null]
              );
              id_metodo_pago = metodoRows[0]?.id_metodo_pago;
            } else if (metodoAdicional === "cheque") {
              const { rows: metodoRows } = await pool.query(
                `SELECT insertar_metodo_pago_cheque($1, $2, $3, $4) AS id_metodo_pago`,
                [clienteId, datosAdicional.codigo_cuenta || null, datosAdicional.numero_cheque, datosAdicional.fk_banco || null]
              );
              id_metodo_pago = metodoRows[0]?.id_metodo_pago;
            } else if (metodoAdicional === "cripto") {
              const { rows: metodoRows } = await pool.query(
                `SELECT insertar_metodo_pago_cripto($1, $2, $3) AS id_metodo_pago`,
                [clienteId, datosAdicional.nombre_criptomoneda, datosAdicional.direccion_billetera]
              );
              id_metodo_pago = metodoRows[0]?.id_metodo_pago;
            }
          }
        } else if (metodo_pago === "tarjeta") {
          const {
            numero_tarjeta,
            codigo_seguridad,
            fecha_vencimiento,
            titular,
            emisor,
            fk_banco,
          } = datos_metodo_pago;

          if (!numero_tarjeta || !titular) {
            resultados.push({
              id_venta,
              exito: false,
              error: "Datos de tarjeta incompletos",
            });
            continue;
          }

          const { rows: metodoRows } = await pool.query(
            `SELECT insertar_metodo_pago_tarjeta($1, $2, $3, $4, $5, $6, $7) AS id_metodo_pago`,
            [
              clienteId,
              numero_tarjeta,
              codigo_seguridad || null,
              fecha_vencimiento || null,
              titular,
              emisor || null,
              fk_banco || null,
            ]
          );

          id_metodo_pago = metodoRows[0]?.id_metodo_pago;
        } else if (metodo_pago === "deposito") {
          const { numero_referencia, numero_cuenta_destino, fk_banco } = datos_metodo_pago;

          if (!numero_referencia) {
            resultados.push({
              id_venta,
              exito: false,
              error: "Número de referencia requerido",
            });
            continue;
          }

          const { rows: metodoRows } = await pool.query(
            `SELECT insertar_metodo_pago_deposito($1, $2, $3, $4) AS id_metodo_pago`,
            [
              clienteId,
              numero_referencia,
              numero_cuenta_destino || null,
              fk_banco || null,
            ]
          );

          id_metodo_pago = metodoRows[0]?.id_metodo_pago;
        } else if (metodo_pago === "billetera") {
          const { numero_confirmacion, fk_tbd, fk_banco } = datos_metodo_pago;

          if (!numero_confirmacion) {
            resultados.push({
              id_venta,
              exito: false,
              error: "Número de confirmación requerido",
            });
            continue;
          }

          const { rows: metodoRows } = await pool.query(
            `SELECT insertar_metodo_pago_billetera($1, $2, $3, $4) AS id_metodo_pago`,
            [clienteId, numero_confirmacion, fk_tbd || null, fk_banco || null]
          );

          id_metodo_pago = metodoRows[0]?.id_metodo_pago;
        } else if (metodo_pago === "cheque") {
          const { codigo_cuenta, numero_cheque, fk_banco } = datos_metodo_pago;

          if (!numero_cheque) {
            resultados.push({
              id_venta,
              exito: false,
              error: "Número de cheque requerido",
            });
            continue;
          }

          const { rows: metodoRows } = await pool.query(
            `SELECT insertar_metodo_pago_cheque($1, $2, $3, $4) AS id_metodo_pago`,
            [clienteId, codigo_cuenta || null, numero_cheque, fk_banco || null]
          );

          id_metodo_pago = metodoRows[0]?.id_metodo_pago;
        } else if (metodo_pago === "cripto") {
          const { nombre_criptomoneda, direccion_billetera } = datos_metodo_pago;

          if (!nombre_criptomoneda || !direccion_billetera) {
            resultados.push({
              id_venta,
              exito: false,
              error: "Datos de criptomoneda incompletos",
            });
            continue;
          }

          const { rows: metodoRows } = await pool.query(
            `SELECT insertar_metodo_pago_cripto($1, $2, $3) AS id_metodo_pago`,
            [clienteId, nombre_criptomoneda, direccion_billetera]
          );

          id_metodo_pago = metodoRows[0]?.id_metodo_pago;
        } else {
          resultados.push({
            id_venta,
            exito: false,
            error: `Método de pago no soportado: ${metodo_pago}`,
          });
          continue;
        }

        if (!id_metodo_pago) {
          resultados.push({
            id_venta,
            exito: false,
            error: "Error creando método de pago",
          });
          continue;
        }

        // 3. Procesar pago según si es plan de cuotas o pago único
        let id_pago: number;
        const planCuotas = plan_cuotas;

        if (planCuotas && planCuotas.num_cuotas > 1) {
          // Plan de cuotas: crear plan y pagar primera cuota
          try {
            // Crear plan de cuotas usando función agregar_cuotas
            // Firma: agregar_cuotas(i_id_venta, i_tasa_interes, num_cuotas)
            const { rows: cuotasRows } = await pool.query(
              `SELECT agregar_cuotas($1, $2, $3) AS resultado`,
              [
                id_venta,
                planCuotas.tasa_interes,
                planCuotas.num_cuotas,
              ]
            );

            // Obtener la primera cuota (la que tiene fecha_inicio más antigua)
            const { rows: primeraCuotaRows } = await pool.query(
              `
              SELECT c.id_cuota, c.monto_cuota
              FROM cuota c
              JOIN plan_cuotas pc ON pc.id_plan_cuotas = c.fk_plan_cuotas
              WHERE pc.fk_venta = $1
              ORDER BY c.id_cuota ASC
              LIMIT 1
              `,
              [id_venta]
            );

            if (!primeraCuotaRows?.length) {
              resultados.push({
                id_venta,
                exito: false,
                error: "Error obteniendo primera cuota",
              });
              continue;
            }

            const primeraCuota = primeraCuotaRows[0];
            const montoCuota = Number(primeraCuota.monto_cuota);

            // Pagar la primera cuota usando función pagar_cuota
            // Firma: pagar_cuota(i_id_cuota, monto, i_fk_metodo_pago, i_denominacion)
            try {
              const { rows: pagarCuotaRows } = await pool.query(
                `SELECT pagar_cuota($1, $2, $3, $4) AS resultado`,
                [
                  primeraCuota.id_cuota,
                  montoCuota,
                  id_metodo_pago,
                  denominacion || "VEN",
                ]
              );

              const resultadoPago = pagarCuotaRows[0]?.resultado;
              
              if (!resultadoPago || resultadoPago !== 1) {
                throw new Error("Error pagando primera cuota");
              }
            } catch (pagarCuotaError: any) {
              // Manejar error de constraint unique (cuota ya pagada)
              if (pagarCuotaError.code === '23505' && pagarCuotaError.constraint === 'cuo_ecuo_pkey') {
                // La cuota ya tiene el estado pagado, verificar si realmente está pagada
                const { rows: estadoCuotaRows } = await pool.query(
                  `
                  SELECT e.nombre AS estado
                  FROM cuo_ecuo ce
                  JOIN estado e ON e.id = ce.fk_estado
                  WHERE ce.fk_cuota = $1 AND ce.fecha_fin IS NULL
                  `,
                  [primeraCuota.id_cuota]
                );
                
                if (estadoCuotaRows[0]?.estado === 'Pagado') {
                  // La cuota ya está pagada, obtener el pago existente
                  const { rows: pagoExistenteRows } = await pool.query(
                    `
                    SELECT id_pago 
                    FROM pago 
                    WHERE fk_venta = $1 
                      AND fecha_hora >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
                    ORDER BY id_pago DESC 
                    LIMIT 1
                    `,
                    [id_venta]
                  );
                  
                  if (pagoExistenteRows[0]?.id_pago) {
                    id_pago = pagoExistenteRows[0].id_pago;
                    // Continuar sin error, la cuota ya fue pagada
                  } else {
                    throw new Error("La cuota ya está pagada pero no se encontró el pago asociado");
                  }
                } else {
                  throw new Error("Error al pagar la cuota: estado duplicado");
                }
              } else {
                throw pagarCuotaError;
              }
            }

            // Obtener el ID del pago creado por registrar_pago dentro de pagar_cuota
            const { rows: pagoRows } = await pool.query(
              `
              SELECT id_pago 
              FROM pago 
              WHERE fk_venta = $1 
                AND fecha_hora >= CURRENT_TIMESTAMP - INTERVAL '1 minute'
              ORDER BY id_pago DESC 
              LIMIT 1
              `,
              [id_venta]
            );

            id_pago = pagoRows[0]?.id_pago;

            if (!id_pago) {
              resultados.push({
                id_venta,
                exito: false,
                error: "Error pagando primera cuota",
              });
              continue;
            }
          } catch (cuotaError: any) {
            console.error(`Error procesando cuotas para venta ${id_venta}:`, cuotaError);
            resultados.push({
              id_venta,
              exito: false,
              error: cuotaError?.message ?? "Error procesando plan de cuotas",
            });
            continue;
          }
        } else {
          // Pago único: usar registrar_pago directamente
          const { rows: pagoRows } = await pool.query(
            `SELECT registrar_pago($1, $2, $3, $4) AS id_pago`,
            [id_venta, monto_pago, id_metodo_pago, denominacion || "VEN"]
          );

          id_pago = pagoRows[0]?.id_pago;

          if (!id_pago) {
            resultados.push({
              id_venta,
              exito: false,
              error: "Error registrando pago",
            });
            continue;
          }
        }

        // 4. Obtener estado final de la venta
        const { rows: estadoRows } = await pool.query(
          `
          SELECT e.nombre AS estado
          FROM venta v
          JOIN ven_est ve ON ve.fk_venta = v.id_venta
          JOIN estado e ON e.id = ve.fk_estado
          WHERE v.id_venta = $1
            AND ve.fecha_fin IS NULL
          ORDER BY ve.fecha_inicio DESC
          LIMIT 1
          `,
          [id_venta]
        );

        const estado_final = estadoRows[0]?.estado || "pendiente";

        resultados.push({
          id_venta,
          exito: true,
          id_pago,
          estado_final,
        });
      } catch (error: any) {
        console.error(`Error procesando venta ${id_venta}:`, error);
        resultados.push({
          id_venta,
          exito: false,
          error: error?.message || "Error procesando venta",
        });
      }
    }

    // Verificar si todas las ventas fueron procesadas exitosamente
    const todasExitosas = resultados.every((r) => r.exito);
    const algunasExitosas = resultados.some((r) => r.exito);

    return NextResponse.json({
      ok: todasExitosas,
      parcial: algunasExitosas && !todasExitosas,
      resultados,
    });
  } catch (e: any) {
    console.error("Error en checkout:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error procesando checkout" },
      { status: 500 }
    );
  }
}

