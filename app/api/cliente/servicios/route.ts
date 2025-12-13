import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET: Listar servicios disponibles para agregar al itinerario (público, pero mejor si está autenticado)
export async function GET() {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        s.id,
        s.nombre,
        s.descripcion,
        s.costo_servicio,
        s.denominacion,
        s.millas_otorgadas,
        s.tipo_servicio,
        l.nombre AS lugar_nombre,
        p.nombre_proveedor,
        (SELECT i.link FROM imagen i WHERE i.fk_servicio = s.id LIMIT 1) AS imagen_principal
      FROM servicio s
      LEFT JOIN lugar l ON l.id = s.fk_lugar
      LEFT JOIN proveedor p ON p.id = s.fk_proveedor
      ORDER BY s.nombre ASC
      LIMIT 200
      `
    );

    return NextResponse.json({ servicios: rows });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo servicios" },
      { status: 500 }
    );
  }
}

