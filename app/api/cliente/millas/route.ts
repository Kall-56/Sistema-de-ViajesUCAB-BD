import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * GET /api/cliente/millas
 * 
 * Obtener el saldo de millas del cliente.
 */
export async function GET() {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    // Obtener el método de pago de millas del cliente
    const { rows } = await pool.query(
      `
      SELECT 
        id_metodo_pago,
        cantidad_millas
      FROM metodo_pago
      WHERE fk_cliente = $1
        AND tipo_metodo_pago = 'milla'
      LIMIT 1
      `,
      [clienteId]
    );

    if (!rows?.length) {
      return NextResponse.json({
        cantidad_millas: 0,
        id_metodo_pago: null
      });
    }

    return NextResponse.json({
      cantidad_millas: Number(rows[0].cantidad_millas) || 0,
      id_metodo_pago: rows[0].id_metodo_pago
    });
  } catch (e: any) {
    console.error("Error obteniendo millas:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo millas" },
      { status: 500 }
    );
  }
}
