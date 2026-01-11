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
        metodo_pago: string; // 'tarjeta' | 'deposito' | 'billetera' | 'cheque' | 'cripto'
        datos_metodo_pago: any; // Datos específicos según el método
        monto_pago: number; // Monto a pagar en Bs
        denominacion: string; // 'VEN' u otra
        plan_cuotas?: {
          num_cuotas: number;
          tasa_interes: number;
        };
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

        if (metodo_pago === "tarjeta") {
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
            // Crear plan de cuotas
            await pool.query(
              `SELECT agregar_cuotas($1, $2, $3, $4) AS resultado`,
              [
                id_venta,
                venta.monto_total,
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

            // Pagar la primera cuota
            const { rows: pagarCuotaRows } = await pool.query(
              `SELECT pagar_cuota($1, $2, $3, $4) AS id_pago`,
              [
                primeraCuota.id_cuota,
                montoCuota,
                id_metodo_pago,
                denominacion || "VEN",
              ]
            );

            id_pago = pagarCuotaRows[0]?.id_pago;

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

