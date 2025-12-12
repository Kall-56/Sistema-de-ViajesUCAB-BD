import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

export async function GET() {
  const auth = requirePermission(1);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { rows } = await pool.query(
    `SELECT id, descripcion FROM permiso ORDER BY id`
  );
  return NextResponse.json({ permisos: rows }, { status: 200 });
}
