import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// GET: Listar todos los itinerarios (solo admin)
export async function GET(req: Request) {
  const auth = requirePermission(1); // Permiso de lectura
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const servicioId = searchParams.get("servicio_id");
  const ventaId = searchParams.get("venta_id");
  const clienteId = searchParams.get("cliente_id");

  try {
    let query = `
      SELECT
        i.id AS id_itinerario,
        i.fk_servicio AS id_servicio,
        i.fk_venta AS id_venta,
        i.costo_especial,
        i.fecha_hora_inicio,
        s.nombre AS nombre_servicio,
        s.tipo_servicio,
        s.costo_servicio,
        s.denominacion,
        v.fk_cliente AS id_cliente,
        CONCAT(c.nombre_1, ' ', COALESCE(c.nombre_2, ''), ' ', c.apellido_1, ' ', COALESCE(c.apellido_2, '')) AS nombre_cliente,
        u.email AS email_cliente,
        l.nombre AS lugar_nombre,
        p.nombre_proveedor,
        e.nombre AS estado_venta,
        v.monto_total,
        v.monto_compensacion,
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
        END AS costo_unitario_bs
      FROM itinerario i
      JOIN servicio s ON s.id = i.fk_servicio
      JOIN venta v ON v.id_venta = i.fk_venta
      JOIN cliente c ON c.id = v.fk_cliente
      LEFT JOIN usuario u ON u.fk_cliente = c.id
      LEFT JOIN lugar l ON l.id = s.fk_lugar
      LEFT JOIN proveedor p ON p.id = s.fk_proveedor
      LEFT JOIN ven_est ve ON ve.fk_venta = v.id_venta AND ve.fecha_fin IS NULL
      LEFT JOIN estado e ON e.id = ve.fk_estado
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (servicioId) {
      query += ` AND i.fk_servicio = $${paramCount}`;
      params.push(Number(servicioId));
      paramCount++;
    }

    if (ventaId) {
      query += ` AND i.fk_venta = $${paramCount}`;
      params.push(Number(ventaId));
      paramCount++;
    }

    if (clienteId) {
      query += ` AND v.fk_cliente = $${paramCount}`;
      params.push(Number(clienteId));
      paramCount++;
    }

    query += ` ORDER BY i.fecha_hora_inicio DESC LIMIT 500`;

    const { rows } = await pool.query(query, params);

    // Asegurar que todos los campos requeridos estén presentes
    const itinerarios = rows.map((row: any) => ({
      id_itinerario: row.id_itinerario,
      id_servicio: row.id_servicio,
      id_venta: row.id_venta,
      id_cliente: row.id_cliente,
      nombre_cliente: row.nombre_cliente || "Sin nombre",
      email_cliente: row.email_cliente || "Sin email",
      nombre_servicio: row.nombre_servicio || "Sin nombre",
      tipo_servicio: row.tipo_servicio || "otro",
      lugar_nombre: row.lugar_nombre || null,
      nombre_proveedor: row.nombre_proveedor || null,
      fecha_hora_inicio: row.fecha_hora_inicio,
      costo_especial: row.costo_especial || null,
      costo_servicio: row.costo_servicio || 0,
      costo_unitario_bs: Number(row.costo_unitario_bs || 0),
      denominacion: row.denominacion || "VEN",
      estado_venta: row.estado_venta || null,
      monto_total: Number(row.monto_total || 0),
      monto_compensacion: Number(row.monto_compensacion || 0),
    }));

    return NextResponse.json({ itinerarios });
  } catch (e: any) {
    console.error("Error en GET /api/admin/itinerarios:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo itinerarios" },
      { status: 500 }
    );
  }
}

