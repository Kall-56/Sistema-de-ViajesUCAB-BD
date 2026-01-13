import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * GET /api/servicios/[id]
 * 
 * Obtener detalles de un servicio específico (público).
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID de servicio inválido" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT
        s.id,
        s.nombre,
        s.descripcion,
        s.costo_servicio,
        s.millas_otorgadas,
        s.tipo_servicio,
        s.denominacion,
        l.id AS lugar_id,
        l.nombre AS lugar_nombre,
        p.nombre_proveedor,
        (SELECT array_agg(i.link) FROM imagen i WHERE i.fk_servicio = s.id) AS imagenes
      FROM servicio s
      LEFT JOIN lugar l ON l.id = s.fk_lugar
      LEFT JOIN proveedor p ON p.id = s.fk_proveedor
      WHERE s.id = $1
      `,
      [id]
    );

    if (!rows?.length) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ servicio: rows[0] });
  } catch (e: any) {
    console.error("Error obteniendo servicio:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo servicio" },
      { status: 500 }
    );
  }
}
