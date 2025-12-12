import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const auth = requirePermission(1);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rolId = Number(ctx.params.id);
  if (Number.isNaN(rolId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  // Esto ES usar SP/función (Postgres functions se invocan con SELECT)
  const { rows } = await pool.query(`SELECT * FROM obtener_rol_permisos($1)`, [
    rolId,
  ]);

  if (!rows[0]) {
    return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ rol: rows[0] }, { status: 200 });
}

// PUT: actualizar nombre y permisos
export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const auth = requirePermission(3);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rolId = Number(ctx.params.id);
  if (Number.isNaN(rolId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const body = await req.json();
  const { nombre, idsPermisos } = body as {
    nombre?: string;
    idsPermisos?: number[];
  };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Nombre (opcional)
    if (typeof nombre === "string") {
      const nuevo = nombre.trim();
      if (nuevo.length > 0) {
        // Opción A (segura, sin SP nuevo): UPDATE directo
        await client.query(`SELECT actualizar_nombre_rol($1,$2)`, [
          rolId,
          nuevo,
        ]);

        // Opción B (100% SP): crea actualizar_nombre_rol(id, nombre) y usa:
        // await client.query(`SELECT actualizar_nombre_rol($1,$2)`, [rolId, nuevo]);
      }
    }

    // 2) Permisos (opcional): aquí ya estás usando funciones SP
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

      if (toAdd.length) {
        await client.query(`SELECT agregar_permisos_rol($1, $2)`, [
          rolId,
          toAdd,
        ]);
      }

      if (toRemove.length) {
        await client.query(`SELECT eliminar_permisos_rol($1, $2)`, [
          rolId,
          toRemove,
        ]);
      }
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

// DELETE: eliminar rol usando SP seguro
export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const auth = requirePermission(4);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rolId = Number(ctx.params.id);
  if (Number.isNaN(rolId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  try {
    // Esto centraliza la regla en la BD:
    // - valida usuarios asignados
    // - borra permiso_rol
    // - borra rol
    await pool.query(`SELECT eliminar_rol_seguro($1)`, [rolId]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const msg = String(e?.message ?? "");

    // Si tu SP lanza excepción cuando hay usuarios asignados, lo devolvemos como 409.
    // (Puedes ajustar la condición si tu mensaje es distinto.)
    if (
      msg.toLowerCase().includes("no se puede eliminar") ||
      msg.toLowerCase().includes("usuarios")
    ) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }

    return NextResponse.json(
      { error: msg || "Error eliminando rol" },
      { status: 500 }
    );
  }
}
