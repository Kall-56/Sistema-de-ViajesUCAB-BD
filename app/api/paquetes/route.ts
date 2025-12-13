import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET: Obtener paquetes para mostrar en la página pública
// No requiere autenticación - es público
export async function GET() {
  try {
    // Obtener paquetes con información completa para mostrar
    const { rows } = await pool.query(`
      SELECT
        p.id AS id_paquete,
        p.nombre AS nombre_paquete,
        p.descripcion AS descripcion_paquete,
        p.tipo_paquete,
        -- Array de IDs de servicios
        (SELECT array_agg(ps.fk_servicio) FROM paquete_servicio ps WHERE ps.fk_paquete = p.id) AS ids_servicios,
        -- Array de nombres de servicios
        (SELECT array_agg(s.nombre) FROM paquete_servicio ps 
         JOIN servicio s ON s.id = ps.fk_servicio 
         WHERE ps.fk_paquete = p.id) AS nombres_servicios,
        -- Array de restricciones
        (SELECT array_agg(r.descripcion) FROM restriccion r WHERE r.fk_paquete = p.id) AS restricciones,
        -- Calcular precio total del paquete (suma de servicios)
        (SELECT COALESCE(SUM(s.costo_servicio), 0) 
         FROM paquete_servicio ps 
         JOIN servicio s ON s.id = ps.fk_servicio 
         WHERE ps.fk_paquete = p.id) AS precio_total,
        -- Calcular millas totales
        (SELECT COALESCE(SUM(s.millas_otorgadas), 0) 
         FROM paquete_servicio ps 
         JOIN servicio s ON s.id = ps.fk_servicio 
         WHERE ps.fk_paquete = p.id) AS millas_totales,
        -- Obtener primera imagen de los servicios
        (SELECT i.link FROM paquete_servicio ps 
         JOIN servicio s ON s.id = ps.fk_servicio 
         JOIN imagen i ON i.fk_servicio = s.id 
         WHERE ps.fk_paquete = p.id 
         LIMIT 1) AS imagen_principal,
        -- Obtener destinos (lugares) de los servicios
        (SELECT array_agg(DISTINCT l.nombre) 
         FROM paquete_servicio ps 
         JOIN servicio s ON s.id = ps.fk_servicio 
         LEFT JOIN lugar l ON l.id = s.fk_lugar 
         WHERE ps.fk_paquete = p.id AND l.nombre IS NOT NULL) AS destinos
      FROM paquete p
      WHERE EXISTS (
        SELECT 1 FROM paquete_servicio ps WHERE ps.fk_paquete = p.id
      )
      ORDER BY p.id DESC
      LIMIT 100
    `);

    return NextResponse.json({ paquetes: rows });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo paquetes" },
      { status: 500 }
    );
  }
}

