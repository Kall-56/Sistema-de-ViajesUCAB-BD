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
         WHERE i.fk_venta = v.id_venta) AS servicios,
        CASE 
          WHEN e.nombre = 'Cancelado' THEN v.monto_total - r.monto_reembolso
          ELSE 0
        END AS penalizacion
      FROM reembolso r
      JOIN venta v ON v.id_venta = r.fk_venta
      JOIN ven_est ve ON ve.fk_venta = v.id_venta
      JOIN estado e ON e.id = ve.fk_estado
      WHERE v.fk_cliente = $1
        AND ve.fecha_fin IS NULL
        AND e.nombre IN ('Reembolsado', 'Cancelado')
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
    const { id_venta, es_cancelacion_voluntaria } = body as {
      id_venta: number;
      es_cancelacion_voluntaria?: boolean; // true = cancelación voluntaria (10% penalización), false/undefined = reembolso total
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

    // Usar la función almacenada realizar_reembolso() que maneja toda la lógica
    // La función acepta: realizar_reembolso(id_venta, es_cancelacion_voluntaria)
    const esVoluntaria = es_cancelacion_voluntaria === true;
    
    try {
      await pool.query(
        `CALL realizar_reembolso($1, $2)`,
        [id_venta, esVoluntaria]
      );
    } catch (funcionError: any) {
      // La función lanza EXCEPTION con mensajes descriptivos
      let errorMessage = "Error procesando reembolso";
      
      if (funcionError.message?.includes("no está en estado")) {
        errorMessage = "La venta debe estar en estado 'Pagado' para poder reembolsarse";
      } else if (funcionError.message?.includes("no existe")) {
        errorMessage = "La venta especificada no existe";
      } else if (funcionError.message) {
        errorMessage = funcionError.message;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

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
