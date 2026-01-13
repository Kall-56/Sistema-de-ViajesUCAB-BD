import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * GET /api/cliente/cuotas
 * 
 * Obtener planes de cuotas y cronograma de cuotas del cliente.
 * 
 * Query params:
 * - id_venta: ID de la venta (opcional, si no se proporciona retorna todas)
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

    let query: string;
    let params: any[];

    if (idVenta && Number.isInteger(Number(idVenta))) {
      query = `
        SELECT 
          pc.id_plan_cuotas,
          pc.tasa_interes,
          pc.fk_venta,
          v.monto_total AS monto_total_venta,
          (SELECT COUNT(*) FROM cuota c WHERE c.fk_plan_cuotas = pc.id_plan_cuotas) AS total_cuotas,
          (SELECT COUNT(*) 
           FROM cuota c 
           JOIN cuo_ecuo ce ON ce.fk_cuota = c.id_cuota
           JOIN estado e ON e.id = ce.fk_estado
           WHERE c.fk_plan_cuotas = pc.id_plan_cuotas
             AND e.nombre = 'Pagado'
             AND ce.fecha_fin IS NULL) AS cuotas_pagadas,
          (SELECT COALESCE(SUM(c.monto_cuota), 0)
           FROM cuota c
           WHERE c.fk_plan_cuotas = pc.id_plan_cuotas) AS monto_total_financiado,
          (SELECT COALESCE(SUM(c.monto_cuota), 0)
           FROM cuota c
           JOIN cuo_ecuo ce ON ce.fk_cuota = c.id_cuota
           JOIN estado e ON e.id = ce.fk_estado
           WHERE c.fk_plan_cuotas = pc.id_plan_cuotas
             AND e.nombre = 'Pagado'
             AND ce.fecha_fin IS NULL) AS monto_pagado,
          (SELECT COALESCE(SUM(c.monto_cuota), 0)
           FROM cuota c
           JOIN cuo_ecuo ce ON ce.fk_cuota = c.id_cuota
           JOIN estado e ON e.id = ce.fk_estado
           WHERE c.fk_plan_cuotas = pc.id_plan_cuotas
             AND e.nombre = 'pendiente'
             AND ce.fecha_fin IS NULL) AS saldo_pendiente
        FROM plan_cuotas pc
        JOIN venta v ON v.id_venta = pc.fk_venta
        WHERE v.fk_cliente = $1
          AND pc.fk_venta = $2
        ORDER BY pc.id_plan_cuotas DESC
      `;
      params = [clienteId, Number(idVenta)];
    } else {
      query = `
        SELECT 
          pc.id_plan_cuotas,
          pc.tasa_interes,
          pc.fk_venta,
          v.monto_total AS monto_total_venta,
          (SELECT COUNT(*) FROM cuota c WHERE c.fk_plan_cuotas = pc.id_plan_cuotas) AS total_cuotas,
          (SELECT COUNT(*) 
           FROM cuota c 
           JOIN cuo_ecuo ce ON ce.fk_cuota = c.id_cuota
           JOIN estado e ON e.id = ce.fk_estado
           WHERE c.fk_plan_cuotas = pc.id_plan_cuotas
             AND e.nombre = 'Pagado'
             AND ce.fecha_fin IS NULL) AS cuotas_pagadas,
          (SELECT COALESCE(SUM(c.monto_cuota), 0)
           FROM cuota c
           WHERE c.fk_plan_cuotas = pc.id_plan_cuotas) AS monto_total_financiado,
          (SELECT COALESCE(SUM(c.monto_cuota), 0)
           FROM cuota c
           JOIN cuo_ecuo ce ON ce.fk_cuota = c.id_cuota
           JOIN estado e ON e.id = ce.fk_estado
           WHERE c.fk_plan_cuotas = pc.id_plan_cuotas
             AND e.nombre = 'Pagado'
             AND ce.fecha_fin IS NULL) AS monto_pagado,
          (SELECT COALESCE(SUM(c.monto_cuota), 0)
           FROM cuota c
           JOIN cuo_ecuo ce ON ce.fk_cuota = c.id_cuota
           JOIN estado e ON e.id = ce.fk_estado
           WHERE c.fk_plan_cuotas = pc.id_plan_cuotas
             AND e.nombre = 'pendiente'
             AND ce.fecha_fin IS NULL) AS saldo_pendiente
        FROM plan_cuotas pc
        JOIN venta v ON v.id_venta = pc.fk_venta
        WHERE v.fk_cliente = $1
        ORDER BY pc.id_plan_cuotas DESC
      `;
      params = [clienteId];
    }

    const { rows: planesRows } = await pool.query(query, params);

    // Para cada plan, obtener las cuotas
    const planesConCuotas = await Promise.all(
      planesRows.map(async (plan) => {
        const { rows: cuotasRows } = await pool.query(
          `
          SELECT 
            c.id_cuota,
            c.monto_cuota,
            c.fecha_pagar,
            e.nombre AS estado,
            ce.fecha_inicio AS fecha_estado,
            (SELECT COUNT(*) FROM pago p 
             WHERE p.fk_venta = $1 
             AND EXISTS (
               SELECT 1 FROM cuota c2
               JOIN plan_cuotas pc2 ON pc2.id_plan_cuotas = c2.fk_plan_cuotas
               WHERE c2.id_cuota = c.id_cuota
               AND pc2.fk_venta = p.fk_venta
             )) AS tiene_pago
          FROM cuota c
          JOIN cuo_ecuo ce ON ce.fk_cuota = c.id_cuota
          JOIN estado e ON e.id = ce.fk_estado
          WHERE c.fk_plan_cuotas = $2
            AND ce.fecha_fin IS NULL
          ORDER BY c.fecha_pagar ASC
          `,
          [plan.fk_venta, plan.id_plan_cuotas]
        );

        return {
          ...plan,
          cuotas: cuotasRows || [],
        };
      })
    );

    return NextResponse.json({ planes: planesConCuotas });
  } catch (e: any) {
    console.error("Error obteniendo cuotas:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo planes de cuotas" },
      { status: 500 }
    );
  }
}
