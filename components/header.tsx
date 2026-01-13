"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Menu,
  X,
  User,
  Plane,
  Package,
  TrendingUp,
  MapPin,
  UserCircle,
  ShoppingCart,
  Route,
  MessageSquare,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageCurrencySelector } from "@/components/language-currency-selector";

type SessionUser = {
  userId: number;
  rolId: number;
  clienteId: number | null;
  proveedorId: number | null;
  permisos: number[];
};

export function Header() {
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [userInfo, setUserInfo] = useState<{ nombre: string; rolNombre: string } | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/me", { method: "GET" });
        const data = await res.json();
        setSessionUser(data.user ?? null);
        
        // Si hay sesión, cargar información completa del usuario
        if (data.user) {
          try {
            const userRes = await fetch("/api/auth/user-info", { cache: "no-store" });
            const userData = await userRes.json();
            if (userRes.ok && userData?.user) {
              setUserInfo({
                nombre: userData.user.nombre,
                rolNombre: userData.user.rolNombre || "Usuario",
              });
            }
          } catch {
            // Silencioso
          }
        }
      } catch {
        setSessionUser(null);
      }
    };

    const loadCartCount = async () => {
      try {
        const res = await fetch("/api/cliente/carrito/count", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCartItemsCount(data?.count || 0);
        }
      } catch {
        // Silencioso
      }
    };

    loadSession();
    // Solo cargar conteo si hay sesión de cliente
    loadCartCount();

    // Escuchar eventos de actualización del carrito
    const handleCartUpdate = () => {
      loadCartCount();
    };
    window.addEventListener("cart-updated", handleCartUpdate);

    // Refrescar cada 30 segundos
    const interval = setInterval(loadCartCount, 30000);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSessionUser(null);
    router.push("/");
    router.refresh();
  };

  const dashboardLink =
    sessionUser?.rolId === 3
      ? "/admin/dashboard"
      : sessionUser?.rolId === 2
      ? "/proveedor/dashboard"
      : null;
  const dashboardLabel =
    sessionUser?.rolId === 3
      ? "Admin"
      : sessionUser?.rolId === 2
      ? "Proveedor"
      : null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur-md supports-backdrop-filter:bg-white/80 dark:supports-backdrop-filter:bg-slate-950/80 shadow-sm">
        <div className="container mx-auto px-4 py-3 max-w-full">
          <div className="flex items-center justify-between gap-2 md:gap-3 lg:gap-4 min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
              <Image
                src="/images/viajesucab-logo.png"
                alt="ViajesUCAB - Tu Agencia de Confianza"
                width={180}
                height={80}
                className="h-10 w-auto md:h-12"
                priority
              />
            </Link>

            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-2 lg:mx-3 min-w-0 shrink"
            >
              <div className="relative w-full min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="¿A dónde quieres ir?"
                  className="w-full pl-10 pr-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">
              <Link
                href="/paquetes"
                className="flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#E91E63] whitespace-nowrap shrink-0"
              >
                <Package className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Paquetes</span>
              </Link>

              <Link
                href="/promociones"
                className="flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#E91E63] whitespace-nowrap shrink-0"
              >
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Promociones</span>
              </Link>

              <Link
                href="/itinerario"
                className="flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#E91E63] whitespace-nowrap shrink-0"
              >
                <Route className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Mi Itinerario</span>
              </Link>

              {sessionUser && (
                <Link
                  href="/perfil?tab=wishlist"
                  className="flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#E91E63] whitespace-nowrap shrink-0"
                >
                  <Heart className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Lista de Deseos</span>
                </Link>
              )}

              {/* Perfil: solo si hay sesión; si no, lleva a login */}
              <Link
                href={sessionUser ? "/perfil" : "/login"}
                className="flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#E91E63] whitespace-nowrap shrink-0"
              >
                <UserCircle className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Perfil 360°</span>
              </Link>

              {/* Separador visual */}
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 shrink-0" />

              {/* Botón Admin/Proveedor si aplica */}
              {dashboardLink && dashboardLabel && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 px-2 lg:px-3"
                >
                  <Link href={dashboardLink}>{dashboardLabel}</Link>
                </Button>
              )}

              {/* Iniciar sesión vs Cerrar sesión */}
              {sessionUser ? (
                <div className="flex items-center gap-1 lg:gap-1.5 shrink-0">
                  {userInfo && (
                    <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-[#E91E63]/10 to-[#C2185B]/10 border border-[#E91E63]/20 w-[160px] min-w-[160px] max-w-[160px] shrink-0">
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate flex-1 min-w-0">
                        {userInfo.nombre}
                      </span>
                      <Badge className="bg-[#E91E63] text-white text-xs border-0 shrink-0">
                        {userInfo.rolNombre}
                      </Badge>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 px-2 lg:px-3"
                    onClick={handleLogout}
                  >
                    <User className="h-4 w-4 shrink-0" />
                    <span className="hidden xl:inline">Cerrar Sesión</span>
                  </Button>
                </div>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="gap-1.5 bg-[#E91E63] hover:bg-[#C2185B] text-white whitespace-nowrap shrink-0 px-2 lg:px-3"
                >
                  <Link href="/login">
                    <User className="h-4 w-4 shrink-0" />
                    <span className="hidden lg:inline">Iniciar Sesión</span>
                  </Link>
                </Button>
              )}

              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 relative whitespace-nowrap shrink-0 px-2 lg:px-3"
              >
                <Link href="/carrito">
                  <ShoppingCart className="h-4 w-4 shrink-0" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-[#E91E63] text-white text-xs border-2 border-white dark:border-slate-950">
                      {cartItemsCount}
                    </Badge>
                  )}
                  <span className="hidden lg:inline">Carrito</span>
                </Link>
              </Button>

              <div className="shrink-0">
                <LanguageCurrencySelector />
              </div>
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Link href="/carrito">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-[#E91E63] text-white text-xs border-2 border-white">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mt-3 md:hidden px-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="¿A dónde quieres ir?"
                className="w-full pl-10 pr-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="fixed right-0 top-0 z-70 h-full w-72 bg-background shadow-2xl md:hidden transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="flex items-center justify-between border-b p-4">
              <span className="font-semibold text-lg">Menú</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col gap-1 p-4">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Plane className="h-5 w-5 text-[#E91E63]" />
                Inicio
              </Link>

              <Link
                href="/paquetes"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package className="h-5 w-5 text-[#E91E63]" />
                Paquetes
              </Link>

              <Link
                href="/promociones"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TrendingUp className="h-5 w-5 text-[#E91E63]" />
                Promociones
              </Link>

              <Link
                href="/itinerario"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Route className="h-5 w-5 text-[#E91E63]" />
                Mi Itinerario
              </Link>

              <Link
                href={sessionUser ? "/perfil" : "/login"}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserCircle className="h-5 w-5 text-[#E91E63]" />
                Perfil Viajero 360°
              </Link>

              <Link
                href="/reclamos"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageSquare className="h-5 w-5 text-[#E91E63]" />
                Reclamos
              </Link>

              <Link
                href="/carrito"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 relative"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5 text-[#E91E63]" />
                Carrito
                {cartItemsCount > 0 && (
                  <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 bg-[#E91E63] text-white text-xs">
                    {cartItemsCount}
                  </Badge>
                )}
              </Link>

              {/* Botón Admin/Proveedor en móvil */}
              {dashboardLink && dashboardLabel && (
                <Button
                  asChild
                  variant="outline"
                  className="justify-start gap-3 bg-transparent"
                >
                  <Link
                    href={dashboardLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {dashboardLabel}
                  </Link>
                </Button>
              )}

              <div className="my-4 border-t" />

              {sessionUser ? (
                <div className="space-y-2">
                  {userInfo && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#E91E63]/10 to-[#C2185B]/10 border border-[#E91E63]/20">
                      <span className="text-sm font-medium flex-1">
                        {userInfo.nombre}
                      </span>
                      <Badge className="bg-[#E91E63] text-white text-xs border-0">
                        {userInfo.rolNombre}
                      </Badge>
                    </div>
                  )}
                  <Button
                    className="w-full bg-[#E91E63] hover:bg-[#C2185B] justify-start gap-3"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await handleLogout();
                    }}
                  >
                    <User className="h-5 w-5" />
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <Button
                  asChild
                  className="w-full bg-[#E91E63] hover:bg-[#C2185B] justify-start gap-3"
                >
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-5 w-5" />
                    Iniciar Sesión / Registro
                  </Link>
                </Button>
              )}

              <div className="mt-4">
                <LanguageCurrencySelector />
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
