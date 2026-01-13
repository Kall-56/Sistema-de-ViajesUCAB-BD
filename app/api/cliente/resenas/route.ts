import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * POST /api/cliente/resenas
 * 
 * Crear una reseña para un itinerario pagado.
 * 
 * Body:
 * - id_itinerario: ID del itinerario
 * - calificacion_resena: número entre 0 y 5
 * - comentario: texto de la reseña
 */
export async function POST(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const body = await req.json();
    const { id_itinerario, calificacion_resena, comentario } = body as {
      id_itinerario: number;
      calificacion_resena: number;
      comentario: string;
    };

    if (!Number.isInteger(id_itinerario) || id_itinerario <= 0) {
      return NextResponse.json(
        { error: "ID de itinerario inválido" },
        { status: 400 }
      );
    }

    if (
      typeof calificacion_resena !== "number" ||
      calificacion_resena < 0 ||
      calificacion_resena > 5
    ) {
      return NextResponse.json(
        { error: "La calificación debe ser un número entre 0 y 5" },
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

    // Verificar si ya existe una reseña para este itinerario
    const { rows: resenaExistente } = await pool.query(
      `SELECT id FROM resena WHERE fk_itinerario = $1`,
      [id_itinerario]
    );

    if (resenaExistente?.length > 0) {
      return NextResponse.json(
        { error: "Ya existe una reseña para este itinerario" },
        { status: 400 }
      );
    }

    // Crear la reseña usando la función de BD
    await pool.query(
      `SELECT agregar_resena($1, $2, $3)`,
      [id_itinerario, calificacion_resena, comentario]
    );

    return NextResponse.json({ ok: true, message: "Reseña creada exitosamente" });
  } catch (e: any) {
    console.error("Error creando reseña:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error creando reseña" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cliente/resenas
 * 
 * Obtener todas las reseñas del cliente.
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
        r.calificacion_resena,
        r.comentario,
        r.fk_itinerario,
        i.fk_servicio,
        s.nombre AS nombre_servicio,
        i.fecha_hora_inicio
      FROM resena r
      JOIN itinerario i ON i.id = r.fk_itinerario
      JOIN servicio s ON s.id = i.fk_servicio
      JOIN venta v ON v.id_venta = i.fk_venta
      WHERE v.fk_cliente = $1
      ORDER BY r.id DESC
      `,
      [clienteId]
    );

    return NextResponse.json({ reseñas: rows });
  } catch (e: any) {
    console.error("Error obteniendo reseñas:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo reseñas" },
      { status: 500 }
    );
  }
}

