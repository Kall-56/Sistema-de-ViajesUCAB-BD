import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// DELETE: Eliminar un itinerario específico (solo admin)
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requirePermission(4); // Permiso de eliminación
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const idItinerario = Number(params.id);
  if (!Number.isInteger(idItinerario) || idItinerario <= 0) {
    return NextResponse.json({ error: "ID de itinerario inválido" }, { status: 400 });
  }

  try {
    // Verificar que el itinerario existe
    const { rows: checkRows } = await pool.query(
      `SELECT i.id, i.fk_venta, i.fk_servicio, s.costo_servicio, s.denominacion, 
              COALESCE(v.costo_compensacion, 0) as costo_compensacion
       FROM itinerario i
       JOIN servicio s ON s.id = i.fk_servicio
       LEFT JOIN viaje v ON s.fk_viaje = v.id
       WHERE i.id = $1`,
      [idItinerario]
    );

    if (!checkRows?.length) {
      return NextResponse.json({ error: "Itinerario no encontrado" }, { status: 404 });
    }

    const itinerario = checkRows[0];
    const idVenta = itinerario.fk_venta;
    const costo = Number(itinerario.costo_especial || itinerario.costo_servicio);
    const compensacion = Number(itinerario.costo_compensacion || 0);
    const denominacion = itinerario.denominacion;

    // Eliminar el itinerario usando la función almacenada
    await pool.query(`SELECT eliminar_item_itinerario($1)`, [idItinerario]);

    return NextResponse.json({ ok: true, id: idItinerario });
  } catch (e: any) {
    // Si el error es porque la venta no está pendiente, dar un mensaje más claro
    if (e?.message?.includes("no se puede modificar") || e?.message?.includes("pendiente")) {
      return NextResponse.json(
        { 
          error: "No se puede eliminar este itinerario porque la venta ya no está en estado pendiente. Debe cambiar el estado de la venta primero." 
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: e?.message ?? "Error eliminando itinerario" },
      { status: 500 }
    );
  }
}

