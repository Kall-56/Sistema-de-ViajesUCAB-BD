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
        (SELECT i.link FROM imagen i WHERE i.fk_servicio = s.id LIMIT 1) AS imagen_principal,
        -- Calcular precio convertido a Bs
        CASE 
          WHEN s.denominacion != 'VEN' THEN
            s.costo_servicio * 
            COALESCE(
              (SELECT cantidad_cambio 
               FROM cambio_moneda 
               WHERE denominacion = s.denominacion 
                 AND fecha_fin IS NULL 
               ORDER BY fecha_inicio DESC 
               LIMIT 1), 
              1
            )
          ELSE
            s.costo_servicio
        END AS costo_servicio_bs
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

