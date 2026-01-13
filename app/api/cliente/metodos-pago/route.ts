import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * GET /api/cliente/metodos-pago
 * 
 * Obtener métodos de pago del cliente.
 */
export async function GET() {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        mp.id_metodo_pago,
        mp.tipo_metodo_pago,
        mp.numero_tarjeta,
        mp.codigo_seguridad,
        mp.fecha_vencimiento,
        mp.titular,
        mp.emisor,
        mp.numero_referencia,
        mp.numero_cuenta_destino,
        mp.numero_confirmacion,
        mp.codigo_cuenta,
        mp.numero_cheque,
        mp.nombre_criptomoneda,
        mp.direccion_billetera,
        b.nombre_banco
      FROM metodo_pago mp
      LEFT JOIN banco b ON b.id_banco = mp.fk_banco
      WHERE mp.fk_cliente = $1
      ORDER BY mp.id_metodo_pago DESC
      `,
      [clienteId]
    );

    return NextResponse.json({ metodos: rows });
  } catch (e: any) {
    console.error("Error obteniendo métodos de pago:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo métodos de pago" },
      { status: 500 }
    );
  }
}
