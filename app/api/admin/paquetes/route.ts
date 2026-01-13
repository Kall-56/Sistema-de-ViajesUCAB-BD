import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// GET: Listar todos los paquetes con información de servicios y restricciones
export async function GET() {
  const auth = requirePermission(1); // lectura
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    // Obtener paquetes con sus servicios y restricciones
    const { rows } = await pool.query(`
      SELECT
        p.id AS id_paquete,
        p.nombre AS nombre_paquete,
        p.descripcion AS descripcion_paquete,
        p.tipo_paquete,
        -- Array de IDs de servicios
        (SELECT array_agg(ps.fk_servicio) FROM paquete_servicio ps WHERE ps.fk_paquete = p.id) AS ids_servicios,
        -- Array de nombres de servicios
        (SELECT array_agg(s.nombre) FROM paquete_servicio ps 
         JOIN servicio s ON s.id = ps.fk_servicio 
         WHERE ps.fk_paquete = p.id) AS nombres_servicios,
        -- Array de restricciones (formato: caracteristica operador valor)
        (SELECT array_agg(
          r.caracteristica || ' ' || r.operador || ' ' || r.valor_restriccion
        ) FROM restriccion r WHERE r.fk_paquete = p.id) AS restricciones
      FROM paquete p
      ORDER BY p.id DESC
    `);

    return NextResponse.json({ paquetes: rows });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error listando paquetes" },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo paquete (ID autogenerado en backend)
export async function POST(req: Request) {
  const auth = requirePermission(2);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

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

  if (!Array.isArray(ids_servicios) || ids_servicios.length === 0) {
    return NextResponse.json(
      { error: "Debe seleccionar al menos un servicio" },
      { status: 400 }
    );
  }

  const arrRestricciones: string[] = Array.isArray(restricciones) ? restricciones : [];
  const arrIdsServicios: number[] = Array.isArray(ids_servicios) ? ids_servicios : [];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Calcular siguiente ID de forma segura
    await client.query(`LOCK TABLE paquete IN EXCLUSIVE MODE`);

    const { rows: idRows } = await client.query<{ next_id: number }>(`
      SELECT COALESCE(MAX(id), 0) + 1 AS next_id
      FROM paquete
    `);

    const nextId = idRows[0].next_id;

    // Usar función almacenada insertar_paquete
    const { rows } = await client.query(
      `SELECT insertar_paquete($1, $2, $3, $4, $5::varchar[], $6::integer[]) AS id`,
      [
        nextId,
        nombre.trim(),
        descripcion.trim(),
        tipo_paquete.trim(),
        arrRestricciones.length > 0 ? arrRestricciones : null,
        arrIdsServicios,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({ ok: true, id: rows[0]?.id }, { status: 201 });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { error: e?.message ?? "Error creando paquete" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

