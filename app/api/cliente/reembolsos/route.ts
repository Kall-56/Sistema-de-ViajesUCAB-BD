import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * GET /api/cliente/reembolsos
 * 
 * Obtener historial de reembolsos del cliente.
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
        r.id_reembolso,
        r.monto_reembolso,
        r.fk_venta,
        v.monto_total AS monto_original,
        e.nombre AS estado_venta,
        ve.fecha_inicio AS fecha_reembolso,
        (SELECT MIN(i.fecha_hora_inicio) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS fecha_viaje,
        (SELECT array_agg(s.nombre) 
         FROM itinerario i 
         JOIN servicio s ON s.id = i.fk_servicio 
         WHERE i.fk_venta = v.id_venta) AS servicios
      FROM reembolso r
      JOIN venta v ON v.id_venta = r.fk_venta
      JOIN ven_est ve ON ve.fk_venta = v.id_venta
      JOIN estado e ON e.id = ve.fk_estado
      WHERE v.fk_cliente = $1
        AND ve.fecha_fin IS NULL
        AND e.nombre = 'Reembolsado'
      ORDER BY ve.fecha_inicio DESC
      `,
      [clienteId]
    );

    return NextResponse.json({ reembolsos: rows });
  } catch (e: any) {
    console.error("Error obteniendo reembolsos:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo reembolsos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cliente/reembolsos
 * 
 * Solicitar reembolso de una venta pagada.
 * 
 * Body:
 * - id_venta: ID de la venta a reembolsar
 */
export async function POST(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const body = await req.json();
    const { id_venta } = body as {
      id_venta: number;
    };

    if (!Number.isInteger(id_venta) || id_venta <= 0) {
      return NextResponse.json(
        { error: "ID de venta inválido" },
        { status: 400 }
      );
    }

    // Verificar que la venta pertenece al cliente
    const { rows: ventaRows } = await pool.query(
      `
      SELECT v.id_venta, v.fk_cliente
      FROM venta v
      WHERE v.id_venta = $1
      `,
      [id_venta]
    );

    if (!ventaRows?.length) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    if (ventaRows[0].fk_cliente !== clienteId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    // Verificar que no haya un reembolso ya registrado para esta venta
    const { rows: reembolsoExistente } = await pool.query(
      `SELECT id_reembolso FROM reembolso WHERE fk_venta = $1`,
      [id_venta]
    );

    if (reembolsoExistente?.length > 0) {
      return NextResponse.json(
        { error: "Esta venta ya tiene un reembolso registrado" },
        { status: 400 }
      );
    }

    // Llamar al stored procedure realizar_reembolso
    // Usar CALL para stored procedures en PostgreSQL
    await pool.query(
      `CALL realizar_reembolso($1)`,
      [id_venta]
    );

    return NextResponse.json({ 
      ok: true, 
      message: "Reembolso procesado exitosamente" 
    });
  } catch (e: any) {
    console.error("Error procesando reembolso:", e);
    
    // Capturar errores y traducirlos a mensajes amigables
    let errorMessage = "Error procesando reembolso";
    if (e.message?.includes("no se encuentra en estado")) {
      errorMessage = "La venta debe estar en estado 'Pagado' para poder reembolsarse";
    } else if (e.message?.includes("no existe")) {
      errorMessage = "La venta especificada no existe";
    } else if (e.message) {
      errorMessage = e.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
