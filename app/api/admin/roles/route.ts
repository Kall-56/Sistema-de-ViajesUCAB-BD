import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// GET: listar roles
export async function GET() {
  const auth = requirePermission(1);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { rows } = await pool.query(`SELECT * FROM listar_roles()`);
  return NextResponse.json({ roles: rows });
}

// POST: crear rol (ID autogenerado en backend)
export async function POST(req: Request) {
  const auth = requirePermission(2); // permiso crear rol
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const { nombre, idsPermisos } = body as {
    nombre: string;
    idsPermisos: number[];
  };

  if (!nombre || !Array.isArray(idsPermisos) || idsPermisos.length === 0) {
    return NextResponse.json(
      { error: "nombre e idsPermisos requeridos" },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Bloqueo de tabla para evitar colisiones al calcular MAX(id)+1
    await client.query(`LOCK TABLE rol IN EXCLUSIVE MODE`);

    const { rows } = await client.query<{ next_id: number }>(`
  SELECT COALESCE(MAX(id), 0) + 1 AS next_id
  FROM rol
`);

    const nextId = rows[0].next_id;

    // insertar_rol es FUNCIÓN
    await client.query(`SELECT insertar_rol($1::int, $2::varchar, $3::int[])`, [
      nextId,
      nombre,
      idsPermisos,
    ]);

    await client.query("COMMIT");

    return NextResponse.json({ ok: true, id: nextId }, { status: 201 });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { error: e?.message ?? "Error creando rol" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
