import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";

// GET: Obtener items del carrito del cliente
export async function GET() {
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

  try {
    // Obtener ventas pendientes que están "en carrito" (marcadas para pago)
    // Por ahora, consideramos que una venta pendiente con items está en carrito
    const { rows } = await pool.query(
      `
      SELECT
        v.id_venta,
        v.monto_total,
        (SELECT COUNT(*) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS cantidad_items,
        (SELECT MIN(i.fecha_hora_inicio) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS fecha_inicio_minima,
        (SELECT MAX(i.fecha_hora_fin) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS fecha_fin_maxima
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
      ORDER BY v.id_venta DESC
      `,
      [clienteId]
    );

    return NextResponse.json({ items: rows });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo carrito" },
      { status: 500 }
    );
  }
}

// POST: Agregar itinerario al carrito (marcar venta como lista para pago)
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
  const { id_venta } = body as { id_venta: number };

  if (!Number.isInteger(id_venta) || id_venta <= 0) {
    return NextResponse.json({ error: "ID de venta inválido" }, { status: 400 });
  }

  try {
    // Verificar que la venta pertenece al cliente y tiene items
    const { rows: ventaRows } = await pool.query(
      `
      SELECT v.fk_cliente, 
             (SELECT COUNT(*) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS cantidad_items
      FROM venta v
      WHERE v.id_venta = $1
      `,
      [id_venta]
    );

    if (!ventaRows?.length) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    if (ventaRows[0].fk_cliente !== clienteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (ventaRows[0].cantidad_items === 0) {
      return NextResponse.json(
        { error: "El itinerario debe tener al menos un servicio" },
        { status: 400 }
      );
    }

    // Verificar que no tenga fechas pasadas
    const { rows: fechasRows } = await pool.query(
      `
      SELECT MIN(i.fecha_hora_inicio) AS fecha_min
      FROM itinerario i
      WHERE i.fk_venta = $1
      `,
      [id_venta]
    );

    if (fechasRows[0]?.fecha_min) {
      const fechaMin = new Date(fechasRows[0].fecha_min);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaMin < hoy) {
        return NextResponse.json(
          { error: "No se puede agregar al carrito un itinerario con fechas pasadas" },
          { status: 400 }
        );
      }
    }

    // La venta ya está pendiente, solo verificamos que esté bien
    // En el futuro podríamos agregar un campo "en_carrito" si es necesario

    return NextResponse.json({ ok: true, id_venta });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error agregando al carrito" },
      { status: 500 }
    );
  }
}

