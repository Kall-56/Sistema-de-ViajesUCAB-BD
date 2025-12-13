import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// GET: Obtener un rol específico con sus permisos
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requirePermission(1);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rolId = Number(params.id);
  if (!Number.isInteger(rolId) || rolId <= 0)
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const { rows } = await pool.query(
      `SELECT * FROM obtener_rol_permisos($1)`,
      [rolId]
    );

    if (!rows?.length)
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });

    return NextResponse.json({ rol: rows[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}

// PUT: Actualizar nombre y permisos del rol
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requirePermission(3);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rolId = Number(params.id);
  if (!Number.isInteger(rolId) || rolId <= 0)
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const body = await req.json();
  const { nombre, idsPermisos } = body as {
    nombre?: string;
    idsPermisos?: number[];
  };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Actualizar nombre si se proporciona
    if (typeof nombre === "string" && nombre.trim().length > 0) {
      await client.query(`SELECT actualizar_nombre_rol($1, $2)`, [
        rolId,
        nombre.trim(),
      ]);
    }

    // Actualizar permisos si se proporcionan
    if (Array.isArray(idsPermisos)) {
      const { rows } = await client.query(
        `SELECT * FROM obtener_rol_permisos($1)`,
        [rolId]
      );

      const currentIds: number[] = rows?.[0]?.ids_permisos ?? [];
      const newSet = new Set(idsPermisos);
      const oldSet = new Set(currentIds);

      const toAdd = idsPermisos.filter((x) => !oldSet.has(x));
      const toRemove = currentIds.filter((x) => !newSet.has(x));

      if (toAdd.length > 0) {
        await client.query(`SELECT agregar_permisos_rol($1, $2)`, [
          rolId,
          toAdd,
        ]);
      }

      if (toRemove.length > 0) {
        await client.query(`SELECT eliminar_permisos_rol($1, $2)`, [
          rolId,
          toRemove,
        ]);
      }
    }

    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
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

// DELETE: Eliminar rol usando función almacenada segura
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requirePermission(4);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rolId = Number(params.id);
  if (!Number.isInteger(rolId) || rolId <= 0)
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    // La función eliminar_rol_seguro valida usuarios asignados y elimina el rol
    await pool.query(`SELECT eliminar_rol_seguro($1)`, [rolId]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = String(e?.message ?? "");

    // Si hay usuarios asignados, retornar 409 Conflict
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
