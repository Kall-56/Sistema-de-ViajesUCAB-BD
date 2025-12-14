import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

// GET: Obtener conteo de items en el carrito
export async function GET() {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ count: 0 });
  }

  const clienteId = auth.session.clienteId!;

  try {
    // Contar ventas pendientes con items (estas son las que están en el carrito)
    const { rows } = await pool.query(
      `
      SELECT COUNT(DISTINCT v.id_venta) AS total
      FROM venta v
      WHERE v.fk_cliente = $1
        AND EXISTS (
          SELECT 1 FROM ven_est ve
          JOIN estado e ON e.id = ve.fk_estado
          WHERE ve.fk_venta = v.id_venta
            AND e.nombre = 'pendiente'
        )
        AND EXISTS (
          SELECT 1 FROM itinerario i WHERE i.fk_venta = v.id_venta
        )
      `,
      [clienteId]
    );

    const count = Number(rows[0]?.total || 0);
    return NextResponse.json({ count });
  } catch (e: any) {
    console.error("Error contando carrito:", e);
    return NextResponse.json({ count: 0 });
  }
}

