import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

/**
 * GET /api/proveedor/paquetes
 * 
 * Obtener paquetes que incluyen servicios del proveedor autenticado.
 * Solo los proveedores pueden acceder a esta API.
 * 
 * Retorna paquetes que incluyen al menos un servicio del proveedor.
 */
export async function GET() {
  // Verificar que sea proveedor (rolId = 2)
  const auth = requirePermission(1); // Permiso de lectura
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Verificar que sea proveedor
  if (auth.session.rolId !== 2 || !auth.session.proveedorId) {
    return NextResponse.json(
      { error: "Solo los proveedores pueden acceder a esta información" },
      { status: 403 }
    );
  }

  const proveedorId = auth.session.proveedorId;

  try {
    // Obtener paquetes que incluyen servicios del proveedor
    const { rows } = await pool.query(`
      SELECT DISTINCT
        p.id AS id_paquete,
        p.nombre AS nombre_paquete,
        p.descripcion AS descripcion_paquete,
        p.tipo_paquete,
        -- Array de IDs de servicios del proveedor en el paquete
        (SELECT array_agg(ps.fk_servicio) 
         FROM paquete_servicio ps 
         JOIN servicio s ON s.id = ps.fk_servicio 
         WHERE ps.fk_paquete = p.id AND s.fk_proveedor = $1) AS ids_servicios_proveedor,
        -- Array de nombres de servicios del proveedor
        (SELECT array_agg(s.nombre) 
         FROM paquete_servicio ps 
         JOIN servicio s ON s.id = ps.fk_servicio 
         WHERE ps.fk_paquete = p.id AND s.fk_proveedor = $1) AS nombres_servicios_proveedor,
        -- Total de servicios en el paquete
        (SELECT COUNT(*) FROM paquete_servicio ps WHERE ps.fk_paquete = p.id) AS total_servicios_paquete,
        -- Array de restricciones
        (SELECT array_agg(r.descripcion) FROM restriccion r WHERE r.fk_paquete = p.id) AS restricciones
      FROM paquete p
      WHERE EXISTS (
        SELECT 1 
        FROM paquete_servicio ps 
        JOIN servicio s ON s.id = ps.fk_servicio 
        WHERE ps.fk_paquete = p.id AND s.fk_proveedor = $1
      )
      ORDER BY p.id DESC
    `, [proveedorId]);

    return NextResponse.json({ paquetes: rows });
  } catch (e: any) {
    console.error("Error obteniendo paquetes del proveedor:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo paquetes" },
      { status: 500 }
    );
  }
}

