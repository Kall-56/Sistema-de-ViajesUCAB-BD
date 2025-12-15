import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * GET /api/tasa-cambio
 * 
 * Obtener la tasa de cambio activa para una denominación específica.
 * Si no se especifica denominacion, retorna la tasa de USD por defecto.
 * 
 * Query params:
 * - denominacion: opcional, por defecto 'USD'
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const denominacion = searchParams.get("denominacion") || "USD";

    // Obtener la tasa de cambio activa más reciente
    const { rows } = await pool.query(
      `
      SELECT cantidad_cambio, denominacion, fecha_inicio
      FROM cambio_moneda
      WHERE denominacion = $1
        AND fecha_fin IS NULL
      ORDER BY fecha_inicio DESC
      LIMIT 1
      `,
      [denominacion.toUpperCase()]
    );

    if (!rows?.length) {
      // Si no hay tasa para la denominación solicitada, intentar con USD
      if (denominacion.toUpperCase() !== "USD") {
        const { rows: usdRows } = await pool.query(
          `
          SELECT cantidad_cambio, denominacion, fecha_inicio
          FROM cambio_moneda
          WHERE denominacion = 'USD'
            AND fecha_fin IS NULL
          ORDER BY fecha_inicio DESC
          LIMIT 1
          `,
        );

        if (usdRows?.length) {
          return NextResponse.json({
            tasa: Number(usdRows[0].cantidad_cambio),
            denominacion: usdRows[0].denominacion,
            fecha_inicio: usdRows[0].fecha_inicio,
            fallback: true,
          });
        }
      }

      return NextResponse.json(
        { error: `No hay tasa de cambio activa para ${denominacion}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tasa: Number(rows[0].cantidad_cambio),
      denominacion: rows[0].denominacion,
      fecha_inicio: rows[0].fecha_inicio,
    });
  } catch (e: any) {
    console.error("Error obteniendo tasa de cambio:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo tasa de cambio" },
      { status: 500 }
    );
  }
}

