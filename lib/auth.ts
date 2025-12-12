import { pool } from "./db";

export interface SessionUser {
  userId: number;
  rolId: number;
  clienteId: number | null;
  proveedorId: number | null;
  permisos: number[];
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<SessionUser> {
  const client = await pool.connect();
  try {
    console.log("🟡 validateCredentials → email:", email);

    const result = await client.query(`SELECT * FROM inicio_sesion($1, $2)`, [
      email,
      password,
    ]);
    const row = result.rows?.[0];

    console.log("🟢 inicio_sesion row:", row);

    if (!row?.user_id) throw new Error("Credenciales inválidas");

    return {
      userId: row.user_id,
      rolId: row.rol_id,
      clienteId: row.cliente_id ?? null,
      proveedorId: row.proveedor_id ?? null,
      permisos: row.permisos ?? [],
    };
  } catch (err: any) {
    console.error("🔴 validateCredentials error:", err?.message);
    throw new Error("Credenciales inválidas");
  } finally {
    client.release();
  }
}
