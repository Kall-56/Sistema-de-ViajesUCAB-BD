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

    if (!row?.user_id) {
      // Esto sería raro si la función siempre retorna o lanza excepción,
      // pero lo dejamos por seguridad:
      throw new Error("Credenciales inválidas");
    }

    return {
      userId: row.user_id,
      rolId: row.rol_id,
      clienteId: row.cliente_id ?? null,
      proveedorId: row.proveedor_id ?? null,
      permisos: row.permisos ?? [],
    };
  } catch (err: any) {
    // Importante: NO ocultar el mensaje real si viene de la función SQL
    // ej: "Usuario suspendido." o "El usuario no existe..."
    const msg = err?.message ?? "Credenciales inválidas";
    console.error("🔴 validateCredentials error:", msg);

    // Propagamos el mensaje tal cual para que login pueda diferenciar 401 vs 403
    throw new Error(msg);
  } finally {
    client.release();
  }
}
