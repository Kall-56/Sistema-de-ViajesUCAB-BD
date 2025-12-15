import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

// POST: Agregar un servicio al itinerario de una venta
export async function POST(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  const body = await req.json();
  const { id_venta, id_servicio, fecha_inicio } = body as {
    id_venta: number;
    id_servicio: number;
    fecha_inicio: string;
    // Ignoramos costo_especial si viene en el body - los clientes NO pueden establecerlo
  };

  if (!Number.isInteger(id_venta) || !Number.isInteger(id_servicio) || !fecha_inicio) {
    return NextResponse.json(
      { error: "id_venta, id_servicio y fecha_inicio son requeridos" },
      { status: 400 }
    );
  }

  try {
    // Verificar que la venta pertenece al cliente
    const { rows: ventaRows } = await pool.query(
      `SELECT fk_cliente FROM venta WHERE id_venta = $1`,
      [id_venta]
    );

    if (!ventaRows?.length) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    if (ventaRows[0].fk_cliente !== clienteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Usar función almacenada agregar_item_itinerario
    // IMPORTANTE: Los clientes NO pueden establecer costo_especial (solo admin/proveedor)
    // La función ahora solo acepta: i_id_venta, i_id_servicio, i_fecha_inicio (date)
    const { rows } = await pool.query(
      `SELECT agregar_item_itinerario($1, $2, $3::date) AS id_itinerario`,
      [
        id_venta,
        id_servicio,
        fecha_inicio,
      ]
    );

    const idItinerario = rows[0]?.id_itinerario;
    if (!idItinerario) {
      throw new Error("Error agregando item al itinerario");
    }

    return NextResponse.json({ ok: true, id_itinerario: idItinerario }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error agregando item al itinerario" },
      { status: 500 }
    );
  }
}

