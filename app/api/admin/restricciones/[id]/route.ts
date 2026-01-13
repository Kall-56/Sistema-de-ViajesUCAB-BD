import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

/**
 * DELETE /api/admin/restricciones/[id]
 * 
 * Eliminar una restricción específica.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const idRestriccion = Number(params.id);

  if (!Number.isInteger(idRestriccion) || idRestriccion <= 0) {
    return NextResponse.json(
      { error: "ID de restricción inválido" },
      { status: 400 }
    );
  }

  try {
    // Verificar que la restricción existe
    const { rows: restriccionRows } = await pool.query(
      `SELECT * FROM restriccion WHERE id_restriccion = $1`,
      [idRestriccion]
    );

    if (!restriccionRows?.length) {
      return NextResponse.json(
        { error: "Restricción no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la restricción
    await pool.query(
      `DELETE FROM restriccion WHERE id_restriccion = $1`,
      [idRestriccion]
    );

    return NextResponse.json({
      ok: true,
      message: "Restricción eliminada exitosamente"
    });
  } catch (e: any) {
    console.error("Error eliminando restricción:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error eliminando restricción" },
      { status: 500 }
    );
  }
}
