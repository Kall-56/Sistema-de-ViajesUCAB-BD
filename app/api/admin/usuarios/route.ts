import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// GET: listar usuarios (incluye activo) con información de cliente/proveedor
export async function GET() {
  const auth = requirePermission(1);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Usar query con JOINs para obtener nombres de cliente/proveedor
  const { rows } = await pool.query(`
    SELECT
      u.id,
      u.email,
      u.fk_rol,
      u.fk_cliente,
      u.fk_proveedor,
      u.activo,
      r.nombre AS rol_nombre,
      CASE
        WHEN u.fk_cliente IS NOT NULL THEN
          CONCAT(c.nombre_1, ' ', COALESCE(c.nombre_2, ''), ' ', c.apellido_1, ' ', COALESCE(c.apellido_2, ''))
        WHEN u.fk_proveedor IS NOT NULL THEN
          p.nombre_proveedor
        ELSE
          NULL
      END AS nombre_asociado
    FROM usuario u
    LEFT JOIN rol r ON r.id = u.fk_rol
    LEFT JOIN cliente c ON c.id = u.fk_cliente
    LEFT JOIN proveedor p ON p.id = u.fk_proveedor
    ORDER BY u.id DESC
  `);
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
