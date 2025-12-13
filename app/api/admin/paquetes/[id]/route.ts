import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// GET: Obtener un paquete específico
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
      `SELECT * FROM obtener_paquete($1)`,
      [id]
    );

    if (!rows?.length)
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 });

    const paquete = rows[0];
    
    // La función retorna: id_paquete, nombre_paquete, descripcion_paquete, tipo_paquete, restricciones, ids_servicios
    return NextResponse.json({ paquete: paquete });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}

// PUT: Actualizar paquete
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
  const {
    nombre,
    descripcion,
    tipo_paquete,
    restricciones,
    ids_servicios,
  } = body as {
    nombre: string;
    descripcion: string;
    tipo_paquete: string;
    restricciones: string[] | null;
    ids_servicios: number[] | null;
  };

  if (!nombre || !descripcion || !tipo_paquete) {
    return NextResponse.json(
      { error: "nombre, descripcion y tipo_paquete son requeridos" },
      { status: 400 }
    );
  }

  const arrRestricciones: string[] = Array.isArray(restricciones) ? restricciones : [];
  const arrIdsServicios: number[] = Array.isArray(ids_servicios) ? ids_servicios : [];

  try {
    const { rows } = await pool.query(
      `SELECT alterar_paquete($1, $2, $3, $4, $5::varchar[], $6::integer[]) AS id`,
      [
        id,
        nombre,
        descripcion,
        tipo_paquete,
        arrRestricciones.length > 0 ? arrRestricciones : null,
        arrIdsServicios.length > 0 ? arrIdsServicios : null,
      ]
    );

    return NextResponse.json({ ok: true, id: rows[0]?.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error actualizando paquete" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar paquete
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
      `SELECT eliminar_paquete($1) AS id`,
      [id]
    );

    return NextResponse.json({ ok: true, id: rows[0]?.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error eliminando paquete" },
      { status: 500 }
    );
  }
}

