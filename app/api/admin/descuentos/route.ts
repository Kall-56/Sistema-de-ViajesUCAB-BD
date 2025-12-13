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
    const { rows } = await pool.query(
      `SELECT insertar_descuento($1, $2, $3) AS id`,
      [fkServicioN, porcentajeN, fechaVenc]
    );

    return NextResponse.json({ ok: true, id: rows[0]?.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error creando descuento" },
      { status: 500 }
    );
  }
}

