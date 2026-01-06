import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * GET /api/cliente/resenas/itinerario/[id]
 * 
 * Obtener reseñas de un itinerario específico (público, para mostrar en detalles de servicio).
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const idItinerario = Number(params.id);

  if (!Number.isInteger(idItinerario) || idItinerario <= 0) {
    return NextResponse.json(
      { error: "ID de itinerario inválido" },
      { status: 400 }
    );
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT
        r.id,
        r.calificacion_resena,
        r.comentario,
        r.fk_itinerario_servicio AS fk_itinerario,
        c.nombre_1,
        c.apellido_1,
        c.nombre_2,
        c.apellido_2
      FROM resena r
      JOIN itinerario i ON i.id = r.fk_itinerario_servicio
      JOIN venta v ON v.id_venta = i.fk_venta
      JOIN cliente c ON c.id = v.fk_cliente
      WHERE r.fk_itinerario_servicio = $1
      ORDER BY r.id DESC
      `,
      [idItinerario]
    );

    // Formatear nombre del cliente
    const reseñas = rows.map((r: any) => ({
      id: r.id,
      calificacion_resena: r.calificacion_resena,
      comentario: r.comentario,
      fk_itinerario: r.fk_itinerario,
      nombre_cliente: `${r.nombre_1} ${r.nombre_2 || ""} ${r.apellido_1} ${r.apellido_2 || ""}`.trim(),
    }));

    return NextResponse.json({ reseñas });
  } catch (e: any) {
    console.error("Error obteniendo reseñas del itinerario:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo reseñas" },
      { status: 500 }
    );
  }
}

