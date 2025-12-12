import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// GET: listar usuarios (incluye activo)
export async function GET() {
  const auth = requirePermission(1);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { rows } = await pool.query(`SELECT * FROM listar_usuarios()`);
  return NextResponse.json({ usuarios: rows });
}

// POST: crear usuario usando insertar_usuario(email, contraseña, rol, cliente, proveedor)
export async function POST(req: Request) {
  const auth = requirePermission(2);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const { email, contraseña, rolId, clienteId, proveedorId } = body as {
    email: string;
    contraseña: string;
    rolId: number;
    clienteId: number | null;
    proveedorId: number | null;
  };

  if (!email || !contraseña || !rolId) {
    return NextResponse.json(
      { error: "email, contraseña, rolId requeridos" },
      { status: 400 }
    );
  }

  // Respeta tu CHECK: cliente/proveedor puede ser null o uno solo
  const both = clienteId != null && proveedorId != null;
  if (both)
    return NextResponse.json(
      { error: "clienteId y proveedorId no pueden venir ambos" },
      { status: 400 }
    );

  try {
    const result = await pool.query(
      `SELECT insertar_usuario($1, $2, $3, $4, $5) as new_id`,
      [email, contraseña, rolId, clienteId, proveedorId]
    );
    const newId = result.rows?.[0]?.new_id;
    return NextResponse.json({ ok: true, id: newId }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error creando usuario" },
      { status: 500 }
    );
  }
}
