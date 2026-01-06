import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

/**
 * GET /api/admin/reclamos
 * 
 * Obtener todos los reclamos del sistema (solo admin).
 */
export async function GET() {
  const auth = requirePermission(1); // Permiso de lectura
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  
  // Verificar que sea admin (rolId = 3)
  if (auth.session.rolId !== 3) {
    return NextResponse.json(
      { error: "Solo administradores pueden acceder a esta funcionalidad" },
      { status: 403 }
    );
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT
        r.id,
        r.comentario,
        r.fk_itinerario,
        r.fk_cliente,
        tr.descripcion AS tipo_reclamo,
        tr.id AS id_tipo_reclamo,
        e.nombre AS estado,
        e.id AS id_estado,
        re.fecha_inicio,
        re.fecha_final,
        c.nombre_1,
        c.apellido_1,
        c.nombre_2,
        c.apellido_2,
        c.c_i,
        i.fk_servicio,
        s.nombre AS nombre_servicio,
        v.id_venta
      FROM reclamo r
      JOIN tipo_reclamo tr ON tr.id = r.fk_tipo_reclamo
      JOIN rec_est re ON re.fk_reclamo = r.id
      JOIN estado e ON e.id = re.fk_estado
      JOIN cliente c ON c.id = r.fk_cliente
      JOIN itinerario i ON i.id = r.fk_itinerario
      JOIN servicio s ON s.id = i.fk_servicio
      JOIN venta v ON v.id_venta = i.fk_venta
      WHERE re.fecha_final IS NULL
      ORDER BY re.fecha_inicio DESC
      LIMIT 100
      `
    );

    // Formatear nombre del cliente
    const reclamos = rows.map((r: any) => ({
      id: r.id,
      comentario: r.comentario,
      fk_itinerario: r.fk_itinerario,
      fk_cliente: r.fk_cliente,
      tipo_reclamo: r.tipo_reclamo,
      id_tipo_reclamo: r.id_tipo_reclamo,
      estado: r.estado,
      id_estado: r.id_estado,
      fecha_inicio: r.fecha_inicio,
      fecha_final: r.fecha_final,
      nombre_cliente: `${r.nombre_1} ${r.nombre_2 || ""} ${r.apellido_1} ${r.apellido_2 || ""}`.trim(),
      c_i: r.c_i,
      nombre_servicio: r.nombre_servicio,
      id_venta: r.id_venta,
    }));

    return NextResponse.json({ reclamos });
  } catch (e: any) {
    console.error("Error obteniendo reclamos:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo reclamos" },
      { status: 500 }
    );
  }
}

