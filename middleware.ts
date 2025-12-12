import { NextRequest, NextResponse } from "next/server";

type SessionUser = {
  userId: number;
  rolId: number;
  clienteId: number | null;
  proveedorId: number | null;
  permisos: number[];
};

function readSession(req: NextRequest): SessionUser | null {
  const cookie = req.cookies.get("viajesucab_session")?.value;
  if (!cookie) return null;
  try {
    return JSON.parse(cookie) as SessionUser;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = readSession(req);

  // Permite siempre estas rutas públicas
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/me") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public");

  if (isPublic) return NextResponse.next();

  // A partir de aquí, si no hay sesión: redirect a /login
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // opcional: url.searchParams.set("next", pathname)
    return NextResponse.redirect(url);
  }

  // --- Reglas por rol (RBAC) ---
  // rolId: 1 cliente, 2 proveedor, 3 admin

  // Admin-only
  if (pathname.startsWith("/admin")) {
    if (session.rolId !== 3) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Proveedor dashboard y rutas proveedor:
  if (pathname.startsWith("/proveedor")) {
    if (session.rolId !== 2 && session.rolId !== 3) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Perfil solo para logueados (cliente/proveedor/admin)
  if (pathname.startsWith("/perfil")) {
    // ya hay sesión, así que pasa
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Define qué rutas pasan por el middleware
export const config = {
  matcher: [
    /*
      Aplica a todo excepto archivos estáticos y auth endpoints;
      igual filtramos arriba con isPublic, así queda robusto.
    */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
