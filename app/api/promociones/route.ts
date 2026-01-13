import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET: Obtener promociones activas para mostrar en la página pública
// No requiere autenticación - es público
export async function GET() {
  try {
    // Obtener descuentos activos (fecha_vencimiento NULL o >= hoy)
    // Con información completa del servicio para mostrar en la UI
    const { rows } = await pool.query(`
      SELECT
        d.id AS descuento_id,
        d.porcentaje_descuento,
        d.fecha_vencimiento,
        s.id AS servicio_id,
        s.nombre AS servicio_nombre,
        s.descripcion,
        s.costo_servicio,
        s.denominacion,
        s.millas_otorgadas,
        s.tipo_servicio,
        l.nombre AS lugar_nombre,
        p.nombre_proveedor,
        -- Calcular precio con descuento (en moneda original)
        (s.costo_servicio * (1 - d.porcentaje_descuento / 100.0))::integer AS precio_con_descuento,
        -- Calcular precio original convertido a Bs
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
        END AS costo_servicio_bs,
        -- Calcular precio con descuento convertido a Bs
        CASE 
          WHEN s.denominacion != 'VEN' THEN
            (s.costo_servicio * (1 - d.porcentaje_descuento / 100.0))::integer * 
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
            (s.costo_servicio * (1 - d.porcentaje_descuento / 100.0))::integer
        END AS precio_con_descuento_bs,
        -- Calcular ahorro (en moneda original)
        (s.costo_servicio * (d.porcentaje_descuento / 100.0))::integer AS ahorro,
        -- Calcular ahorro convertido a Bs
        CASE 
          WHEN s.denominacion != 'VEN' THEN
            (s.costo_servicio * (d.porcentaje_descuento / 100.0))::integer * 
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
            (s.costo_servicio * (d.porcentaje_descuento / 100.0))::integer
        END AS ahorro_bs,
        -- Días restantes
        CASE 
          WHEN d.fecha_vencimiento IS NULL THEN NULL
          ELSE (d.fecha_vencimiento - CURRENT_DATE)::integer
        END AS dias_restantes,
        -- Obtener primera imagen del servicio
        (SELECT i.link FROM imagen i WHERE i.fk_servicio = s.id LIMIT 1) AS imagen_principal
      FROM descuento d
      JOIN servicio s ON s.id = d.fk_servicio
      LEFT JOIN lugar l ON l.id = s.fk_lugar
      LEFT JOIN proveedor p ON p.id = s.fk_proveedor
      WHERE 
        -- Solo promociones activas (sin fecha de vencimiento o aún válidas)
        (d.fecha_vencimiento IS NULL OR d.fecha_vencimiento >= CURRENT_DATE)
      ORDER BY d.porcentaje_descuento DESC, d.id DESC
      LIMIT 50
    `);

    return NextResponse.json({ promociones: rows || [] });
  } catch (e: any) {
    console.error("Error obteniendo promociones:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo promociones", promociones: [] },
      { status: 500 }
    );
  }
}

