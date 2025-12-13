import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

export async function GET() {
  const auth = requirePermission(1);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Lista simple para dropdown
  const { rows } = await pool.query(`
    SELECT id, nombre
    FROM lugar
    ORDER BY nombre ASC
    LIMIT 500
  `);

  return NextResponse.json({ lugares: rows });
}
