import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * GET /api/cliente/reembolsos/calcular
 * 
 * Calcular el monto de reembolso para una venta específica.
 * Esta función consulta la BD para obtener el monto que se reembolsaría.
 * 
 * Query params:
 * - id_venta: ID de la venta
 */
export async function GET(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const { searchParams } = new URL(req.url);
    const idVenta = searchParams.get("id_venta");

    if (!idVenta || !Number.isInteger(Number(idVenta)) || Number(idVenta) <= 0) {
      return NextResponse.json(
        { error: "ID de venta inválido" },
        { status: 400 }
      );
    }

    const idVentaNum = Number(idVenta);

    // Verificar que la venta pertenece al cliente
    const { rows: ventaRows } = await pool.query(
      `
      SELECT 
        v.id_venta,
        v.monto_total,
        v.fk_cliente,
        e.nombre AS estado_actual
      FROM venta v
      LEFT JOIN ven_est ve ON ve.fk_venta = v.id_venta AND ve.fecha_fin IS NULL
      LEFT JOIN estado e ON e.id = ve.fk_estado
      WHERE v.id_venta = $1
      `,
      [idVentaNum]
    );

    if (!ventaRows?.length) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    const venta = ventaRows[0];

    if (venta.fk_cliente !== clienteId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    // Verificar que la venta esté en estado "Pagado"
    if (venta.estado_actual !== "Pagado") {
      return NextResponse.json(
        { 
          error: "Solo se pueden reembolsar ventas en estado 'Pagado'",
          puede_reembolsar: false
        },
        { status: 400 }
      );
    }

    // Verificar que no haya un reembolso ya registrado
    const { rows: reembolsoRows } = await pool.query(
      `SELECT id_reembolso FROM reembolso WHERE fk_venta = $1`,
      [idVentaNum]
    );

    if (reembolsoRows?.length > 0) {
      return NextResponse.json(
        { 
          error: "Esta venta ya tiene un reembolso registrado",
          puede_reembolsar: false
        },
        { status: 400 }
      );
    }

    // El procedimiento realizar_reembolso reembolsa el monto_total completo
    // Si en el futuro se necesita penalización, debe calcularse en una función de BD
    // Por ahora, el monto de reembolso es igual al monto total
    const montoReembolso = Number(venta.monto_total);
    const montoOriginal = montoReembolso;
    const penalizacion = 0; // Por ahora no hay penalización en el procedimiento

    return NextResponse.json({
      id_venta: idVentaNum,
      monto_original: montoOriginal,
      monto_reembolso: montoReembolso,
      penalizacion: penalizacion,
      puede_reembolsar: true
    });
  } catch (e: any) {
    console.error("Error calculando reembolso:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error calculando monto de reembolso" },
      { status: 500 }
    );
  }
}
