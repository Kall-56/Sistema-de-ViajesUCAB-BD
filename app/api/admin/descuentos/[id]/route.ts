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
    // Obtener información del descuento antes de eliminarlo
    const { rows: descuentoInfo } = await pool.query(
      `SELECT fk_servicio FROM descuento WHERE id = $1`,
      [id]
    );

    if (!descuentoInfo?.length) {
      return NextResponse.json({ error: "Descuento no encontrado" }, { status: 404 });
    }

    const servicioId = descuentoInfo[0].fk_servicio;

    // Eliminar el descuento
    const { rows } = await pool.query(
      `SELECT eliminar_descuento($1) AS id`,
      [id]
    );

    // Recalcular precios de itinerarios en carritos que tenían este descuento aplicado
    // Buscar ventas pendientes con itinerarios de este servicio que tenían descuento
    const { rows: ventasAfectadas } = await pool.query(
      `
      SELECT DISTINCT i.fk_venta
      FROM itinerario i
      WHERE i.fk_servicio = $1
        AND i.costo_especial IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM ven_est ve
          JOIN estado e ON e.id = ve.fk_estado
          WHERE ve.fk_venta = i.fk_venta
            AND e.nombre = 'pendiente'
            AND ve.fecha_fin IS NULL
        )
      `,
      [servicioId]
    );

    // Quitar el descuento de todos los itinerarios afectados
    await pool.query(
      `UPDATE itinerario SET costo_especial = NULL WHERE fk_servicio = $1 AND costo_especial IS NOT NULL`,
      [servicioId]
    );

    // Recalcular montos de ventas afectadas
    for (const venta of ventasAfectadas) {
      try {
        // Calcular nuevo monto total y compensación desde los items actuales
        const { rows: calculo } = await pool.query(
          `
          SELECT 
            COALESCE(SUM(
              CASE 
                WHEN s.denominacion != 'VEN' THEN
                  COALESCE(i.costo_especial, s.costo_servicio) * 
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
                  COALESCE(i.costo_especial, s.costo_servicio)
              END
            ), 0) AS nuevo_monto_total,
            COALESCE(SUM(COALESCE(v.costo_compensacion, 0)), 0) AS nuevo_monto_compensacion
          FROM itinerario i
          JOIN servicio s ON s.id = i.fk_servicio
          LEFT JOIN viaje v ON s.fk_viaje = v.id
          WHERE i.fk_venta = $1
          `,
          [venta.fk_venta]
        );

        if (calculo?.length) {
          await pool.query(
            `UPDATE venta SET monto_total = $1, monto_compensacion = $2 WHERE id_venta = $3`,
            [calculo[0].nuevo_monto_total, calculo[0].nuevo_monto_compensacion, venta.fk_venta]
          );
        }
      } catch (recalcError: any) {
        console.error(`Error recalculando venta ${venta.fk_venta} tras eliminar descuento:`, recalcError);
        // Continuar con las demás aunque una falle
      }
    }

    return NextResponse.json({ 
      ok: true, 
      id: rows[0]?.id,
      ventas_actualizadas: ventasAfectadas.length,
      mensaje: ventasAfectadas.length > 0 
        ? `El descuento ha sido eliminado. Se actualizaron ${ventasAfectadas.length} carrito(s) que tenían este descuento aplicado.`
        : "El descuento ha sido eliminado correctamente."
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error eliminando descuento" },
      { status: 500 }
    );
  }
}

