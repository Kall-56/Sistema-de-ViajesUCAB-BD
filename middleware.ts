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

// Rutas que serán PÚBLICAS (no requieren sesión)
const PUBLIC_PREFIXES = [
  "/", // Home
  "/login",
  "/paquetes",
  "/promociones",
  "/buscar",
  "/reclamos",
  "/contacto",
  "/about",
  "/itinerario", // lo dejo público por tu comentario (puedes cambiarlo después)
];

// Endpoints de auth siempre públicos
const PUBLIC_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/me",
  "/api/auth/logout",
];

// Rutas que SÍ requieren sesión
const PROTECTED_PREFIXES = [
  "/perfil",
  "/carrito",
  "/checkout",
  "/pago",
  "/orden",
  "/reservar",
  "/mis-reservas",
  "/admin",
  "/proveedor",
  "/api/admin",
];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isStaticAsset(pathname: string) {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/images")) return true; // public/images/*
  if (pathname === "/favicon.ico") return true;
  // extensiones típicas (por si usan /public/... o archivos sueltos)
  return (
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".map")
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Nunca interceptar assets estáticos
  if (isStaticAsset(pathname)) return NextResponse.next();

  // 2) Auth endpoints siempre públicos
  if (startsWithAny(pathname, PUBLIC_API_PREFIXES)) return NextResponse.next();

  // 3) Rutas públicas (catálogo / navegación)
  //    Importante: "/" entra aquí pero no afecta nada
  if (startsWithAny(pathname, PUBLIC_PREFIXES)) return NextResponse.next();

  // 4) Si no está en públicas, solo pedimos sesión para las protegidas
  const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES);

  const session = readSession(req);

  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 5) RBAC: admin / proveedor (si hay sesión)
  if (session) {
    // Admin-only
    if (pathname.startsWith("/admin")) {
      if (session.rolId !== 3) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    // Proveedor (rol 2) o admin (rol 3)
    if (pathname.startsWith("/proveedor")) {
      if (session.rolId !== 2 && session.rolId !== 3) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    // APIs admin también deben ser admin
    if (pathname.startsWith("/api/admin")) {
      if (session.rolId !== 3) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
