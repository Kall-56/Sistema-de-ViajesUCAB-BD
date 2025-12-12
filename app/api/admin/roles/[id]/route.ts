import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const auth = requirePermission(1);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rolId = Number(ctx.params.id);
  const { rows } = await pool.query(`SELECT * FROM obtener_rol_permisos($1)`, [
    rolId,
  ]);
  if (!rows[0])
    return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
  return NextResponse.json({ rol: rows[0] }, { status: 200 });
}

// PUT: actualizar nombre y permisos (diff usando agregar_permisos_rol y eliminar_permisos_rol)
export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const auth = requirePermission(3);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rolId = Number(ctx.params.id);
  const body = await req.json();
  const { nombre, idsPermisos } = body as {
    nombre?: string;
    idsPermisos?: number[];
  };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // nombre (opcional)
    if (typeof nombre === "string" && nombre.trim().length > 0) {
      await client.query(`UPDATE rol SET nombre = $1 WHERE id = $2`, [
        nombre.trim(),
        rolId,
      ]);
    }

    // permisos (opcional)
    if (Array.isArray(idsPermisos)) {
      const current = await client.query(
        `SELECT * FROM obtener_rol_permisos($1)`,
        [rolId]
      );
      const currentIds: number[] = current.rows?.[0]?.ids_permisos ?? [];

      const newSet = new Set(idsPermisos);
      const oldSet = new Set(currentIds);

      const toAdd = idsPermisos.filter((x) => !oldSet.has(x));
      const toRemove = currentIds.filter((x) => !newSet.has(x));

      if (toAdd.length)
        await client.query(`SELECT agregar_permisos_rol($1, $2)`, [
          rolId,
          toAdd,
        ]);
      if (toRemove.length)
        await client.query(`SELECT eliminar_permisos_rol($1, $2)`, [
          rolId,
          toRemove,
        ]);
    }

    await client.query("COMMIT");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { error: e?.message ?? "Error actualizando rol" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// DELETE: eliminar rol (si no hay usuarios asociados)
export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const auth = requirePermission(4);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rolId = Number(ctx.params.id);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const users = await client.query(
      `SELECT COUNT(*)::int as c FROM usuario WHERE fk_rol = $1`,
      [rolId]
    );
    if ((users.rows[0]?.c ?? 0) > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "No se puede eliminar: hay usuarios asignados a este rol" },
        { status: 409 }
      );
    }

    await client.query(`DELETE FROM permiso_rol WHERE fk_rol = $1`, [rolId]);
    await client.query(`DELETE FROM rol WHERE id = $1`, [rolId]);

    await client.query("COMMIT");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { error: e?.message ?? "Error eliminando rol" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
