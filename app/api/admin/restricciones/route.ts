import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

/**
 * GET /api/admin/restricciones
 * 
 * Obtener todas las restricciones de un paquete específico.
 * 
 * Query params:
 * - id_paquete: ID del paquete (opcional, si no se proporciona retorna todas)
 */
export async function GET(req: Request) {
  const auth = requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const idPaquete = searchParams.get("id_paquete");

    let query: string;
    let params: any[];

    if (idPaquete && Number.isInteger(Number(idPaquete))) {
      query = `
        SELECT 
          r.id_restriccion,
          r.fk_paquete,
          r.caracteristica,
          r.operador,
          r.valor_restriccion,
          p.nombre AS nombre_paquete
        FROM restriccion r
        JOIN paquete p ON p.id = r.fk_paquete
        WHERE r.fk_paquete = $1
        ORDER BY r.id_restriccion
      `;
      params = [Number(idPaquete)];
    } else {
      query = `
        SELECT 
          r.id_restriccion,
          r.fk_paquete,
          r.caracteristica,
          r.operador,
          r.valor_restriccion,
          p.nombre AS nombre_paquete
        FROM restriccion r
        JOIN paquete p ON p.id = r.fk_paquete
        ORDER BY r.fk_paquete, r.id_restriccion
      `;
      params = [];
    }

    const { rows } = await pool.query(query, params);

    return NextResponse.json({ restricciones: rows });
  } catch (e: any) {
    console.error("Error obteniendo restricciones:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo restricciones" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/restricciones
 * 
 * Crear una nueva restricción para un paquete.
 * Usa el procedimiento almacenado gestionar_restriccion_paquete.
 * 
 * Body:
 * - id_paquete: ID del paquete
 * - caracteristica: 'edad' o 'estado_civil'
 * - operador: '>', '<', '=', '!='
 * - valor_restriccion: Valor de la restricción
 */
export async function POST(req: Request) {
  const auth = requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const usuarioId = auth.session.userId!;

  try {
    const body = await req.json();
    const { id_paquete, caracteristica, operador, valor_restriccion } = body as {
      id_paquete: number;
      caracteristica: string;
      operador: string;
      valor_restriccion: string;
    };

    if (!Number.isInteger(id_paquete) || id_paquete <= 0) {
      return NextResponse.json(
        { error: "ID de paquete inválido" },
        { status: 400 }
      );
    }

    if (!caracteristica || !operador || !valor_restriccion) {
      return NextResponse.json(
        { error: "caracteristica, operador y valor_restriccion son requeridos" },
        { status: 400 }
      );
    }

    const caracteristicasValidas = ["edad", "estado_civil"];
    if (!caracteristicasValidas.includes(caracteristica.toLowerCase())) {
      return NextResponse.json(
        { error: `Característica inválida. Debe ser una de: ${caracteristicasValidas.join(", ")}` },
        { status: 400 }
      );
    }

    const operadoresValidos = [">", "<", "=", "!="];
    if (!operadoresValidos.includes(operador)) {
      return NextResponse.json(
        { error: `Operador inválido. Debe ser uno de: ${operadoresValidos.join(", ")}` },
        { status: 400 }
      );
    }

    if (caracteristica.toLowerCase() === "edad" && isNaN(Number(valor_restriccion))) {
      return NextResponse.json(
        { error: "El valor de restricción para edad debe ser un número" },
        { status: 400 }
      );
    }

    if (caracteristica.toLowerCase() === "estado_civil") {
      const estadosValidos = ["soltero", "casado", "divorciado", "viudo"];
      if (!estadosValidos.includes(valor_restriccion.toLowerCase())) {
        return NextResponse.json(
          { error: `Estado civil inválido. Debe ser uno de: ${estadosValidos.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Verificar que el paquete existe
    const { rows: paqueteRows } = await pool.query(
      `SELECT id FROM paquete WHERE id = $1`,
      [id_paquete]
    );

    if (!paqueteRows?.length) {
      return NextResponse.json(
        { error: "Paquete no encontrado" },
        { status: 404 }
      );
    }

    // Llamar al procedimiento almacenado
    await pool.query(
      `CALL gestionar_restriccion_paquete($1, $2, $3, $4, $5)`,
      [usuarioId, id_paquete, caracteristica, operador, valor_restriccion]
    );

    // Obtener la restricción creada
    const { rows: restriccionRows } = await pool.query(
      `SELECT * FROM restriccion 
       WHERE fk_paquete = $1 
         AND caracteristica = $2 
         AND operador = $3 
         AND valor_restriccion = $4
       ORDER BY id_restriccion DESC
       LIMIT 1`,
      [id_paquete, caracteristica.toLowerCase(), operador, valor_restriccion.toLowerCase()]
    );

    return NextResponse.json({
      ok: true,
      restriccion: restriccionRows[0],
      message: "Restricción creada exitosamente"
    }, { status: 201 });
  } catch (e: any) {
    console.error("Error creando restricción:", e);
    
    let errorMessage = "Error creando restricción";
    if (e.code === '23503') {
      errorMessage = "El paquete especificado no existe";
    } else if (e.message) {
      errorMessage = e.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
