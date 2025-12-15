import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

// POST: Agregar un pasajero al carrito (solo guarda la relación, no duplica items)
// El precio se multiplicará en el frontend según la cantidad de pasajeros
export async function POST(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const body = await req.json();
    const { id_pasajero, id_venta } = body as {
      id_pasajero: number;
      id_venta: number;
    };

    if (!Number.isInteger(id_pasajero) || id_pasajero <= 0) {
      return NextResponse.json(
        { error: "ID de pasajero inválido" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(id_venta) || id_venta <= 0) {
      return NextResponse.json(
        { error: "ID de venta inválido" },
        { status: 400 }
      );
    }

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

    // Verificar que el pasajero existe y pertenece al cliente
    const { rows: pasajeroRows } = await pool.query(
      `
      SELECT cp.fk_pasajero
      FROM cliente_pasajeros cp
      WHERE cp.fk_cliente_principal = $1
        AND cp.fk_pasajero = $2
      `,
      [clienteId, id_pasajero]
    );

    if (!pasajeroRows?.length) {
      return NextResponse.json(
        { error: "Pasajero no encontrado o no pertenece a tu cuenta" },
        { status: 404 }
      );
    }

    // Crear tabla intermedia para asociar pasajeros con ventas
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS venta_pasajeros (
        id SERIAL PRIMARY KEY,
        fk_venta INTEGER NOT NULL REFERENCES venta(id_venta) ON DELETE CASCADE,
        fk_pasajero INTEGER NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
        fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fk_venta, fk_pasajero)
      )
      `
    ).catch(() => {}); // Ignorar si ya existe

    // Verificar que no se haya agregado ya este pasajero a esta venta
    const { rows: existeRows } = await pool.query(
      `
      SELECT id FROM venta_pasajeros
      WHERE fk_venta = $1 AND fk_pasajero = $2
      `,
      [id_venta, id_pasajero]
    );

    if (existeRows?.length > 0) {
      return NextResponse.json(
        { error: "Este pasajero ya está agregado a esta venta" },
        { status: 400 }
      );
    }

    // Agregar pasajero a la venta
    await pool.query(
      `
      INSERT INTO venta_pasajeros (fk_venta, fk_pasajero)
      VALUES ($1, $2)
      `,
      [id_venta, id_pasajero]
    );

    return NextResponse.json({
      ok: true,
      message: "Pasajero agregado al carrito exitosamente",
    }, { status: 201 });
  } catch (e: any) {
    console.error("Error agregando pasajero al carrito:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error agregando pasajero al carrito" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar un pasajero del carrito
export async function DELETE(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const { searchParams } = new URL(req.url);
    const idVenta = searchParams.get("id_venta");
    const idPasajero = searchParams.get("id_pasajero");

    if (!idVenta || !idPasajero) {
      return NextResponse.json(
        { error: "ID de venta e ID de pasajero son requeridos" },
        { status: 400 }
      );
    }

    const ventaId = Number(idVenta);
    const pasajeroId = Number(idPasajero);

    if (!Number.isInteger(ventaId) || ventaId <= 0 || !Number.isInteger(pasajeroId) || pasajeroId <= 0) {
      return NextResponse.json(
        { error: "IDs inválidos" },
        { status: 400 }
      );
    }

    // Verificar que la venta pertenece al cliente
    const { rows: ventaRows } = await pool.query(
      `SELECT fk_cliente FROM venta WHERE id_venta = $1`,
      [ventaId]
    );

    if (!ventaRows?.length || ventaRows[0].fk_cliente !== clienteId) {
      return NextResponse.json(
        { error: "Venta no encontrada o no autorizada" },
        { status: 404 }
      );
    }

    // Eliminar relación pasajero-venta
    await pool.query(
      `
      DELETE FROM venta_pasajeros
      WHERE fk_venta = $1 AND fk_pasajero = $2
      `,
      [ventaId, pasajeroId]
    );

    return NextResponse.json({
      ok: true,
      message: "Pasajero eliminado del carrito exitosamente",
    });
  } catch (e: any) {
    console.error("Error eliminando pasajero del carrito:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error eliminando pasajero del carrito" },
      { status: 500 }
    );
  }
}
