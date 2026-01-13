import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * GET /api/paquetes/[id]
 * 
 * Obtener detalles de un paquete específico.
 * Esta API es pública (no requiere autenticación) para que los clientes puedan ver detalles.
 * 
 * Nota: No usa la función obtener_paquete de la BD porque tiene un error (intenta usar r.descripcion que no existe).
 * En su lugar, construye la respuesta manualmente desde las tablas.
 * 
 * Retorna:
 * - id_paquete
 * - nombre_paquete
 * - descripcion_paquete
 * - tipo_paquete
 * - restricciones (array)
 * - ids_servicios (array)
 * - servicios (array con detalles completos)
 * - precio_total
 * - millas_totales
 * - destinos
 * - imagen_principal
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID de paquete inválido" }, { status: 400 });
  }

  try {
    // Obtener información básica del paquete directamente
    // (No usar obtener_paquete porque tiene error con r.descripcion)
    const { rows: paqueteRows } = await pool.query(
      `SELECT id, nombre, descripcion, tipo_paquete FROM paquete WHERE id = $1`,
      [id]
    );

    if (!paqueteRows?.length) {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 });
    }

    const paqueteBase = paqueteRows[0];

    // Obtener restricciones manualmente (construyendo descripción)
    const { rows: restriccionesRows } = await pool.query(
      `SELECT 
        r.caracteristica || ' ' || r.operador || ' ' || r.valor_restriccion AS descripcion
       FROM restriccion r 
       WHERE r.fk_paquete = $1`,
      [id]
    );

    // Obtener IDs de servicios
    const { rows: serviciosIdsRows } = await pool.query(
      `SELECT array_agg(ps.fk_servicio) AS ids_servicios
       FROM paquete_servicio ps 
       WHERE ps.fk_paquete = $1`,
      [id]
    );

    const paquete = {
      id_paquete: paqueteBase.id,
      nombre_paquete: paqueteBase.nombre,
      descripcion_paquete: paqueteBase.descripcion,
      tipo_paquete: paqueteBase.tipo_paquete,
      restricciones: restriccionesRows.map(r => r.descripcion) || [],
      ids_servicios: serviciosIdsRows[0]?.ids_servicios || []
    };
    
    // La función retorna: id_paquete, nombre_paquete, descripcion_paquete, tipo_paquete, restricciones, ids_servicios
    // Necesitamos obtener información adicional de los servicios para mostrar en el frontend
    const { rows: serviciosRows } = await pool.query(`
      SELECT 
        s.id,
        s.nombre,
        s.descripcion,
        s.costo_servicio,
        s.millas_otorgadas,
        s.tipo_servicio,
        s.denominacion,
        l.nombre AS lugar_nombre,
        (SELECT array_agg(i.link) FROM imagen i WHERE i.fk_servicio = s.id) AS imagenes
      FROM servicio s
      LEFT JOIN lugar l ON l.id = s.fk_lugar
      WHERE s.id = ANY($1::integer[])
      ORDER BY s.id
    `, [paquete.ids_servicios || []]);

    // Calcular precio total y millas totales
    const precio_total = serviciosRows.reduce((sum, s) => sum + (Number(s.costo_servicio) || 0), 0);
    const millas_totales = serviciosRows.reduce((sum, s) => sum + (Number(s.millas_otorgadas) || 0), 0);

    // Obtener destinos únicos
    const destinos = [...new Set(serviciosRows.map(s => s.lugar_nombre).filter(Boolean))];

    // Obtener imagen principal (primera imagen de los servicios)
    const imagen_principal = serviciosRows
      .flatMap(s => s.imagenes || [])
      .find(img => img) || null;

    return NextResponse.json({
      paquete: {
        ...paquete,
        precio_total,
        millas_totales,
        destinos,
        imagen_principal,
        servicios: serviciosRows.map(s => ({
          id: s.id,
          nombre: s.nombre,
          descripcion: s.descripcion,
          costo_servicio: s.costo_servicio,
          millas_otorgadas: s.millas_otorgadas,
          tipo_servicio: s.tipo_servicio,
          denominacion: s.denominacion,
          lugar_nombre: s.lugar_nombre,
          imagenes: s.imagenes || []
        }))
      }
    });
  } catch (e: any) {
    console.error("Error obteniendo paquete:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo detalles del paquete" },
      { status: 500 }
    );
  }
}

