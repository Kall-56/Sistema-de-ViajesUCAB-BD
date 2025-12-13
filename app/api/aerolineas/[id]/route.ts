import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/require-admin";

function requireProveedorOrAdmin() {
  const session = getSessionUser();
  if (!session)
    return { ok: false as const, status: 401, error: "No autenticado" };

  const isAdmin = session.rolId === 3;
  const isProveedor = session.rolId === 2 && !!session.proveedorId;

  if (!isAdmin && !isProveedor) {
    return { ok: false as const, status: 403, error: "Solo proveedor o admin" };
  }

  return { ok: true as const, session, isAdmin };
}

async function assertOwnershipIfProveedor(
  servicioId: number,
  session: any,
  isAdmin: boolean
) {
  if (isAdmin) return;

  const { rows } = await pool.query(
    `SELECT fk_proveedor FROM servicio WHERE id = $1 AND tipo_servicio = 'aereo'`,
    [servicioId]
  );
  const fk = rows?.[0]?.fk_proveedor;

  if (!fk) throw new Error("Servicio no existe");
  if (Number(fk) !== Number(session.proveedorId))
    throw new Error("No autorizado para este recurso");
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requireProveedorOrAdmin();
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    await assertOwnershipIfProveedor(id, auth.session, auth.isAdmin);

    const { rows } = await pool.query(
      `SELECT * FROM obtener_servicio_viaje_aereolinea($1)`,
      [id]
    );
    if (!rows?.length)
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    return NextResponse.json({ aerolinea: rows[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 403 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requireProveedorOrAdmin();
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const body = await req.json();
  const {
    nombre,
    descripcion,
    costo_servicio,
    costo_compensacion,
    denominacion,
    millas_otorgadas,
    id_lugar,
    tipo_avion,
    cupo,
    nombre_terminal,
    lugar_terminal,
    links_imagenes,
  } = body;

  if (
    !nombre ||
    !descripcion ||
    costo_servicio == null ||
    costo_compensacion == null ||
    !denominacion ||
    millas_otorgadas == null ||
    !id_lugar ||
    !tipo_avion ||
    cupo == null ||
    !nombre_terminal ||
    !lugar_terminal
  ) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  try {
    await assertOwnershipIfProveedor(id, auth.session, auth.isAdmin);

    const arrLinks: string[] = Array.isArray(links_imagenes)
      ? links_imagenes
      : [];

    const { rows } = await pool.query(
      `SELECT alterar_servicio_viaje_aereolinea($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) AS id`,
      [
        id,
        nombre,
        descripcion,
        Number(costo_servicio),
        Number(costo_compensacion),
        denominacion,
        Number(millas_otorgadas),
        Number(id_lugar),
        tipo_avion,
        Number(cupo),
        nombre_terminal,
        Number(lugar_terminal),
        arrLinks,
      ]
    );

    return NextResponse.json({ ok: true, id: rows[0]?.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 403 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requireProveedorOrAdmin();
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    await assertOwnershipIfProveedor(id, auth.session, auth.isAdmin);

    const { rows } = await pool.query(
      `SELECT eliminar_servicio_viaje_aereolinea($1) AS id`,
      [id]
    );

    return NextResponse.json({ ok: true, id: rows[0]?.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 403 });
  }
}
