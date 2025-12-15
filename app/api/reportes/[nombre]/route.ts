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
  // Declarar variables fuera del try para que estén disponibles en el catch
  let paramsArray: any[] = [];
  let paramPlaceholders: string[] = [];
  let query = "";

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
      "rep_ventas_periodo"
    ];
    
    // SPs que aceptan fecha_inicio, fecha_fin y limite
    const spsConLimite = [
      "rep_clientes_activos",
      "rep_servicios_populares",
      "rep_proveedores_mas_vendidos"
    ];

    // Construir parámetros para el stored procedure
    paramsArray = [];
    paramPlaceholders = [];
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

    // Agregar fechaInicio (siempre se pasa, puede ser NULL)
    paramsArray.push(fechaInicio || null);
    paramPlaceholders.push(`$${paramIndex}::date`);
    paramIndex++;

    // Agregar fechaFin (siempre se pasa, puede ser NULL)
    paramsArray.push(fechaFin || null);
    paramPlaceholders.push(`$${paramIndex}::date`);
    paramIndex++;

    // Agregar limit solo si el SP lo acepta
    if (spsConLimite.includes(nombreReporte)) {
      paramsArray.push(limit ? parseInt(limit, 10) : null);
      paramPlaceholders.push(`$${paramIndex}::integer`);
      paramIndex++;
    }

    // Construir la llamada al stored procedure
    query = `SELECT * FROM ${nombreReporte}(${paramPlaceholders.join(", ")})`;

    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      console.log(`Ejecutando reporte: ${nombreReporte}`);
      console.log(`Query: ${query}`);
      console.log(`Parámetros:`, paramsArray);
    }

    // Ejecutar el stored procedure
    // Para rep_ventas_periodo, necesitamos convertir bigint a integer en la columna cantidad_items
    let result = await pool.query(query, paramsArray);
    
    // Convertir bigint a number para columnas que puedan causar problemas
    // Aplicar a todos los reportes que puedan devolver bigint
    const reportesConBigint = [
      "rep_ventas_periodo", 
      "rep_clientes_activos",
      "rep_proveedores_mas_vendidos"
    ];
    
    if (reportesConBigint.includes(nombreReporte)) {
      result.rows = result.rows.map((row: any) => {
        const converted: any = {};
        for (const [key, value] of Object.entries(row)) {
          // Convertir bigint a number para evitar problemas de serialización
          if (typeof value === 'bigint' || (typeof value === 'object' && value?.constructor?.name === 'BigInt')) {
            converted[key] = Number(value);
          } else {
            converted[key] = value;
          }
        }
        return converted;
      });
    }

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
    console.error("Query ejecutada:", query || `SELECT * FROM ${params.nombre}(...)`);
    console.error("Parámetros enviados:", paramsArray);
    
    // Errores específicos de PostgreSQL
    if (error.code === '42883') { // undefined_function
      return NextResponse.json(
        { 
          error: `El reporte "${params.nombre}" no existe.`,
          hint: "Verifique que el stored procedure esté creado en la base de datos.",
          detalles: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 404 }
      );
    }

    if (error.code === '42804' || error.message?.includes("structure of query does not match")) {
      return NextResponse.json(
        { 
          error: `Error en la estructura del reporte "${params.nombre}".`,
          hint: "Verifique que los parámetros sean correctos o que el stored procedure esté actualizado.",
          detalles: process.env.NODE_ENV === "development" ? error.message : undefined,
          query: process.env.NODE_ENV === "development" ? `SELECT * FROM ${params.nombre}(...)` : undefined
        },
        { status: 400 }
      );
    }

    if (error.code === '42P01' || error.message?.includes("does not exist") || error.message?.includes("no existe")) {
      return NextResponse.json(
        { 
          error: `El reporte "${params.nombre}" no existe.`,
          hint: "Verifique que el stored procedure esté creado en la base de datos.",
          detalles: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || "Error ejecutando el reporte",
        detalles: process.env.NODE_ENV === "development" ? error.stack : undefined,
        codigoError: error.code,
        hint: "Revise la consola del servidor para más detalles."
      },
      { status: 500 }
    );
  }
}

