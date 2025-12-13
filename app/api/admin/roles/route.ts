import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// GET: Listar todos los roles
export async function GET() {
  const auth = requirePermission(1);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { rows } = await pool.query(`SELECT * FROM listar_roles()`);
    return NextResponse.json({ roles: rows });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error listando roles" },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo rol (ID autogenerado en backend)
export async function POST(req: Request) {
  const auth = requirePermission(2);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const { nombre, idsPermisos } = body as {
    nombre: string;
    idsPermisos: number[];
  };

  if (!nombre || !Array.isArray(idsPermisos) || idsPermisos.length === 0) {
    return NextResponse.json(
      { error: "nombre e idsPermisos son requeridos" },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Calcular siguiente ID de forma segura
    await client.query(`LOCK TABLE rol IN EXCLUSIVE MODE`);

    const { rows } = await client.query<{ next_id: number }>(`
      SELECT COALESCE(MAX(id), 0) + 1 AS next_id
      FROM rol
    `);

    const nextId = rows[0].next_id;

    // Usar función almacenada insertar_rol
    await client.query(`SELECT insertar_rol($1, $2, $3)`, [
      nextId,
      nombre.trim(),
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
