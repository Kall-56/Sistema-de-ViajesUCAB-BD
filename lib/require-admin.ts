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

/**
 * Valida que el usuario sea un cliente (rolId = 1)
 * Esto previene que proveedores o admins accedan a funcionalidades de cliente
 * como el carrito, itinerarios, etc.
 */
export function requireCliente() {
  const session = getSessionUser();
  if (!session)
    return { ok: false as const, status: 401, error: "No autenticado" };

  // Verificar que sea cliente (rolId = 1)
  if (session.rolId !== 1) {
    return { 
      ok: false as const, 
      status: 403, 
      error: "Solo los clientes pueden acceder a esta funcionalidad" 
    };
  }

  // Verificar que tenga clienteId (doble verificación)
  if (!session.clienteId || session.clienteId <= 0) {
    return { 
      ok: false as const, 
      status: 403, 
      error: "Cliente no identificado" 
    };
  }

  // Verificar que NO sea proveedor (seguridad adicional)
  if (session.proveedorId !== null) {
    return { 
      ok: false as const, 
      status: 403, 
      error: "Los proveedores no pueden acceder a funcionalidades de cliente" 
    };
  }

  return { ok: true as const, session };
}