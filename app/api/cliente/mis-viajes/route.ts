import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * GET /api/cliente/mis-viajes
 * 
 * Obtiene todas las compras del cliente (ventas que no están pendientes).
 * Incluye información de estado, pagos, e itinerarios.
 */
export async function GET() {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    // Obtener todas las ventas del cliente que no están pendientes
    const { rows } = await pool.query(
      `
      SELECT
        v.id_venta,
        v.monto_total,
        v.monto_compensacion,
        (SELECT COUNT(*) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS cantidad_items,
        (SELECT MIN(i.fecha_hora_inicio) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS fecha_inicio_minima,
        (SELECT MAX(i.fecha_hora_inicio) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS fecha_inicio_maxima,
        e.nombre AS estado,
        ve.fecha_inicio AS fecha_estado,
        (SELECT array_agg(
          json_build_object(
            'id_itinerario', i.id,
            'id_servicio', i.fk_servicio,
            'nombre_servicio', s.nombre,
            'descripcion_servicio', s.descripcion,
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
            'lugar_nombre', l.nombre
          )
        )
        FROM itinerario i
        JOIN servicio s ON s.id = i.fk_servicio
        LEFT JOIN lugar l ON l.id = s.fk_lugar
        WHERE i.fk_venta = v.id_venta) AS items,
        (SELECT array_agg(
          json_build_object(
            'id_pago', p.id_pago,
            'monto', p.monto,
            'fecha_hora', p.fecha_hora,
            'denominacion', p.denominacion,
            'metodo_pago', mp.tipo_metodo_pago
          )
        )
        FROM pago p
        JOIN metodo_pago mp ON p.fk_metodo_pago = mp.id_metodo_pago
        WHERE p.fk_venta = v.id_venta) AS pagos
      FROM venta v
      JOIN ven_est ve ON ve.fk_venta = v.id_venta
      JOIN estado e ON e.id = ve.fk_estado
      WHERE v.fk_cliente = $1
        AND ve.fecha_fin IS NULL
        AND e.nombre != 'pendiente'
      ORDER BY ve.fecha_inicio DESC
      LIMIT 100
      `,
      [clienteId]
    );

    return NextResponse.json({ compras: rows });
  } catch (e: any) {
    console.error("Error obteniendo mis viajes:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo compras" },
      { status: 500 }
    );
  }
}

