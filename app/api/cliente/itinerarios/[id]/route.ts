import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

// DELETE: Eliminar un item del itinerario
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;
  const idItinerario = Number(params.id);

  if (!Number.isInteger(idItinerario) || idItinerario <= 0) {
    return NextResponse.json({ error: "ID de itinerario inválido" }, { status: 400 });
  }

  try {
    // Verificar que el item pertenece a una venta del cliente
    const { rows } = await pool.query(
      `
      SELECT v.fk_cliente
      FROM itinerario i
      JOIN venta v ON v.id_venta = i.fk_venta
      WHERE i.id = $1
      `,
      [idItinerario]
    );

    if (!rows?.length) {
      return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
    }

    if (rows[0].fk_cliente !== clienteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Usar función almacenada eliminar_item_itinerario
    await pool.query(`SELECT eliminar_item_itinerario($1)`, [idItinerario]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error eliminando item" },
      { status: 500 }
    );
  }
}

