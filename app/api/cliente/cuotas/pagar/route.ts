import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

/**
 * POST /api/cliente/cuotas/pagar
 * 
 * Pagar una cuota específica usando la función pagar_cuota().
 * 
 * Body:
 * - id_cuota: ID de la cuota a pagar
 * - monto: Monto a pagar (debe coincidir con monto_cuota)
 * - id_metodo_pago: ID del método de pago
 * - denominacion: Denominación del pago ('VEN', 'USD', etc.)
 */
export async function POST(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const body = await req.json();
    const { id_cuota, monto, id_metodo_pago, denominacion } = body as {
      id_cuota: number;
      monto: number;
      id_metodo_pago: number;
      denominacion: string;
    };

    if (!Number.isInteger(id_cuota) || id_cuota <= 0) {
      return NextResponse.json(
        { error: "ID de cuota inválido" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(monto) || monto <= 0) {
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(id_metodo_pago) || id_metodo_pago <= 0) {
      return NextResponse.json(
        { error: "ID de método de pago inválido" },
        { status: 400 }
      );
    }

    if (!denominacion) {
      return NextResponse.json(
        { error: "Denominación requerida" },
        { status: 400 }
      );
    }

    // Verificar que la cuota pertenece a una venta del cliente
    const { rows: cuotaRows } = await pool.query(
      `
      SELECT 
        c.id_cuota,
        c.monto_cuota,
        v.id_venta,
        v.fk_cliente,
        e.nombre AS estado_venta
      FROM cuota c
      JOIN plan_cuotas pc ON pc.id_plan_cuotas = c.fk_plan_cuotas
      JOIN venta v ON v.id_venta = pc.fk_venta
      JOIN ven_est ve ON ve.fk_venta = v.id_venta
      JOIN estado e ON e.id = ve.fk_estado
      WHERE c.id_cuota = $1
        AND ve.fecha_fin IS NULL
      `,
      [id_cuota]
    );

    if (!cuotaRows?.length) {
      return NextResponse.json(
        { error: "Cuota no encontrada" },
        { status: 404 }
      );
    }

    const cuota = cuotaRows[0];

    if (cuota.fk_cliente !== clienteId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    // Verificar que el método de pago pertenece al cliente
    const { rows: metodoRows } = await pool.query(
      `SELECT fk_cliente FROM metodo_pago WHERE id_metodo_pago = $1`,
      [id_metodo_pago]
    );

    if (!metodoRows?.length || metodoRows[0].fk_cliente !== clienteId) {
      return NextResponse.json(
        { error: "Método de pago no válido o no autorizado" },
        { status: 403 }
      );
    }

    // Verificar que el monto coincide con el monto de la cuota
    if (Number(cuota.monto_cuota) !== monto) {
      return NextResponse.json(
        { 
          error: `El monto debe ser exactamente ${cuota.monto_cuota}. Monto proporcionado: ${monto}`,
          monto_requerido: Number(cuota.monto_cuota)
        },
        { status: 400 }
      );
    }

    // Llamar a la función pagar_cuota()
    try {
      const { rows } = await pool.query(
        `SELECT pagar_cuota($1, $2, $3, $4) AS resultado`,
        [id_cuota, monto, id_metodo_pago, denominacion]
      );

      const resultado = rows[0]?.resultado;

      if (!resultado || resultado !== 1) {
        throw new Error("Error pagando cuota");
      }

      // Obtener información actualizada de la cuota
      const { rows: cuotaActualizadaRows } = await pool.query(
        `
        SELECT 
          c.id_cuota,
          c.monto_cuota,
          c.fecha_pagar,
          e.nombre AS estado,
          pc.fk_venta
        FROM cuota c
        JOIN cuo_ecuo ce ON ce.fk_cuota = c.id_cuota
        JOIN estado e ON e.id = ce.fk_estado
        JOIN plan_cuotas pc ON pc.id_plan_cuotas = c.fk_plan_cuotas
        WHERE c.id_cuota = $1
          AND ce.fecha_fin IS NULL
        `,
        [id_cuota]
      );

      return NextResponse.json({
        ok: true,
        cuota: cuotaActualizadaRows[0],
        message: "Cuota pagada exitosamente"
      });
    } catch (funcionError: any) {
      // La función lanza EXCEPTION con mensaje descriptivo
      let errorMessage = "Error pagando cuota";
      
      if (funcionError.message?.includes("monto tiene que ser igual")) {
        errorMessage = `El monto debe ser exactamente ${cuota.monto_cuota}`;
      } else if (funcionError.message?.includes("ya haya sido pagada")) {
        errorMessage = "No se puede pagar una cuota de una venta que ya está completamente pagada";
      } else if (funcionError.message) {
        errorMessage = funcionError.message;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
  } catch (e: any) {
    console.error("Error pagando cuota:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error pagando cuota" },
      { status: 500 }
    );
  }
}
