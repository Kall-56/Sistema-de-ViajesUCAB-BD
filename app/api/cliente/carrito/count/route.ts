import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";

// GET: Obtener conteo de items en el carrito
export async function GET() {
  const c = cookies().get("viajesucab_session");
  if (!c?.value) {
    return NextResponse.json({ count: 0 });
  }

  let session: any;
  try {
    session = JSON.parse(c.value);
  } catch {
    return NextResponse.json({ count: 0 });
  }

  const clienteId = Number(session?.clienteId);
  if (!Number.isInteger(clienteId) || clienteId <= 0) {
    return NextResponse.json({ count: 0 });
  }

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

