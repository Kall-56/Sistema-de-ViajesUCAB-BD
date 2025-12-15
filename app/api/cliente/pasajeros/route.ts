import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCliente } from "@/lib/require-admin";

// POST: Crear un pasajero (cliente sin usuario) para agregar al carrito
export async function POST(req: Request) {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    const body = await req.json();
    const {
      nombre_1,
      nombre_2,
      apellido_1,
      apellido_2,
      c_i,
      telefonos,
      direccion,
      estado_civil,
      fecha_nacimiento,
    } = body as {
      nombre_1: string;
      nombre_2?: string | null;
      apellido_1: string;
      apellido_2?: string | null;
      c_i: number;
      telefonos: bigint[];
      direccion: string;
      estado_civil: "soltero" | "casado" | "divorciado" | "viudo";
      fecha_nacimiento: string;
    };

    // Validaciones básicas
    if (!nombre_1 || !apellido_1 || !c_i || !direccion || !estado_civil || !fecha_nacimiento) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (!Array.isArray(telefonos) || telefonos.length === 0) {
      return NextResponse.json(
        { error: "Debe proporcionar al menos un teléfono" },
        { status: 400 }
      );
    }

    // Validar estado civil
    const estadosValidos = ["soltero", "casado", "divorciado", "viudo"];
    if (!estadosValidos.includes(estado_civil)) {
      return NextResponse.json(
        { error: "Estado civil inválido" },
        { status: 400 }
      );
    }

    // Convertir telefonos a bigint[]
    const telefonosBigInt = telefonos.map((t) => {
      if (typeof t === "string") {
        return BigInt(t.replace(/\D/g, ""));
      }
      return BigInt(t);
    });

    // Crear cliente pasajero directamente (sin usuario)
    const { rows } = await pool.query(
      `
      INSERT INTO cliente (
        nombre_1, nombre_2, apellido_1, apellido_2, 
        c_i, telefonos, direccion, estado_civil, fecha_nacimiento
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::date)
      RETURNING id
      `,
      [
        nombre_1.trim(),
        nombre_2?.trim() || null,
        apellido_1.trim(),
        apellido_2?.trim() || null,
        c_i,
        telefonosBigInt,
        direccion.trim(),
        estado_civil,
        fecha_nacimiento,
      ]
    );

    const pasajeroId = rows[0]?.id;
    if (!pasajeroId) {
      throw new Error("Error creando pasajero");
    }

    // Crear tabla intermedia si no existe
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS cliente_pasajeros (
        id SERIAL PRIMARY KEY,
        fk_cliente_principal INTEGER NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
        fk_pasajero INTEGER NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fk_cliente_principal, fk_pasajero)
      )
      `
    ).catch(() => {}); // Ignorar si ya existe

    // Asociar el pasajero con el cliente principal
    await pool.query(
      `
      INSERT INTO cliente_pasajeros (fk_cliente_principal, fk_pasajero)
      VALUES ($1, $2)
      ON CONFLICT (fk_cliente_principal, fk_pasajero) DO NOTHING
      `,
      [clienteId, pasajeroId]
    );

    return NextResponse.json(
      { 
        ok: true, 
        id_pasajero: pasajeroId,
        message: "Pasajero creado exitosamente" 
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("Error creando pasajero:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error creando pasajero" },
      { status: 500 }
    );
  }
}

// GET: Listar pasajeros del cliente (clientes asociados al usuario principal)
export async function GET() {
  const auth = requireCliente();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clienteId = auth.session.clienteId!;

  try {
    // Crear tabla intermedia si no existe para asociar pasajeros con el cliente principal
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS cliente_pasajeros (
        id SERIAL PRIMARY KEY,
        fk_cliente_principal INTEGER NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
        fk_pasajero INTEGER NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fk_cliente_principal, fk_pasajero)
      )
      `
    ).catch(() => {}); // Ignorar si ya existe

    // Obtener todos los pasajeros asociados al cliente principal
    const { rows } = await pool.query(
      `
      SELECT 
        c.id,
        CONCAT(c.nombre_1, ' ', COALESCE(c.nombre_2, ''), ' ', c.apellido_1, ' ', COALESCE(c.apellido_2, '')) AS nombre_completo,
        c.c_i,
        c.telefonos,
        CASE WHEN u.id IS NOT NULL THEN true ELSE false END AS tiene_usuario
      FROM cliente_pasajeros cp
      JOIN cliente c ON c.id = cp.fk_pasajero
      LEFT JOIN usuario u ON u.fk_cliente = c.id
      WHERE cp.fk_cliente_principal = $1
      ORDER BY c.id DESC
      `,
      [clienteId]
    );

    return NextResponse.json({ pasajeros: rows });
  } catch (e: any) {
    console.error("Error obteniendo pasajeros:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo pasajeros" },
      { status: 500 }
    );
  }
}

