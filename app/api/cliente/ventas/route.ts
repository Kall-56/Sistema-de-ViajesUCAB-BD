import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

// GET: Obtener ventas activas del cliente (itinerarios en construcción)
export async function GET() {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    // Obtener ventas pendientes del cliente con sus itinerarios
    const { rows } = await pool.query(
      `
      SELECT
        v.id_venta,
        v.monto_total,
        v.monto_compensacion,
        (SELECT COUNT(*) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS cantidad_items,
        (SELECT MIN(i.fecha_hora_inicio) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS fecha_inicio_minima,
            (SELECT array_agg(
              json_build_object(
                'id_itinerario', i.id,
                'id_servicio', i.fk_servicio,
                'nombre_servicio', s.nombre,
                'costo_unitario_original', COALESCE(i.costo_especial, s.costo_servicio),
                'costo_unitario_bs',
                  CASE 
                    WHEN s.denominacion != 'VEN' THEN
                      COALESCE(i.costo_especial, s.costo_servicio) * 
                      COALESCE(
                        (SELECT cantidad_cambio 
                         FROM cambio_moneda 
                         WHERE denominacion = s.denominacion 
                           AND fecha_fin IS NULL 
                         ORDER BY fecha_inicio DESC 
                         LIMIT 1), 
                        1
                      )
                    ELSE
                      COALESCE(i.costo_especial, s.costo_servicio)
                  END,
                'fecha_inicio', i.fecha_hora_inicio,
                'tipo_servicio', s.tipo_servicio,
                'denominacion_original', s.denominacion,
                'denominacion', 'VEN'
              )
            )
            FROM itinerario i
            JOIN servicio s ON s.id = i.fk_servicio
            WHERE i.fk_venta = v.id_venta) AS items
      FROM venta v
      WHERE v.fk_cliente = $1
        AND EXISTS (
          SELECT 1 FROM ven_est ve
          JOIN estado e ON e.id = ve.fk_estado
          WHERE ve.fk_venta = v.id_venta
            AND e.nombre = 'pendiente'
            AND ve.fecha_fin IS NULL
        )
      ORDER BY v.id_venta DESC
      LIMIT 50
      `,
      [clienteId]
    );

    return NextResponse.json({ ventas: rows });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo ventas" },
      { status: 500 }
    );
  }
}

// POST: Iniciar una nueva venta (itinerario)
export async function POST() {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    // Usar función almacenada iniciar_venta
    const { rows } = await pool.query(
      `SELECT iniciar_venta($1) AS id_venta`,
      [clienteId]
    );

    const idVenta = rows[0]?.id_venta;
    if (!idVenta) {
      throw new Error("Error creando venta");
    }

    return NextResponse.json({ ok: true, id_venta: idVenta }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error iniciando venta" },
      { status: 500 }
    );
  }
}

