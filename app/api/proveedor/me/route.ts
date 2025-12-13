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

  if (!rows?.length) {
    return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ 
    nombre_proveedor: rows[0].nombre_proveedor,
    nombreProveedor: rows[0].nombre_proveedor, // Alias para compatibilidad
    proveedor: rows[0]
  });
}
