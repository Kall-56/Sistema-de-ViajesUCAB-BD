import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * GET /api/cliente/deseos
 * 
 * Obtener la lista de deseos del cliente.
 * 
 * Nota: La tabla lista_deseo tiene PK en fk_cliente (solo UN registro por cliente).
 * Puede contener fk_lugar O fk_servicio (no ambos).
 */
export async function GET() {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        ld.fk_cliente,
        ld.fk_lugar,
        ld.fk_servicio,
        CASE 
          WHEN ld.fk_lugar IS NOT NULL THEN l.nombre
          ELSE NULL
        END AS lugar_nombre,
        CASE 
          WHEN ld.fk_servicio IS NOT NULL THEN s.nombre
          ELSE NULL
        END AS servicio_nombre,
        CASE 
          WHEN ld.fk_servicio IS NOT NULL THEN s.descripcion
          ELSE NULL
        END AS servicio_descripcion,
        CASE 
          WHEN ld.fk_servicio IS NOT NULL THEN s.costo_servicio
          ELSE NULL
        END AS servicio_costo,
        CASE 
          WHEN ld.fk_servicio IS NOT NULL THEN s.denominacion
          ELSE NULL
        END AS servicio_denominacion,
        CASE 
          WHEN ld.fk_servicio IS NOT NULL THEN (
            SELECT i.link FROM imagen i WHERE i.fk_servicio = s.id LIMIT 1
          )
          ELSE NULL
        END AS servicio_imagen
      FROM lista_deseo ld
      LEFT JOIN lugar l ON l.id = ld.fk_lugar
      LEFT JOIN servicio s ON s.id = ld.fk_servicio
      WHERE ld.fk_cliente = $1
      `,
      [clienteId]
    );

    if (!rows?.length) {
      return NextResponse.json({ 
        deseos: null,
        message: "No tienes items en tu lista de deseos"
      });
    }

    const deseo = rows[0];
    return NextResponse.json({ deseos: deseo });
  } catch (e: any) {
    console.error("Error obteniendo lista de deseos:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo lista de deseos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cliente/deseos
 * 
 * Agregar o actualizar item en lista de deseos.
 * 
 * Body:
 * - fk_lugar: ID del lugar (opcional, debe ser null si fk_servicio está presente)
 * - fk_servicio: ID del servicio (opcional, debe ser null si fk_lugar está presente)
 * 
 * Nota: Solo puede haber UN registro por cliente. Si ya existe, se actualiza.
 */
export async function POST(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const body = await req.json();
    const { fk_lugar, fk_servicio } = body as {
      fk_lugar?: number | null;
      fk_servicio?: number | null;
    };

    // Validar que solo uno de los dos esté presente
    if (fk_lugar !== null && fk_servicio !== null) {
      return NextResponse.json(
        { error: "No se pueden asignar un lugar y un servicio al mismo tiempo" },
        { status: 400 }
      );
    }

    if ((fk_lugar === null || fk_lugar === undefined) && (fk_servicio === null || fk_servicio === undefined)) {
      return NextResponse.json(
        { error: "Debe proporcionar al menos un ID de lugar o de servicio" },
        { status: 400 }
      );
    }

    // Verificar que el lugar o servicio existe
    if (fk_lugar !== null && fk_lugar !== undefined) {
      const { rows: lugarRows } = await pool.query(
        `SELECT id FROM lugar WHERE id = $1`,
        [fk_lugar]
      );
      if (!lugarRows?.length) {
        return NextResponse.json(
          { error: "El lugar especificado no existe" },
          { status: 404 }
        );
      }
    }

    if (fk_servicio !== null && fk_servicio !== undefined) {
      const { rows: servicioRows } = await pool.query(
        `SELECT id FROM servicio WHERE id = $1`,
        [fk_servicio]
      );
      if (!servicioRows?.length) {
        return NextResponse.json(
          { error: "El servicio especificado no existe" },
          { status: 404 }
        );
      }
    }

    // Usar INSERT ... ON CONFLICT para actualizar si ya existe
    await pool.query(
      `
      INSERT INTO lista_deseo (fk_cliente, fk_lugar, fk_servicio)
      VALUES ($1, $2, $3)
      ON CONFLICT (fk_cliente) 
      DO UPDATE SET 
        fk_lugar = EXCLUDED.fk_lugar,
        fk_servicio = EXCLUDED.fk_servicio
      `,
      [clienteId, fk_lugar || null, fk_servicio || null]
    );

    return NextResponse.json({ 
      ok: true, 
      message: "Lista de deseos actualizada exitosamente" 
    });
  } catch (e: any) {
    console.error("Error actualizando lista de deseos:", e);
    
    // Capturar errores de BD y traducirlos
    let errorMessage = "Error actualizando lista de deseos";
    if (e.code === '23503') { // Foreign key violation
      errorMessage = "Uno de los IDs proporcionados (lugar o servicio) no existe en la base de datos";
    } else if (e.message) {
      errorMessage = e.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cliente/deseos
 * 
 * Eliminar item de la lista de deseos del cliente.
 */
export async function DELETE() {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM lista_deseo WHERE fk_cliente = $1`,
      [clienteId]
    );

    if (rowCount === 0) {
      return NextResponse.json(
        { error: "No hay items en la lista de deseos para eliminar" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Item eliminado de la lista de deseos exitosamente" 
    });
  } catch (e: any) {
    console.error("Error eliminando de lista de deseos:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error eliminando de lista de deseos" },
      { status: 500 }
    );
  }
}
