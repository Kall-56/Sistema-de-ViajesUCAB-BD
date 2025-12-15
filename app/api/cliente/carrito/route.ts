import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

// GET: Obtener items del carrito del cliente
export async function GET() {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    // Detectar cambios antes de actualizar
    // Identificar items que tenían descuento pero el descuento ya no existe
    const { rows: itemsConDescuentoEliminado } = await pool.query(
      `
      SELECT 
        i.id AS id_itinerario,
        i.fk_venta,
        s.nombre AS nombre_servicio
      FROM itinerario i
      JOIN servicio s ON s.id = i.fk_servicio
      WHERE i.costo_especial IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM descuento d
          WHERE d.fk_servicio = s.id
            AND (d.fecha_vencimiento IS NULL OR d.fecha_vencimiento >= CURRENT_DATE)
        )
        AND EXISTS (
          SELECT 1 FROM venta v
          JOIN ven_est ve ON ve.fk_venta = v.id_venta
          JOIN estado e ON e.id = ve.fk_estado
          WHERE v.id_venta = i.fk_venta
            AND e.nombre = 'pendiente'
            AND ve.fecha_fin IS NULL
            AND v.fk_cliente = $1
        )
      `,
      [clienteId]
    );

    // Verificar servicios no disponibles (servicios eliminados)
    const { rows: serviciosNoDisponibles } = await pool.query(
      `
      SELECT i.id AS id_itinerario, 'Servicio eliminado' AS nombre_servicio
      FROM itinerario i
      WHERE i.fk_servicio NOT IN (SELECT id FROM servicio)
        AND EXISTS (
          SELECT 1 FROM venta v
          JOIN ven_est ve ON ve.fk_venta = v.id_venta
          JOIN estado e ON e.id = ve.fk_estado
          WHERE v.id_venta = i.fk_venta
            AND e.nombre = 'pendiente'
            AND ve.fecha_fin IS NULL
            AND v.fk_cliente = $1
        )
      `,
      [clienteId]
    );

    const hayCambios = itemsConDescuentoEliminado.length > 0 || serviciosNoDisponibles.length > 0;

    // Primero, verificar y limpiar descuentos que ya no existen
    // Si un itinerario tiene costo_especial pero el descuento ya no existe, quitar el descuento
    await pool.query(
      `
      UPDATE itinerario i
      SET costo_especial = NULL
      FROM servicio s
      WHERE i.fk_servicio = s.id
        AND i.costo_especial IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM descuento d
          WHERE d.fk_servicio = s.id
            AND (d.fecha_vencimiento IS NULL OR d.fecha_vencimiento >= CURRENT_DATE)
        )
        AND EXISTS (
          SELECT 1 FROM venta v
          JOIN ven_est ve ON ve.fk_venta = v.id_venta
          JOIN estado e ON e.id = ve.fk_estado
          WHERE v.id_venta = i.fk_venta
            AND e.nombre = 'pendiente'
            AND ve.fecha_fin IS NULL
            AND v.fk_cliente = $1
        )
      `,
      [clienteId]
    );

    // Recalcular montos de ventas afectadas
    const { rows: ventasAfectadas } = await pool.query(
      `
      SELECT DISTINCT v.id_venta
      FROM venta v
      JOIN ven_est ve ON ve.fk_venta = v.id_venta
      JOIN estado e ON e.id = ve.fk_estado
      WHERE v.fk_cliente = $1
        AND e.nombre = 'pendiente'
        AND ve.fecha_fin IS NULL
        AND EXISTS (
          SELECT 1 FROM itinerario i
          WHERE i.fk_venta = v.id_venta
            AND i.costo_especial IS NULL
        )
      `,
      [clienteId]
    );

    // Recalcular montos de todas las ventas afectadas
    // La función recalcular_monto_venta ajusta el monto, pero necesitamos recalcular desde cero
    // Por ahora, simplemente actualizamos el monto_total basado en los items actuales
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
          [venta.id_venta]
        );

        if (calculo?.length) {
          await pool.query(
            `UPDATE venta SET monto_total = $1, monto_compensacion = $2 WHERE id_venta = $3`,
            [calculo[0].nuevo_monto_total, calculo[0].nuevo_monto_compensacion, venta.id_venta]
          );
        }
      } catch (recalcError: any) {
        console.error(`Error recalculando venta ${venta.id_venta}:`, recalcError);
      }
    }

    // Obtener ventas pendientes que están "en carrito" (ventas pendientes con items)
    const { rows } = await pool.query(
      `
      SELECT
        v.id_venta,
        v.monto_total,
        v.monto_compensacion,
        (SELECT COUNT(*) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS cantidad_items,
        (SELECT MIN(i.fecha_hora_inicio) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS fecha_inicio_minima,
        (SELECT array_agg(
          json_build_object(
            'id_itinerario', i.id,
            'id_servicio', i.fk_servicio,
            'nombre_servicio', s.nombre,
            'descripcion_servicio', s.descripcion,
            'costo_unitario_original', COALESCE(i.costo_especial, s.costo_servicio),
            'costo_unitario_sin_descuento', s.costo_servicio,
            'tiene_descuento', CASE WHEN i.costo_especial IS NOT NULL AND i.costo_especial < s.costo_servicio THEN true ELSE false END,
            'descuento_aplicado', CASE WHEN i.costo_especial IS NOT NULL AND i.costo_especial < s.costo_servicio THEN s.costo_servicio - i.costo_especial ELSE 0 END,
            'costo_unitario_bs', 
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
              END,
            'fecha_inicio', i.fecha_hora_inicio,
            'tipo_servicio', s.tipo_servicio,
            'denominacion_original', s.denominacion,
            'denominacion', 'VEN',
            'lugar_nombre', l.nombre,
            'servicio_activo', CASE WHEN s.id IS NOT NULL THEN true ELSE false END,
            'precio_cambiado', CASE 
              WHEN i.costo_especial IS NULL 
                AND EXISTS (
                  SELECT 1 FROM itinerario i2 
                  WHERE i2.id = i.id 
                    AND i2.costo_especial IS NOT NULL
                )
                AND NOT EXISTS (
                  SELECT 1 FROM descuento d
                  WHERE d.fk_servicio = s.id
                    AND (d.fecha_vencimiento IS NULL OR d.fecha_vencimiento >= CURRENT_DATE)
                )
              THEN true
              ELSE false
            END
          )
        )
        FROM itinerario i
        JOIN servicio s ON s.id = i.fk_servicio
        LEFT JOIN lugar l ON l.id = s.fk_lugar
        WHERE i.fk_venta = v.id_venta) AS items
      FROM venta v
      WHERE v.fk_cliente = $1
        AND EXISTS (
          SELECT 1 FROM ven_est ve
          JOIN estado e ON e.id = ve.fk_estado
          WHERE ve.fk_venta = v.id_venta
            AND e.nombre = 'pendiente'
            AND ve.fecha_fin IS NULL
        )
        AND EXISTS (
          SELECT 1 FROM itinerario i WHERE i.fk_venta = v.id_venta
        )
      ORDER BY v.id_venta DESC
      `,
      [clienteId]
    );

    // Contar items con cambios
    let itemsPrecioCambiado = 0;
    let itemsNoDisponibles = 0;
    
    for (const venta of rows) {
      if (venta.items && Array.isArray(venta.items)) {
        for (const item of venta.items) {
          if (item.precio_cambiado) itemsPrecioCambiado++;
          if (!item.servicio_activo) itemsNoDisponibles++;
        }
      }
    }

    return NextResponse.json({ 
      items: rows,
      cambios: {
        hay_cambios: hayCambios || itemsPrecioCambiado > 0 || itemsNoDisponibles > 0,
        items_precio_cambiado: itemsPrecioCambiado,
        items_no_disponibles: itemsNoDisponibles,
        servicios_no_disponibles: serviciosNoDisponibles.map((s: any) => ({
          id_itinerario: s.id_itinerario,
          nombre: s.nombre_servicio
        })),
        items_precio_actualizado: itemsConDescuentoEliminado.map((i: any) => ({
          id_itinerario: i.id_itinerario,
          nombre: i.nombre_servicio
        }))
      }
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo carrito" },
      { status: 500 }
    );
  }
}

