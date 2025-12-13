import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// GET: Listar servicios disponibles para asociar promociones
export async function GET() {
  const auth = requirePermission(1); // lectura
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { rows } = await pool.query(`
    SELECT
      s.id,
      s.nombre,
      s.descripcion,
      s.tipo_servicio,
      s.costo_servicio,
      s.denominacion,
      l.nombre AS lugar_nombre,
      p.nombre_proveedor
    FROM servicio s
    LEFT JOIN lugar l ON l.id = s.fk_lugar
    LEFT JOIN proveedor p ON p.id = s.fk_proveedor
    ORDER BY s.id DESC
    LIMIT 500
  `);

  return NextResponse.json({ servicios: rows });
}

