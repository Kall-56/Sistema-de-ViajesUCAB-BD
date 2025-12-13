import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";

// GET: Obtener información completa del usuario (nombre, email, rol, etc.)
export async function GET() {
  const c = cookies().get("viajesucab_session");
  if (!c?.value) 
    return NextResponse.json({ user: null }, { status: 200 });

  let session: any;
  try {
    session = JSON.parse(c.value);
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const userId = Number(session?.userId);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    // Obtener información del usuario con datos relacionados
    const { rows } = await pool.query(
      `
      SELECT
        u.id,
        u.email,
        u.fk_rol,
        u.fk_cliente,
        u.fk_proveedor,
        r.nombre AS rol_nombre,
        CASE
          WHEN u.fk_cliente IS NOT NULL THEN
            CONCAT(c.nombre_1, ' ', COALESCE(c.nombre_2, ''), ' ', c.apellido_1, ' ', COALESCE(c.apellido_2, ''))
          WHEN u.fk_proveedor IS NOT NULL THEN
            p.nombre_proveedor
          ELSE
            'Usuario'
        END AS nombre_completo,
        CASE
          WHEN u.fk_cliente IS NOT NULL THEN 'cliente'
          WHEN u.fk_proveedor IS NOT NULL THEN 'proveedor'
          WHEN u.fk_rol = 3 THEN 'admin'
          ELSE 'usuario'
        END AS tipo_usuario
      FROM usuario u
      LEFT JOIN rol r ON r.id = u.fk_rol
      LEFT JOIN cliente c ON c.id = u.fk_cliente
      LEFT JOIN proveedor p ON p.id = u.fk_proveedor
      WHERE u.id = $1 AND u.activo = 1
      `,
      [userId]
    );

    if (!rows?.length) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const userInfo = rows[0];
    return NextResponse.json({
      user: {
        id: userInfo.id,
        email: userInfo.email,
        rolId: userInfo.fk_rol,
        rolNombre: userInfo.rol_nombre,
        nombre: userInfo.nombre_completo?.trim() || userInfo.email,
        tipoUsuario: userInfo.tipo_usuario,
        clienteId: userInfo.fk_cliente,
        proveedorId: userInfo.fk_proveedor,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error obteniendo información del usuario" },
      { status: 500 }
    );
  }
}

