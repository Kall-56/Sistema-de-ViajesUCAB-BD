import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

/**
 * GET /api/admin/resenas
 * 
 * Obtener todas las reseñas del sistema (solo admin).
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
        r.calificacion_resena,
        r.comentario,
        r.fk_itinerario,
        c.nombre_1,
        c.nombre_2,
        c.apellido_1,
        c.apellido_2,
        c.c_i,
        i.fk_servicio,
        s.nombre AS nombre_servicio,
        v.id_venta
      FROM resena r
      JOIN itinerario i ON i.id = r.fk_itinerario
      JOIN venta v ON v.id_venta = i.fk_venta
      JOIN cliente c ON c.id = v.fk_cliente
      JOIN servicio s ON s.id = i.fk_servicio
      ORDER BY r.id DESC
      LIMIT 100
      `
    );

    // Formatear nombre del cliente
    const reseñas = rows.map((r: any) => ({
      id: r.id,
      calificacion_resena: Number(r.calificacion_resena),
      comentario: r.comentario,
      fk_itinerario: r.fk_itinerario,
      nombre_cliente: `${r.nombre_1} ${r.nombre_2 || ""} ${r.apellido_1} ${r.apellido_2 || ""}`.trim(),
      c_i: r.c_i,
      nombre_servicio: r.nombre_servicio,
      id_venta: r.id_venta,
    }));

    return NextResponse.json({ reseñas });
  } catch (e: any) {
    console.error("Error obteniendo reseñas:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo reseñas" },
      { status: 500 }
    );
  }
}
