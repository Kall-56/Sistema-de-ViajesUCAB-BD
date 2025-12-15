import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * POST /api/cliente/paquetes/comprar
 * 
 * Comprar un paquete completo.
 * 
 * Body:
 * - id_paquete: ID del paquete a comprar
 * - fechas_inicio: Array de timestamps (uno por cada servicio del paquete)
 * 
 * La función vender_paquete espera:
 * - i_id_cliente: integer
 * - i_id_paquete: integer  
 * - i_fecha_inicio: timestamp without time zone[]
 */
export async function POST(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const body = await req.json();
    const { id_paquete, fechas_inicio } = body as {
      id_paquete: number;
      fechas_inicio: string[]; // Array de strings ISO que se convertirán a timestamp
    };

    if (!Number.isInteger(id_paquete) || id_paquete <= 0) {
      return NextResponse.json(
        { error: "ID de paquete inválido" },
        { status: 400 }
      );
    }

    if (!Array.isArray(fechas_inicio) || fechas_inicio.length === 0) {
      return NextResponse.json(
        { error: "Debe proporcionar al menos una fecha de inicio" },
        { status: 400 }
      );
    }

    // Verificar que el paquete existe y obtener cantidad de servicios
    const { rows: paqueteRows } = await pool.query(
      `SELECT COUNT(*) as cantidad_servicios 
       FROM paquete_servicio 
       WHERE fk_paquete = $1`,
      [id_paquete]
    );

    if (!paqueteRows?.length || Number(paqueteRows[0].cantidad_servicios) === 0) {
      return NextResponse.json(
        { error: "Paquete no encontrado o sin servicios" },
        { status: 404 }
      );
    }

    const cantidadServicios = Number(paqueteRows[0].cantidad_servicios);

    if (fechas_inicio.length !== cantidadServicios) {
      return NextResponse.json(
        { 
          error: `La cantidad de fechas (${fechas_inicio.length}) no coincide con la cantidad de servicios del paquete (${cantidadServicios})`,
          cantidad_servicios: cantidadServicios
        },
        { status: 400 }
      );
    }

    // Convertir las fechas de string ISO a formato PostgreSQL timestamp
    // PostgreSQL espera timestamps en formato 'YYYY-MM-DD HH:MM:SS'
    const fechasTimestamp = fechas_inicio.map((fechaStr) => {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) {
        throw new Error(`Fecha inválida: ${fechaStr}`);
      }
      // Formatear como 'YYYY-MM-DD HH:MM:SS' (sin timezone)
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      const hours = String(fecha.getHours()).padStart(2, '0');
      const minutes = String(fecha.getMinutes()).padStart(2, '0');
      const seconds = String(fecha.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    });

    // Llamar a la función almacenada vender_paquete
    // El driver pg puede necesitar que pasemos el array como string literal de PostgreSQL
    // o podemos usar el casting explícito
    const { rows } = await pool.query(
      `SELECT vender_paquete($1, $2, $3::timestamp without time zone[]) AS ids_itinerarios`,
      [clienteId, id_paquete, fechasTimestamp]
    );

    const idsItinerarios = rows[0]?.ids_itinerarios || [];

    // Obtener información de la venta creada
    // La función vender_paquete crea una venta y la retorna, pero necesitamos obtenerla
    // Buscamos la venta más reciente del cliente que tenga estos itinerarios
    const { rows: ventaRows } = await pool.query(
      `SELECT v.id_venta, v.monto_total, v.monto_compensacion
       FROM venta v
       JOIN itinerario i ON i.fk_venta = v.id_venta
       WHERE v.fk_cliente = $1 
         AND i.id = ANY($2::integer[])
       ORDER BY v.id_venta DESC
       LIMIT 1`,
      [clienteId, idsItinerarios]
    );

    return NextResponse.json({
      ok: true,
      id_venta: ventaRows[0]?.id_venta,
      ids_itinerarios: idsItinerarios,
      monto_total: ventaRows[0]?.monto_total,
      monto_compensacion: ventaRows[0]?.monto_compensacion,
    }, { status: 201 });

  } catch (e: any) {
    console.error("Error comprando paquete:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error comprando paquete" },
      { status: 500 }
    );
  }
}

