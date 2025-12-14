import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

/**
 * GET /api/reportes/[nombre]
 * 
 * Endpoint genérico para ejecutar stored procedures de reportes.
 * 
 * El nombre del reporte debe coincidir con el nombre del stored procedure.
 * 
 * Query params opcionales:
 * - fechaInicio: Fecha de inicio (DATE)
 * - fechaFin: Fecha de fin (DATE)
 * - limit: Límite de resultados (INTEGER)
 * 
 * Ejemplo:
 * GET /api/reportes/top_destinos_vendidas?fechaInicio=2024-01-01&fechaFin=2024-12-31&limit=10
 * 
 * Requiere: Permiso de administrador (rolId = 3)
 */
export async function GET(
  req: Request,
  { params }: { params: { nombre: string } }
) {
  try {
    // Verificar autenticación y permisos (solo admin)
    // requirePermission(permisoId) - asumimos que el permiso 1 es para ver reportes
    // Si necesitas un permiso específico, ajusta el número
    const auth = requirePermission(1); // Ajustar según tus permisos
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    // Verificar que sea admin (rolId = 3)
    if (auth.session.rolId !== 3) {
      return NextResponse.json(
        { error: "Solo los administradores pueden acceder a reportes." },
        { status: 403 }
      );
    }

    const nombreReporte = params.nombre;
    
    // Validar que el nombre del reporte sea seguro (solo letras, números y guiones bajos)
    if (!/^[a-z_][a-z0-9_]*$/.test(nombreReporte)) {
      return NextResponse.json(
        { error: "Nombre de reporte inválido." },
        { status: 400 }
      );
    }

    // Parsear query params
    const { searchParams } = new URL(req.url);
    const fechaInicio = searchParams.get("fechaInicio");
    const fechaFin = searchParams.get("fechaFin");
    const limit = searchParams.get("limit");

    // Determinar qué parámetros acepta cada stored procedure según la BD
    // SPs sin parámetros
    const spsSinParametros = [
      "rep_top_destinos_vendidos"
    ];
    
    // SPs que solo aceptan fecha_inicio y fecha_fin (sin limite)
    const spsSinLimite = [
      "rep_ventas_periodo",
      "rep_ingresos_metodos_pago"
    ];
    
    // SPs que aceptan fecha_inicio, fecha_fin y limite
    const spsConLimite = [
      "rep_clientes_activos",
      "rep_servicios_populares"
    ];

    // Construir parámetros para el stored procedure
    const paramsArray: any[] = [];
    const paramPlaceholders: string[] = [];
    let paramIndex = 1;

    // Si el SP no tiene parámetros, llamarlo sin argumentos
    if (spsSinParametros.includes(nombreReporte)) {
      const query = `SELECT * FROM ${nombreReporte}()`;
      const result = await pool.query(query);
      
      return NextResponse.json({
        reporte: nombreReporte,
        fechaGeneracion: new Date().toISOString(),
        parametros: {},
        totalRegistros: result.rows.length,
        datos: result.rows,
      });
    }

    // Agregar fechaInicio si existe
    if (fechaInicio) {
      paramsArray.push(fechaInicio);
      paramPlaceholders.push(`$${paramIndex}`);
      paramIndex++;
    } else {
      paramPlaceholders.push("NULL");
    }

    // Agregar fechaFin si existe
    if (fechaFin) {
      paramsArray.push(fechaFin);
      paramPlaceholders.push(`$${paramIndex}`);
      paramIndex++;
    } else {
      paramPlaceholders.push("NULL");
    }

    // Agregar limit solo si el SP lo acepta
    if (spsConLimite.includes(nombreReporte)) {
      if (limit) {
        paramsArray.push(parseInt(limit, 10));
        paramPlaceholders.push(`$${paramIndex}`);
        paramIndex++;
      } else {
        paramPlaceholders.push("NULL");
      }
    }

    // Construir la llamada al stored procedure
    const query = `SELECT * FROM ${nombreReporte}(${paramPlaceholders.join(", ")})`;

    // Ejecutar el stored procedure
    const result = await pool.query(query, paramsArray);

    return NextResponse.json({
      reporte: nombreReporte,
      fechaGeneracion: new Date().toISOString(),
      parametros: {
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null,
        limit: limit ? parseInt(limit, 10) : null,
      },
      totalRegistros: result.rows.length,
      datos: result.rows,
    });

  } catch (error: any) {
    console.error(`Error ejecutando reporte ${params.nombre}:`, error);
    console.error("Error completo:", error);
    
    // Errores específicos de PostgreSQL
    if (error.code === '42883') { // undefined_function
      return NextResponse.json(
        { 
          error: `El reporte "${params.nombre}" no existe.`,
          hint: "Verifique que el stored procedure esté creado en la base de datos. Ejecute el script: scripts/stored-procedures-reportes.sql"
        },
        { status: 404 }
      );
    }

    if (error.code === '42804' || error.message?.includes("structure of query does not match")) {
      return NextResponse.json(
        { 
          error: `Error en la estructura del reporte "${params.nombre}".`,
          hint: "Verifique que los parámetros sean correctos o que el stored procedure esté actualizado."
        },
        { status: 400 }
      );
    }

    if (error.message?.includes("does not exist") || error.message?.includes("no existe")) {
      return NextResponse.json(
        { 
          error: `El reporte "${params.nombre}" no existe.`,
          hint: "Verifique que el stored procedure esté creado en la base de datos."
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || "Error ejecutando el reporte",
        detalles: process.env.NODE_ENV === "development" ? error.stack : undefined,
        codigoError: error.code
      },
      { status: 500 }
    );
  }
}

