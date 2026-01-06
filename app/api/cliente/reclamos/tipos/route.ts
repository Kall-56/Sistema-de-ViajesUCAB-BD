import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * GET /api/cliente/reclamos/tipos
 * 
 * Obtener todos los tipos de reclamo disponibles (público).
 */
export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT id, descripcion FROM tipo_reclamo ORDER BY id`
    );

    return NextResponse.json({ tipos: rows });
  } catch (e: any) {
    console.error("Error obteniendo tipos de reclamo:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo tipos de reclamo" },
      { status: 500 }
    );
  }
}

