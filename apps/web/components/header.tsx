"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, Calendar, Users, Menu, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/images/viajesucab-logo.png"
              alt="ViajesUCAB - Tu Agencia de Confianza"
              width={180}
              height={80}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-[#E91E63]">
              Inicio
            </Link>
            <Link href="#promotions" className="text-sm font-medium transition-colors hover:text-[#E91E63]">
              Promociones
            </Link>
            <Link href="/paquetes" className="text-sm font-medium transition-colors hover:text-[#E91E63]">
              Paquetes
            </Link>
            <Link href="#destinations" className="text-sm font-medium transition-colors hover:text-[#E91E63]">
              Destinos
            </Link>
            <Link href="/perfil" className="text-sm font-medium transition-colors hover:text-[#E91E63]">
              Perfil Viajero
            </Link>
            <Button asChild className="bg-[#E91E63] hover:bg-[#E91E63]/90">
              <Link href="/cotizar">Cotizar / Reservar</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:flex items-center gap-2 bg-transparent"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-4 w-4" />
              Buscar
            </Button>

            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {searchOpen && (
          <div className="mt-4 hidden lg:block">
            <div className="flex gap-2 rounded-lg border bg-background p-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Destino</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="search" placeholder="¿A dónde quieres ir?" className="pl-10" />
                </div>
              </div>
              <div className="w-48">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Fechas</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="date" className="pl-10" />
                </div>
              </div>
              <div className="w-32">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Pasajeros</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="number" min="1" defaultValue="1" className="pl-10" />
                </div>
              </div>
              <div className="flex items-end">
                <Button className="bg-[#E91E63] hover:bg-[#E91E63]/90">Buscar</Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 lg:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Buscar destinos..." className="w-full pl-10 pr-4" />
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <nav className="fixed right-0 top-0 z-50 h-full w-64 bg-background shadow-lg animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b p-4">
              <span className="font-semibold">Menú</span>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-col gap-1 p-4">
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="#promotions"
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Promociones
              </Link>
              <Link
                href="/paquetes"
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Paquetes
              </Link>
              <Link
                href="#destinations"
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Destinos
              </Link>
              <Link
                href="/perfil"
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Perfil Viajero
              </Link>
              <Button asChild className="mt-4 bg-[#E91E63] hover:bg-[#E91E63]/90">
                <Link href="/cotizar" onClick={() => setMobileMenuOpen(false)}>
                  Cotizar / Reservar
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
