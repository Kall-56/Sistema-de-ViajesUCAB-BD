import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

// GET: Obtener detalles de una venta específica con su itinerario
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;
  const idVenta = Number(params.id);

  if (!Number.isInteger(idVenta) || idVenta <= 0) {
    return NextResponse.json({ error: "ID de venta inválido" }, { status: 400 });
  }

  try {
    // Verificar que la venta pertenece al cliente
    const { rows: ventaRows } = await pool.query(
      `SELECT fk_cliente FROM venta WHERE id_venta = $1`,
      [idVenta]
    );

    if (!ventaRows?.length) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    if (ventaRows[0].fk_cliente !== clienteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener itinerario usando función almacenada
    const { rows } = await pool.query(
      `SELECT * FROM obtener_itinerario_venta($1)`,
      [idVenta]
    );

    // Obtener información de la venta
    const { rows: ventaInfo } = await pool.query(
      `SELECT id_venta, monto_total, monto_compensacion FROM venta WHERE id_venta = $1`,
      [idVenta]
    );

    return NextResponse.json({
      venta: ventaInfo[0],
      items: rows || [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo venta" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una venta completa (itinerario completo)
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;
  const idVenta = Number(params.id);

  if (!Number.isInteger(idVenta) || idVenta <= 0) {
    return NextResponse.json({ error: "ID de venta inválido" }, { status: 400 });
  }

  try {
    // Verificar que la venta pertenece al cliente y está pendiente
    const { rows: ventaRows } = await pool.query(
      `
      SELECT v.fk_cliente, e.nombre AS estado
      FROM venta v
      JOIN ven_est ve ON ve.fk_venta = v.id_venta
      JOIN estado e ON e.id = ve.fk_estado
      WHERE v.id_venta = $1
      ORDER BY ve.fk_venta DESC
      LIMIT 1
      `,
      [idVenta]
    );

    if (!ventaRows?.length) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    if (ventaRows[0].fk_cliente !== clienteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Solo permitir eliminar si está pendiente
    if (ventaRows[0].estado !== "pendiente") {
      return NextResponse.json(
        { error: "Solo se pueden eliminar itinerarios pendientes" },
        { status: 400 }
      );
    }

    // Eliminar todos los items del itinerario primero
    const { rows: itemsRows } = await pool.query(
      `SELECT id FROM itinerario WHERE fk_venta = $1`,
      [idVenta]
    );

    for (const item of itemsRows) {
      await pool.query(`SELECT eliminar_item_itinerario($1)`, [item.id]);
    }

    // Eliminar estados de venta
    await pool.query(`DELETE FROM ven_est WHERE fk_venta = $1`, [idVenta]);

    // Eliminar la venta
    await pool.query(`DELETE FROM venta WHERE id_venta = $1`, [idVenta]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error eliminando venta" },
      { status: 500 }
    );
  }
}
