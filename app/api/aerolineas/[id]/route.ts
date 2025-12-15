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

    // Verificar si hay itinerarios que usan este servicio
    const { rows: itinerarioRows } = await pool.query(
      `SELECT COUNT(*) as count FROM itinerario WHERE fk_servicio = $1`,
      [id]
    );

    const countItinerarios = itinerarioRows?.[0]?.count ? Number(itinerarioRows[0].count) : 0;

    // Verificar si hay descuentos asociados
    const { rows: descuentoRows } = await pool.query(
      `SELECT COUNT(*) as count FROM descuento WHERE fk_servicio = $1`,
      [id]
    );

    const countDescuentos = descuentoRows?.[0]?.count ? Number(descuentoRows[0].count) : 0;

    // Si hay itinerarios, no se puede eliminar
    if (countItinerarios > 0) {
      return NextResponse.json(
        { 
          error: `No se puede eliminar el servicio porque tiene ${countItinerarios} itinerario(s) asociado(s). Si eres proveedor, contacta con el administrador para gestionar estos itinerarios. Si eres administrador, elimina primero los itinerarios desde la sección "Itinerarios" en el panel de administración.`,
          tiene_itinerarios: true,
          cantidad_itinerarios: countItinerarios
        },
        { status: 400 }
      );
    }

    // Si hay descuentos, eliminarlos automáticamente antes de eliminar el servicio
    if (countDescuentos > 0) {
      try {
        await pool.query(`DELETE FROM descuento WHERE fk_servicio = $1`, [id]);
        // Continuar con la eliminación del servicio
      } catch (descError: any) {
        return NextResponse.json(
          { 
            error: `No se puede eliminar el servicio porque tiene ${countDescuentos} descuento(s) asociado(s) y no se pudieron eliminar automáticamente. Contacta con el administrador.`,
            tiene_descuentos: true,
            cantidad_descuentos: countDescuentos
          },
          { status: 400 }
        );
      }
    }

    // Verificar si está en algún paquete
    const { rows: paqueteRows } = await pool.query(
      `SELECT COUNT(*) as count FROM paquete_servicio WHERE fk_servicio = $1`,
      [id]
    );

    const countPaquetes = paqueteRows?.[0]?.count ? Number(paqueteRows[0].count) : 0;

    if (countPaquetes > 0) {
      return NextResponse.json(
        { 
          error: `No se puede eliminar el servicio porque está incluido en ${countPaquetes} paquete(s). Elimine primero el servicio de los paquetes relacionados.`,
          tiene_paquetes: true,
          cantidad_paquetes: countPaquetes
        },
        { status: 400 }
      );
    }

    // Si todo está bien, eliminar el servicio
    const { rows } = await pool.query(
      `SELECT eliminar_servicio_viaje_aereolinea($1) AS id`,
      [id]
    );

    return NextResponse.json({ ok: true, id: rows[0]?.id });
  } catch (e: any) {
    // Si el error es de foreign key constraint, dar un mensaje más claro
    if (e?.message?.includes("foreign key constraint")) {
      if (e?.message?.includes("descuento_servicio_fk")) {
        return NextResponse.json(
          { 
            error: "No se puede eliminar el servicio porque tiene descuentos asociados. Contacta con el administrador para gestionar estos descuentos o intenta nuevamente (se eliminarán automáticamente)." 
          },
          { status: 400 }
        );
      }
      if (e?.message?.includes("paquete_servicio_fk")) {
        return NextResponse.json(
          { 
            error: "No se puede eliminar el servicio porque está incluido en uno o más paquetes. Elimine primero el servicio de los paquetes relacionados." 
          },
          { status: 400 }
        );
      }
      if (e?.message?.includes("itinerario") || e?.message?.includes("fk_servicio")) {
        return NextResponse.json(
          { 
            error: "No se puede eliminar el servicio porque tiene itinerarios asociados. Si eres proveedor, contacta con el administrador. Si eres administrador, elimina primero los itinerarios desde la sección 'Itinerarios'." 
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { 
          error: "No se puede eliminar el servicio porque está siendo utilizado en otras partes del sistema. Contacta con el administrador para más información." 
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 403 });
  }
}
