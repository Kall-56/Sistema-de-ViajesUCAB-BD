import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

/**
 * GET /api/admin/estados
 * 
 * Obtener todos los estados disponibles (solo admin).
 * Útil para cambiar estados de reclamos.
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
      `SELECT id, nombre FROM estado ORDER BY id`
    );

    return NextResponse.json({ estados: rows });
  } catch (e: any) {
    console.error("Error obteniendo estados:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo estados" },
      { status: 500 }
    );
  }
}
