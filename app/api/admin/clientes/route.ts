import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

export async function GET() {
  const auth = requirePermission(1);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { rows } = await pool.query(`
    SELECT id,
           CONCAT(nombre_1,' ',COALESCE(nombre_2,''),' ',apellido_1,' ',COALESCE(apellido_2,'')) AS nombre
    FROM cliente
    ORDER BY id DESC
    LIMIT 200
  `);

  return NextResponse.json({ clientes: rows }, { status: 200 });
}
