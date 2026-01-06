import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * POST /api/cliente/reclamos
 * 
 * Crear un reclamo.
 * 
 * Body:
 * - id_itinerario: ID del itinerario
 * - id_tipo_reclamo: ID del tipo de reclamo
 * - comentario: descripción del reclamo
 */
export async function POST(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const body = await req.json();
    const { id_itinerario, id_tipo_reclamo, comentario } = body as {
      id_itinerario: number;
      id_tipo_reclamo: number;
      comentario: string;
    };

    if (!Number.isInteger(id_itinerario) || id_itinerario <= 0) {
      return NextResponse.json(
        { error: "ID de itinerario inválido" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(id_tipo_reclamo) || id_tipo_reclamo <= 0) {
      return NextResponse.json(
        { error: "Tipo de reclamo inválido" },
        { status: 400 }
      );
    }

    if (!comentario || comentario.trim().length === 0) {
      return NextResponse.json(
        { error: "El comentario es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el itinerario pertenece a una venta del cliente
    const { rows: ventaRows } = await pool.query(
      `
      SELECT v.id_venta, v.fk_cliente
      FROM venta v
      JOIN itinerario i ON i.fk_venta = v.id_venta
      WHERE i.id = $1
      `,
      [id_itinerario]
    );

    if (!ventaRows?.length) {
      return NextResponse.json(
        { error: "Itinerario no encontrado" },
        { status: 404 }
      );
    }

    if (ventaRows[0].fk_cliente !== clienteId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    // Verificar que el tipo de reclamo existe
    const { rows: tipoRows } = await pool.query(
      `SELECT id FROM tipo_reclamo WHERE id = $1`,
      [id_tipo_reclamo]
    );

    if (!tipoRows?.length) {
      return NextResponse.json(
        { error: "Tipo de reclamo no encontrado" },
        { status: 404 }
      );
    }

    // Crear el reclamo usando la función de BD
    await pool.query(
      `SELECT agregar_reclamo($1, $2, $3, $4)`,
      [comentario, clienteId, id_tipo_reclamo, id_itinerario]
    );

    return NextResponse.json({ ok: true, message: "Reclamo creado exitosamente" });
  } catch (e: any) {
    console.error("Error creando reclamo:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error creando reclamo" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cliente/reclamos
 * 
 * Obtener todos los reclamos del cliente.
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
        r.id,
        r.comentario,
        r.fk_itinerario,
        tr.descripcion AS tipo_reclamo,
        e.nombre AS estado,
        re.fecha_inicio,
        re.fecha_final,
        i.fk_servicio,
        s.nombre AS nombre_servicio
      FROM reclamo r
      JOIN tipo_reclamo tr ON tr.id = r.fk_tipo_reclamo
      JOIN rec_est re ON re.fk_reclamo = r.id
      JOIN estado e ON e.id = re.fk_estado
      JOIN itinerario i ON i.id = r.fk_itinerario
      JOIN servicio s ON s.id = i.fk_servicio
      WHERE r.fk_cliente = $1
        AND re.fecha_final IS NULL
      ORDER BY re.fecha_inicio DESC
      `,
      [clienteId]
    );

    return NextResponse.json({ reclamos: rows });
  } catch (e: any) {
    console.error("Error obteniendo reclamos:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo reclamos" },
      { status: 500 }
    );
  }
}

