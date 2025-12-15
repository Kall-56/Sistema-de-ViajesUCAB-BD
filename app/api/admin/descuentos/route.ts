import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// GET: Listar todos los descuentos con información del servicio
export async function GET() {
  const auth = requirePermission(1); // lectura
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { rows } = await pool.query(`
    SELECT
      d.id,
      d.porcentaje_descuento,
      d.fecha_vencimiento,
      d.fk_servicio,
      s.nombre AS servicio_nombre,
      s.tipo_servicio,
      s.costo_servicio,
      s.denominacion,
      s.millas_otorgadas,
      l.nombre AS lugar_nombre,
      p.nombre_proveedor,
      CASE 
        WHEN d.fecha_vencimiento IS NULL THEN true
        WHEN d.fecha_vencimiento >= CURRENT_DATE THEN true
        ELSE false
      END AS activo
    FROM descuento d
    JOIN servicio s ON s.id = d.fk_servicio
    LEFT JOIN lugar l ON l.id = s.fk_lugar
    LEFT JOIN proveedor p ON p.id = s.fk_proveedor
    ORDER BY d.id DESC
  `);

  return NextResponse.json({ descuentos: rows });
}

// POST: Crear nuevo descuento/promoción
export async function POST(req: Request) {
  const auth = requirePermission(2); // escritura
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const { fk_servicio, porcentaje, fecha_vencimiento } = body as {
    fk_servicio: number;
    porcentaje: number;
    fecha_vencimiento: string | null;
  };

  const fkServicioN = Number(fk_servicio);
  const porcentajeN = Number(porcentaje);
  const fechaVenc = fecha_vencimiento || null;

  if (!Number.isInteger(fkServicioN) || !Number.isFinite(porcentajeN)) {
    return NextResponse.json(
      { error: "fk_servicio y porcentaje son requeridos" },
      { status: 400 }
    );
  }

  if (porcentajeN < 0 || porcentajeN > 100) {
    return NextResponse.json(
      { error: "El porcentaje debe estar entre 0 y 100" },
      { status: 400 }
    );
  }

  try {
    // Verificar si ya existe un descuento activo para este servicio
    const { rows: existingRows } = await pool.query(
      `SELECT id, porcentaje_descuento, fecha_vencimiento
       FROM descuento 
       WHERE fk_servicio = $1 
         AND (fecha_vencimiento IS NULL OR fecha_vencimiento >= CURRENT_DATE)
       ORDER BY id DESC`,
      [fkServicioN]
    );

    // Intentar crear el descuento usando la función almacenada
    let rows;
    try {
      const result = await pool.query(
        `SELECT insertar_descuento($1, $2, $3) AS id`,
        [fkServicioN, porcentajeN, fechaVenc]
      );
      rows = result.rows;
    } catch (insertError: any) {
      // Si falla con error de clave duplicada o constraint único, intentar insertar directamente
      if (
        insertError?.message?.includes("duplicate key") || 
        insertError?.message?.includes("descuento_pk") ||
        insertError?.message?.includes("unique constraint")
      ) {
        // Intentar insertar directamente en la tabla (la PK serial se generará automáticamente)
        const directInsert = await pool.query(
          `INSERT INTO descuento (fk_servicio, porcentaje_descuento, fecha_vencimiento)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [fkServicioN, porcentajeN, fechaVenc]
        );
        rows = directInsert.rows;
      } else {
        // Si es otro tipo de error, relanzarlo
        throw insertError;
      }
    }

    return NextResponse.json({ 
      ok: true, 
      id: rows[0]?.id,
      warning: existingRows?.length > 0 
        ? `Este servicio ya tiene ${existingRows.length} descuento(s) activo(s). Se ha creado un nuevo descuento. El sistema aplicará el descuento con mayor porcentaje.` 
        : undefined
    }, { status: 201 });
  } catch (e: any) {
    // Si el error es de clave duplicada o constraint único, dar un mensaje más claro
    if (e?.message?.includes("duplicate key") || e?.message?.includes("descuento_pk")) {
      return NextResponse.json(
        { 
          error: "Error al crear el descuento. Ya existe un descuento con estas características. Intenta editar el descuento existente o contacta con el administrador." 
        },
        { status: 400 }
      );
    }
    
    // Si el error es de constraint único en fk_servicio (si existe)
    if (e?.message?.includes("unique constraint") && e?.message?.includes("fk_servicio")) {
      return NextResponse.json(
        { 
          error: "Este servicio ya tiene un descuento activo. Puedes editar el descuento existente desde la lista de promociones, o esperar a que expire. Si necesitas múltiples descuentos simultáneos, contacta con el administrador de la base de datos." 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: e?.message ?? "Error creando descuento" },
      { status: 500 }
    );
  }
}

