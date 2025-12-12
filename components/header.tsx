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

  const [searchOpen, setSearchOpen] = useState(false); // (no lo usas, pero lo dejo)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemsCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/me", { method: "GET" });
        const data = await res.json();
        setSessionUser(data.user ?? null);
      } catch {
        setSessionUser(null);
      }
    };
    loadSession();
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
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
              className="hidden md:flex flex-1 max-w-md mx-4"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="¿A dónde quieres ir?"
                  className="w-full pl-10 pr-4 bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            <nav className="hidden md:flex items-center gap-2 lg:gap-4">
              <Link
                href="/paquetes"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[#E91E63] whitespace-nowrap"
              >
                <Package className="h-4 w-4" />
                <span className="hidden lg:inline">Paquetes</span>
              </Link>

              <Link
                href="/promociones"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[#E91E63] whitespace-nowrap"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden lg:inline">Promociones</span>
              </Link>

              <Link
                href="/#destinations"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[#E91E63] whitespace-nowrap"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden lg:inline">Destinos</span>
              </Link>

              {/* Perfil: solo si hay sesión; si no, lleva a login */}
              <Link
                href={sessionUser ? "/perfil" : "/login"}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[#E91E63] whitespace-nowrap"
              >
                <UserCircle className="h-4 w-4" />
                <span className="hidden lg:inline">Perfil 360°</span>
              </Link>

              {/* Botón Admin/Proveedor si aplica */}
              {dashboardLink && dashboardLabel && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent whitespace-nowrap"
                >
                  <Link href={dashboardLink}>{dashboardLabel}</Link>
                </Button>
              )}

              {/* Iniciar sesión vs Cerrar sesión */}
              {sessionUser ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent whitespace-nowrap"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent whitespace-nowrap"
                >
                  <Link href="/login">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">Iniciar Sesión</span>
                  </Link>
                </Button>
              )}

              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent relative whitespace-nowrap"
              >
                <Link href="/carrito">
                  <ShoppingCart className="h-4 w-4" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-[#E91E63] text-white text-xs">
                      {cartItemsCount}
                    </Badge>
                  )}
                  <span className="hidden lg:inline">Carrito</span>
                </Link>
              </Button>

              <LanguageCurrencySelector />
            </nav>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          <form onSubmit={handleSearch} className="mt-3 md:hidden">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="¿A dónde quieres ir?"
                className="w-full pl-10 pr-4"
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
                className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Plane className="h-5 w-5 text-[#E91E63]" />
                Inicio
              </Link>

              <Link
                href="/paquetes"
                className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package className="h-5 w-5 text-[#E91E63]" />
                Paquetes
              </Link>

              <Link
                href="/promociones"
                className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TrendingUp className="h-5 w-5 text-[#E91E63]" />
                Promociones
              </Link>

              <Link
                href="/#destinations"
                className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapPin className="h-5 w-5 text-[#E91E63]" />
                Destinos Populares
              </Link>

              <Link
                href={sessionUser ? "/perfil" : "/login"}
                className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserCircle className="h-5 w-5 text-[#E91E63]" />
                Perfil Viajero 360°
              </Link>

              <Link
                href="/reclamos"
                className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageSquare className="h-5 w-5 text-[#E91E63]" />
                Reclamos
              </Link>

              <Link
                href="/carrito"
                className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent relative"
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

              <Link
                href="/itinerario"
                className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Route className="h-5 w-5 text-[#E91E63]" />
                Mi Itinerario
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
                <Button
                  className="bg-[#E91E63] hover:bg-[#E91E63]/90 justify-start gap-3"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await handleLogout();
                  }}
                >
                  <User className="h-5 w-5" />
                  Cerrar Sesión
                </Button>
              ) : (
                <Button
                  asChild
                  className="bg-[#E91E63] hover:bg-[#E91E63]/90 justify-start gap-3"
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
