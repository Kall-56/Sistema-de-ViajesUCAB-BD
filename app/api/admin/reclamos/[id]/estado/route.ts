import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

/**
 * PUT /api/admin/reclamos/[id]/estado
 * 
 * Cambiar el estado de un reclamo (solo admin).
 * 
 * Body:
 * - id_estado: ID del nuevo estado
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requirePermission(3); // Permiso de actualización
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  
  // Verificar que sea admin (rolId = 3)
  if (auth.session.rolId !== 3) {
    return NextResponse.json(
      { error: "Solo administradores pueden acceder a esta funcionalidad" },
      { status: 403 }
    );
  }

  const idReclamo = Number(params.id);

  if (!Number.isInteger(idReclamo) || idReclamo <= 0) {
    return NextResponse.json(
      { error: "ID de reclamo inválido" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { id_estado } = body as { id_estado: number };

    if (!Number.isInteger(id_estado) || id_estado <= 0) {
      return NextResponse.json(
        { error: "ID de estado inválido" },
        { status: 400 }
      );
    }

    // Verificar que el reclamo existe
    const { rows: reclamoRows } = await pool.query(
      `SELECT id FROM reclamo WHERE id = $1`,
      [idReclamo]
    );

    if (!reclamoRows?.length) {
      return NextResponse.json(
        { error: "Reclamo no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el estado existe
    const { rows: estadoRows } = await pool.query(
      `SELECT id FROM estado WHERE id = $1`,
      [id_estado]
    );

    if (!estadoRows?.length) {
      return NextResponse.json(
        { error: "Estado no encontrado" },
        { status: 404 }
      );
    }

    // Cambiar el estado usando la función de BD
    await pool.query(`SELECT cambiar_estado_reclamo($1, $2)`, [
      idReclamo,
      id_estado,
    ]);

    return NextResponse.json({
      ok: true,
      message: "Estado del reclamo actualizado exitosamente",
    });
  } catch (e: any) {
    console.error("Error cambiando estado del reclamo:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error cambiando estado del reclamo" },
      { status: 500 }
    );
  }
}

