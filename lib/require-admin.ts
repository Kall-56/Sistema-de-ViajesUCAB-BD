import { cookies } from "next/headers";

type SessionUser = {
  userId: number;
  rolId: number;
  clienteId: number | null;
  proveedorId: number | null;
  permisos: number[];
};

export function getSessionUser(): SessionUser | null {
  const raw = cookies().get("viajesucab_session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

// Permisos: 1 LECTURA, 2 ESCRITURA, 3 ACTUALIZACION, 4 ELIMINACION
export function requirePermission(requiredPerm: number) {
  const session = getSessionUser();
  if (!session)
    return { ok: false as const, status: 401, error: "No autenticado" };

  // Admin full access por rol o por permisos
  if (session.rolId === 3) return { ok: true as const, session };
  if (session.permisos?.includes(requiredPerm))
    return { ok: true as const, session };

  return { ok: false as const, status: 403, error: "Sin permisos" };
}
