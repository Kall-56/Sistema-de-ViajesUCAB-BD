import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

/**
 * GET /api/admin/reembolsos
 * 
 * Obtener todos los reembolsos del sistema (solo admin).
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
        r.id_reembolso,
        r.monto_reembolso,
        r.fk_venta,
        v.monto_total AS monto_original,
        v.fk_cliente,
        CONCAT(c.nombre_1, ' ', COALESCE(c.nombre_2, ''), ' ', c.apellido_1, ' ', COALESCE(c.apellido_2, '')) AS nombre_cliente,
        c.c_i AS ci_cliente,
        e.nombre AS estado_venta,
        ve.fecha_inicio AS fecha_reembolso,
        (SELECT MIN(i.fecha_hora_inicio) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS fecha_viaje,
        CASE 
          WHEN e.nombre = 'Cancelado' THEN v.monto_total - r.monto_reembolso
          ELSE 0
        END AS penalizacion
      FROM reembolso r
      JOIN venta v ON v.id_venta = r.fk_venta
      JOIN cliente c ON c.id = v.fk_cliente
      JOIN ven_est ve ON ve.fk_venta = v.id_venta
      JOIN estado e ON e.id = ve.fk_estado
      WHERE ve.fecha_fin IS NULL
        AND e.nombre IN ('Reembolsado', 'Cancelado')
      ORDER BY ve.fecha_inicio DESC
      LIMIT 100
      `
    );

    return NextResponse.json({ reembolsos: rows });
  } catch (e: any) {
    console.error("Error obteniendo reembolsos:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo reembolsos" },
      { status: 500 }
    );
  }
}
