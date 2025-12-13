import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// GET: Obtener un descuento específico
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requirePermission(1);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0)
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const { rows } = await pool.query(
      `
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
        p.nombre_proveedor
      FROM descuento d
      JOIN servicio s ON s.id = d.fk_servicio
      LEFT JOIN lugar l ON l.id = s.fk_lugar
      LEFT JOIN proveedor p ON p.id = s.fk_proveedor
      WHERE d.id = $1
      `,
      [id]
    );

    if (!rows?.length)
      return NextResponse.json({ error: "Descuento no encontrado" }, { status: 404 });

    return NextResponse.json({ descuento: rows[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}

// PUT: Actualizar descuento
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requirePermission(3); // actualización
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0)
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const body = await req.json();
  const { porcentaje, fecha_vencimiento } = body as {
    porcentaje: number;
    fecha_vencimiento: string | null;
  };

  const porcentajeN = Number(porcentaje);
  const fechaVenc = fecha_vencimiento || null;

  if (!Number.isFinite(porcentajeN)) {
    return NextResponse.json(
      { error: "porcentaje es requerido" },
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
      `SELECT alterar_descuento($1, $2, $3) AS id`,
      [id, porcentajeN, fechaVenc]
    );

    return NextResponse.json({ ok: true, id: rows[0]?.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error actualizando descuento" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar descuento
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requirePermission(4); // eliminación
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0)
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const { rows } = await pool.query(
      `SELECT eliminar_descuento($1) AS id`,
      [id]
    );

    return NextResponse.json({ ok: true, id: rows[0]?.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error eliminando descuento" },
      { status: 500 }
    );
  }
}

