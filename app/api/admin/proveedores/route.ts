import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

export async function GET() {
  const auth = requirePermission(1);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { rows } = await pool.query(`
    SELECT id, nombre_proveedor AS nombre
    FROM proveedor
    ORDER BY id DESC
    LIMIT 200
  `);

  return NextResponse.json({ proveedores: rows }, { status: 200 });
}