// POST: Agregar itinerario al carrito (marcar venta como lista para pago)
export async function POST(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  const body = await req.json();
  const { id_venta } = body as { id_venta: number };

  if (!Number.isInteger(id_venta) || id_venta <= 0) {
    return NextResponse.json({ error: "ID de venta inválido" }, { status: 400 });
  }

  try {
    // Verificar que la venta pertenece al cliente y tiene items
    const { rows: ventaRows } = await pool.query(
      `
      SELECT v.fk_cliente, 
             (SELECT COUNT(*) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS cantidad_items
      FROM venta v
      WHERE v.id_venta = $1
      `,
      [id_venta]
    );

    if (!ventaRows?.length) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    if (ventaRows[0].fk_cliente !== clienteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (ventaRows[0].cantidad_items === 0) {
      return NextResponse.json(
        { error: "El itinerario debe tener al menos un servicio" },
        { status: 400 }
      );
    }

    // Verificar que no tenga fechas pasadas
    const { rows: fechasRows } = await pool.query(
      `
      SELECT MIN(i.fecha_hora_inicio) AS fecha_min
      FROM itinerario i
      WHERE i.fk_venta = $1
      `,
      [id_venta]
    );

    if (fechasRows[0]?.fecha_min) {
      const fechaMin = new Date(fechasRows[0].fecha_min);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaMin < hoy) {
        return NextResponse.json(
          { error: "No se puede agregar al carrito un itinerario con fechas pasadas" },
          { status: 400 }
        );
      }
    }

    // La venta ya está pendiente, solo verificamos que esté bien
    // En el futuro podríamos agregar un campo "en_carrito" si es necesario

    return NextResponse.json({ ok: true, id_venta });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error agregando al carrito" },
      { status: 500 }
    );
  }
}

