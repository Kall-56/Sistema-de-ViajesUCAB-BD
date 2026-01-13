import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * GET /api/cliente/deseos
 * 
 * Obtener la lista de deseos del cliente.
 * 
 * Nota: La tabla lista_deseo ahora permite múltiples registros por cliente.
 * Cada registro puede contener fk_lugar O fk_servicio (no ambos).
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
        ld.id,
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
        END AS servicio_denominacion_original,
        CASE 
          WHEN ld.fk_servicio IS NOT NULL THEN 
            CASE 
              WHEN s.denominacion != 'VEN' THEN
                s.costo_servicio * 
                COALESCE(
                  (SELECT cantidad_cambio 
                   FROM cambio_moneda 
                   WHERE denominacion = s.denominacion 
                     AND fecha_fin IS NULL 
                   ORDER BY fecha_inicio DESC 
                   LIMIT 1), 
                  1
                )
              ELSE
                s.costo_servicio
            END
          ELSE NULL
        END AS servicio_costo_bs,
        'VEN' AS servicio_denominacion,
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
      ORDER BY ld.id DESC
      `,
      [clienteId]
    );

    return NextResponse.json({ 
      deseos: rows || [],
      message: rows?.length ? `${rows.length} item(s) en tu lista de deseos` : "No tienes items en tu lista de deseos"
    });
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
 * Agregar item a la lista de deseos.
 * 
 * Body:
 * - fk_lugar: ID del lugar (opcional, debe ser null si fk_servicio está presente)
 * - fk_servicio: ID del servicio (opcional, debe ser null si fk_lugar está presente)
 * 
 * Nota: Ahora permite múltiples registros por cliente. Se valida que no exista el mismo lugar/servicio.
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

    // Validar que no se proporcionen ambos o ninguno
    if ((fk_lugar && fk_servicio) || (!fk_lugar && !fk_servicio)) {
      return NextResponse.json(
        { error: "Debe proporcionar exactamente uno: fk_lugar O fk_servicio" },
        { status: 400 }
      );
    }

    // Verificar si ya existe este item en la lista de deseos del cliente
    const { rows: existing } = await pool.query(
      `
      SELECT id FROM lista_deseo 
      WHERE fk_cliente = $1 
        AND (
          (fk_lugar = $2 AND $2 IS NOT NULL) OR 
          (fk_servicio = $3 AND $3 IS NOT NULL)
        )
      `,
      [clienteId, fk_lugar || null, fk_servicio || null]
    );

    if (existing?.length > 0) {
      return NextResponse.json(
        { error: "Este item ya está en tu lista de deseos" },
        { status: 400 }
      );
    }

    // Usar la función de BD listar_deseos para insertar
    // La función maneja las validaciones internamente:
    // - No permite lugar y servicio al mismo tiempo
    // - Require al menos uno de los dos
    // - Valida existencia de FK
    await pool.query(
      `SELECT listar_deseos($1, $2, $3)`,
      [clienteId, fk_lugar || null, fk_servicio || null]
    );

    return NextResponse.json({ 
      ok: true, 
      message: "Item agregado a la lista de deseos exitosamente" 
    });
  } catch (e: any) {
    console.error("Error agregando a lista de deseos:", e);
    
    // Capturar errores de BD y traducirlos
    let errorMessage = "Error agregando a la lista de deseos";
    if (e.code === '23503') { // Foreign key violation
      errorMessage = "Uno de los IDs proporcionados (cliente, lugar o servicio) no existe en la base de datos";
    } else if (e.message) {
      // La función listar_deseos lanza excepciones con mensajes claros
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
 * Eliminar item(s) de la lista de deseos del cliente.
 * 
 * Query params:
 * - id: ID específico del item a eliminar (opcional). Si no se proporciona, elimina todos.
 */
export async function DELETE(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    let rowCount: number;

    if (idParam) {
      // Eliminar un item específico
      const id = Number.parseInt(idParam);
      if (isNaN(id) || id <= 0) {
        return NextResponse.json(
          { error: "ID inválido" },
          { status: 400 }
        );
      }

      // Verificar que el item pertenece al cliente
      const { rows: checkRows } = await pool.query(
        `SELECT id FROM lista_deseo WHERE id = $1 AND fk_cliente = $2`,
        [id, clienteId]
      );

      if (!checkRows?.length) {
        return NextResponse.json(
          { error: "Item no encontrado o no pertenece a tu lista de deseos" },
          { status: 404 }
        );
      }

      const result = await pool.query(
        `DELETE FROM lista_deseo WHERE id = $1 AND fk_cliente = $2`,
        [id, clienteId]
      );
      rowCount = result.rowCount || 0;
    } else {
      // Eliminar todos los items del cliente
      const result = await pool.query(
        `DELETE FROM lista_deseo WHERE fk_cliente = $1`,
        [clienteId]
      );
      rowCount = result.rowCount || 0;
    }

    if (rowCount === 0) {
      return NextResponse.json(
        { error: "No hay items en la lista de deseos para eliminar" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      message: idParam 
        ? "Item eliminado de la lista de deseos exitosamente"
        : `${rowCount} item(s) eliminado(s) de la lista de deseos exitosamente`
    });
  } catch (e: any) {
    console.error("Error eliminando de lista de deseos:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error eliminando de lista de deseos" },
      { status: 500 }
    );
  }
}
