import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

// POST: Agregar un servicio al itinerario de una venta
export async function POST(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  const body = await req.json();
  const { id_venta, id_servicio, fecha_inicio, aplicar_descuento } = body as {
    id_venta: number;
    id_servicio: number;
    fecha_inicio: string;
    aplicar_descuento?: boolean; // Si es true, aplica el descuento activo del servicio
  };

  if (!Number.isInteger(id_venta) || !Number.isInteger(id_servicio) || !fecha_inicio) {
    return NextResponse.json(
      { error: "id_venta, id_servicio y fecha_inicio son requeridos" },
      { status: 400 }
    );
  }

  try {
    // Verificar que la venta pertenece al cliente
    const { rows: ventaRows } = await pool.query(
      `SELECT fk_cliente FROM venta WHERE id_venta = $1`,
      [id_venta]
    );

    if (!ventaRows?.length) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    if (ventaRows[0].fk_cliente !== clienteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Si se solicita aplicar descuento, obtener el descuento activo y calcular precio con descuento
    let costoEspecial: number | null = null;
    if (aplicar_descuento) {
      const { rows: descuentoRows } = await pool.query(
        `
        SELECT d.porcentaje_descuento, s.costo_servicio
        FROM servicio s
        LEFT JOIN descuento d ON d.fk_servicio = s.id 
          AND (d.fecha_vencimiento IS NULL OR d.fecha_vencimiento >= CURRENT_DATE)
        WHERE s.id = $1
        ORDER BY d.porcentaje_descuento DESC NULLS LAST
        LIMIT 1
        `,
        [id_servicio]
      );

      if (descuentoRows?.length && descuentoRows[0].porcentaje_descuento) {
        const porcentaje = Number(descuentoRows[0].porcentaje_descuento);
        const costoOriginal = Number(descuentoRows[0].costo_servicio);
        costoEspecial = Math.round(costoOriginal * (1 - porcentaje / 100));
      }
    }

    // Si hay costo_especial (descuento aplicado), insertar directamente en itinerario
    // y luego recalcular monto de venta manualmente
    if (costoEspecial !== null) {
      // Obtener información del servicio para recalcular monto
      const { rows: servicioRows } = await pool.query(
        `
        SELECT s.costo_servicio, s.denominacion, COALESCE(v.costo_compensacion, 0) as costo_compensacion
        FROM servicio s
        LEFT JOIN viaje v ON s.fk_viaje = v.id
        WHERE s.id = $1
        `,
        [id_servicio]
      );

      if (!servicioRows?.length) {
        return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
      }

      const servicio = servicioRows[0];
      const compensacion = Number(servicio.costo_compensacion || 0);
      const denominacion = servicio.denominacion;

      // Insertar en itinerario con costo_especial
      const { rows: insertRows } = await pool.query(
        `
        INSERT INTO itinerario (fk_servicio, fk_venta, costo_especial, fecha_hora_inicio)
        VALUES ($1, $2, $3, $4::timestamp)
        RETURNING id
        `,
        [id_servicio, id_venta, costoEspecial, fecha_inicio]
      );

      const idItinerario = insertRows[0]?.id;
      if (!idItinerario) {
        throw new Error("Error agregando item al itinerario");
      }

      // Recalcular monto de venta usando la función almacenada
      await pool.query(
        `SELECT recalcular_monto_venta($1, $2, $3, $4, $5)`,
        [id_venta, costoEspecial, compensacion, denominacion, 1] // 1 = suma
      );

      return NextResponse.json({ ok: true, id_itinerario: idItinerario }, { status: 201 });
    } else {
      // Sin descuento, usar función almacenada normal
      const { rows } = await pool.query(
        `SELECT agregar_item_itinerario($1, $2, $3::date) AS id_itinerario`,
        [
          id_venta,
          id_servicio,
          fecha_inicio,
        ]
      );

      const idItinerario = rows[0]?.id_itinerario;
      if (!idItinerario) {
        throw new Error("Error agregando item al itinerario");
      }

      return NextResponse.json({ ok: true, id_itinerario: idItinerario }, { status: 201 });
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error agregando item al itinerario" },
      { status: 500 }
    );
  }
}

