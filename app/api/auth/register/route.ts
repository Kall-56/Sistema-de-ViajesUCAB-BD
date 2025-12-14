import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// POST: Registrar nuevo cliente usando insertar_cliente
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      contraseña,
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
      email: string;
      contraseña: string;
      nombre_1: string;
      nombre_2?: string | null;
      apellido_1: string;
      apellido_2?: string | null;
      c_i: number;
      telefonos: bigint[];
      direccion: string;
      estado_civil: "soltero" | "casado" | "divorciado" | "viudo";
      fecha_nacimiento: string; // formato YYYY-MM-DD
    };

    // Validaciones básicas
    if (!email || !contraseña || !nombre_1 || !apellido_1 || !c_i || !direccion || !estado_civil || !fecha_nacimiento) {
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

    // Validar formato de email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
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

    // Validar edad (mayor de 18 años)
    const fechaNac = new Date(fecha_nacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    if (edad < 18) {
      return NextResponse.json(
        { error: "Debe ser mayor de 18 años para registrarse" },
        { status: 400 }
      );
    }

    // Convertir telefonos a bigint[]
    // Los telefonos vienen como strings o números desde el frontend
    const telefonosBigInt = telefonos.map((t) => {
      if (typeof t === "string") {
        return BigInt(t.replace(/\D/g, "")); // Remover caracteres no numéricos
      }
      return BigInt(t);
    });

    // Usar función almacenada insertar_cliente
    // Esta función crea el cliente Y el usuario automáticamente
    const { rows } = await pool.query(
      `SELECT insertar_cliente($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) AS usuario_id`,
      [
        email,
        contraseña,
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

    const usuarioId = rows[0]?.usuario_id;
    if (!usuarioId) {
      throw new Error("Error creando cliente");
    }

    return NextResponse.json(
      { ok: true, usuario_id: usuarioId, message: "Cliente registrado exitosamente" },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("Error en registro:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error registrando cliente" },
      { status: 500 }
    );
  }
}

