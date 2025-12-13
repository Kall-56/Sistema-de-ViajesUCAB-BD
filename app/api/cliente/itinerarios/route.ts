import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";

// POST: Agregar un servicio al itinerario de una venta
export async function POST(req: Request) {
  const c = cookies().get("viajesucab_session");
  if (!c?.value) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let session: any;
  try {
    session = JSON.parse(c.value);
  } catch {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  const clienteId = Number(session?.clienteId);
  if (!Number.isInteger(clienteId) || clienteId <= 0) {
    return NextResponse.json({ error: "Cliente no identificado" }, { status: 403 });
  }

  const body = await req.json();
  const { id_venta, id_servicio, fecha_inicio, fecha_fin, costo_especial } = body as {
    id_venta: number;
    id_servicio: number;
    fecha_inicio: string;
    fecha_fin: string;
    costo_especial?: number | null;
  };

  if (!Number.isInteger(id_venta) || !Number.isInteger(id_servicio) || !fecha_inicio || !fecha_fin) {
    return NextResponse.json(
      { error: "id_venta, id_servicio, fecha_inicio y fecha_fin son requeridos" },
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
    const { rows } = await pool.query(
      `SELECT agregar_item_itinerario($1, $2, $3::date, $4::date, $5::numeric) AS id_itinerario`,
      [
        id_venta,
        id_servicio,
        fecha_inicio,
        fecha_fin,
        costo_especial ?? null,
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

