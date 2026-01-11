"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  MapPin,
  ShoppingCart,
  ArrowRight,
  Loader2,
  Trash2,
} from "lucide-react"
import Link from "next/link"

interface WishlistItem {
  fk_cliente: number
  fk_lugar: number | null
  fk_servicio: number | null
  lugar_nombre: string | null
  servicio_nombre: string | null
  servicio_descripcion: string | null
  servicio_costo: number | null
  servicio_denominacion: string | null
  servicio_imagen: string | null
}

export function Wishlist() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(false)
  const [deseos, setDeseos] = useState<WishlistItem | null>(null)

  useEffect(() => {
    loadWishlist()
  }, [])

  async function loadWishlist() {
    setLoading(true)
    try {
      const r = await fetch("/api/cliente/deseos", { cache: "no-store" })
      const data = await r.json()
      
      if (r.ok) {
        if (data.deseos) {
          setDeseos(data.deseos)
        } else {
          setDeseos(null)
        }
      } else {
        if (r.status === 401 || r.status === 403) {
          router.push("/login?next=/lista-deseos")
          return
        }
        throw new Error(data?.error ?? "Error cargando lista de deseos")
      }
    } catch (err: any) {
      console.error("Error cargando lista de deseos:", err)
      toast.error("Error", {
        description: err.message ?? "No se pudo cargar la lista de deseos",
      })
      setDeseos(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveItem() {
    if (removing) return

    setRemoving(true)
    try {
      const r = await fetch("/api/cliente/deseos", {
        method: "DELETE",
      })

      const data = await r.json()

      if (r.ok) {
        setDeseos(null)
        toast.success("Item eliminado de la lista de deseos")
      } else {
        throw new Error(data?.error ?? "Error eliminando de lista de deseos")
      }
    } catch (err: any) {
      console.error("Error eliminando de lista de deseos:", err)
      toast.error("Error", {
        description: err.message ?? "No se pudo eliminar de la lista de deseos",
      })
    } finally {
      setRemoving(false)
    }
  }

  const formatCurrency = (amount: number | null, denominacion: string | null) => {
    if (amount === null) return "N/A"
    if (denominacion === "VEN") {
      return `Bs. ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${amount.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${denominacion}`
  }

  if (loading) {
    return (
      <div className="py-16">
        <Card className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#E91E63]" />
          <p className="text-muted-foreground">Cargando lista de deseos...</p>
        </Card>
      </div>
    )
  }

  if (!deseos) {
    return (
      <div className="py-16">
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Tu lista de deseos está vacía</h3>
          <p className="mb-6 text-muted-foreground">
            Guarda tus paquetes y servicios favoritos para consultarlos más tarde
          </p>
          <Button asChild className="bg-[#E91E63] hover:bg-[#E91E63]/90">
            <Link href="/buscar">
              Explorar Ofertas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Mi Lista de Deseos</h2>
        <p className="mt-2 text-muted-foreground">
          {deseos ? "1 item guardado" : "0 items guardados"}
        </p>
      </div>

      {deseos && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group overflow-hidden">
            <div className="relative">
              <img 
                src={deseos.servicio_imagen || "/placeholder.svg"} 
                alt={deseos.servicio_nombre || deseos.lugar_nombre || "Item"} 
                className="h-48 w-full object-cover" 
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-2 top-2 h-9 w-9 bg-white/90 hover:bg-white"
                onClick={handleRemoveItem}
                disabled={removing}
              >
                {removing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5 text-red-600" />
                )}
              </Button>
              <Badge className="absolute bottom-2 left-2 bg-background/90 text-foreground">
                {deseos.fk_servicio ? "Servicio" : "Lugar"}
              </Badge>
            </div>

            <div className="p-5">
              <h3 className="mb-2 text-lg font-bold leading-tight">
                {deseos.servicio_nombre || deseos.lugar_nombre || "Item sin nombre"}
              </h3>
              
              {deseos.lugar_nombre && (
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{deseos.lugar_nombre}</span>
                </div>
              )}

              {deseos.servicio_descripcion && (
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                  {deseos.servicio_descripcion}
                </p>
              )}

              {deseos.servicio_costo !== null && (
                <div className="mb-4">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(deseos.servicio_costo, deseos.servicio_denominacion)}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {deseos.fk_servicio && (
                  <Button asChild className="w-full bg-[#E91E63] hover:bg-[#E91E63]/90">
                    <Link href={`/servicios/${deseos.fk_servicio}`}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </Link>
                  </Button>
                )}
                {deseos.fk_lugar && (
                  <Button asChild className="w-full bg-[#E91E63] hover:bg-[#E91E63]/90">
                    <Link href={`/buscar?lugar=${deseos.fk_lugar}`}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Explorar Servicios
                    </Link>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent"
                  onClick={handleRemoveItem}
                  disabled={removing}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar de Lista
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
