// lib/auth.ts
import { pool } from "./db"; // ajusta la ruta si tu pool está en otro sitio
import { cookies } from "next/headers";

export interface SessionUser {
  id: number;
  email: string;
  rol: number;                 // fk_rol es entero
  cliente?: number | null;
  proveedor?: number | null;
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT
        id,
        email,
        fk_rol       AS rol,
        fk_cliente   AS cliente,
        fk_proveedor AS proveedor
      FROM public.usuario
      WHERE email = $1
        AND contraseña = $2
      `,
      [email, password]
    );

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      id: row.id,
      email: row.email,
      rol: row.rol,
      cliente: row.cliente,
      proveedor: row.proveedor,
    };
  } finally {
    client.release();
  }
}

export function getSessionUserFromCookies(): SessionUser | null {
  const cookieStore = cookies();
  const session = cookieStore.get("viajesucab_session")?.value;
  if (!session) return null;

  try {
    return JSON.parse(session) as SessionUser;
  } catch {
    return null;
  }
}
