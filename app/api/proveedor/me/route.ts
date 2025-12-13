import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

export async function GET() {
  const auth = requirePermission(1);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!auth.session.proveedorId) {
    return NextResponse.json({ error: "Solo proveedores" }, { status: 403 });
  }

  const { rows } = await pool.query(
    `SELECT id, nombre_proveedor FROM proveedor WHERE id = $1`,
    [auth.session.proveedorId]
  );

  return NextResponse.json({ proveedor: rows[0] ?? null });
}
