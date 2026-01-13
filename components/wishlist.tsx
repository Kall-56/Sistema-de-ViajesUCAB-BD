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
  id: number
  fk_cliente: number
  fk_lugar: number | null
  fk_servicio: number | null
  lugar_nombre: string | null
  servicio_nombre: string | null
  servicio_descripcion: string | null
  servicio_costo: number | null
  servicio_costo_bs?: number | null
  servicio_denominacion: string | null
  servicio_denominacion_original?: string | null
  servicio_imagen: string | null
}

export function Wishlist() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [deseos, setDeseos] = useState<WishlistItem[]>([])

  useEffect(() => {
    loadWishlist()
  }, [])

  async function loadWishlist() {
    setLoading(true)
    try {
      const r = await fetch("/api/cliente/deseos", { cache: "no-store" })
      const data = await r.json()
      
      if (r.ok) {
        if (Array.isArray(data.deseos)) {
          setDeseos(data.deseos)
        } else {
          setDeseos([])
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
      setDeseos([])
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveItem(itemId: number) {
    if (removing === itemId) return

    setRemoving(itemId)
    try {
      const r = await fetch(`/api/cliente/deseos?id=${itemId}`, {
        method: "DELETE",
      })

      const data = await r.json()

      if (r.ok) {
        setDeseos(prev => prev.filter(d => d.id !== itemId))
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
      setRemoving(null)
    }
  }

  async function handleAddToCart(item: WishlistItem) {
    if (!item.fk_servicio || addingToCart === item.id) return

    setAddingToCart(item.id)
    try {
      const ventaRes = await fetch("/api/cliente/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      if (!ventaRes.ok) {
        const errorData = await ventaRes.json()
        throw new Error(errorData.error || "Error creando venta")
      }

      const ventaData = await ventaRes.json()
      const idVenta = ventaData.id_venta

      if (!idVenta) {
        throw new Error("No se recibió el ID de venta")
      }

      const fechaInicio = new Date()
      fechaInicio.setDate(fechaInicio.getDate() + 30)

      const agregarRes = await fetch("/api/cliente/itinerarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_venta: idVenta,
          id_servicio: item.fk_servicio,
          fecha_inicio: fechaInicio.toISOString().split('T')[0],
          aplicar_descuento: false,
        }),
      })

      if (!agregarRes.ok) {
        const errorData = await agregarRes.json()
        throw new Error(errorData.error || "Error agregando al carrito")
      }

      toast.success("Servicio agregado al carrito", {
        description: "Puedes continuar agregando más servicios o ir al checkout",
      })

      router.push("/carrito")
    } catch (err: any) {
      console.error("Error agregando al carrito:", err)
      toast.error("Error", {
        description: err.message ?? "No se pudo agregar el servicio al carrito",
      })
    } finally {
      setAddingToCart(null)
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

  if (deseos.length === 0) {
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
          {deseos.length} {deseos.length === 1 ? "item guardado" : "items guardados"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {deseos.map((deseo) => (
          <Card key={deseo.id} className="group overflow-hidden">
            <div className="relative">
              <img 
                src={deseo.servicio_imagen || "/placeholder.svg"} 
                alt={deseo.servicio_nombre || deseo.lugar_nombre || "Item"} 
                className="h-48 w-full object-cover" 
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-2 top-2 h-9 w-9 bg-white/90 hover:bg-white"
                onClick={() => handleRemoveItem(deseo.id)}
                disabled={removing === deseo.id}
              >
                {removing === deseo.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5 text-red-600" />
                )}
              </Button>
              <Badge className="absolute bottom-2 left-2 bg-background/90 text-foreground">
                {deseo.fk_servicio ? "Servicio" : "Lugar"}
              </Badge>
            </div>

            <div className="p-5">
              <h3 className="mb-2 text-lg font-bold leading-tight">
                {deseo.servicio_nombre || deseo.lugar_nombre || "Item sin nombre"}
              </h3>
              
              {deseo.lugar_nombre && (
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{deseo.lugar_nombre}</span>
                </div>
              )}

              {deseo.servicio_descripcion && (
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                  {deseo.servicio_descripcion}
                </p>
              )}

              {deseo.servicio_costo !== null && (
                <div className="mb-4">
                  <div className="text-2xl font-bold text-primary">
                    {deseo.servicio_denominacion === "VEN" 
                      ? `Bs. ${deseo.servicio_costo_bs?.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || deseo.servicio_costo.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      : deseo.servicio_denominacion === "USD"
                      ? `$${deseo.servicio_costo.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      : deseo.servicio_denominacion === "EUR"
                      ? `€${deseo.servicio_costo.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      : formatCurrency(deseo.servicio_costo, deseo.servicio_denominacion)
                    }
                  </div>
                  {deseo.servicio_denominacion && deseo.servicio_denominacion !== "VEN" && deseo.servicio_costo_bs && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bs. {deseo.servicio_costo_bs.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {deseo.fk_servicio && (
                  <>
                    <Button 
                      className="w-full bg-[#E91E63] hover:bg-[#E91E63]/90"
                      onClick={() => handleAddToCart(deseo)}
                      disabled={addingToCart === deseo.id}
                    >
                      {addingToCart === deseo.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Agregando...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Agregar al Carrito
                        </>
                      )}
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/servicio/${deseo.fk_servicio}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                  </>
                )}
                {deseo.fk_lugar && (
                  <Button asChild className="w-full bg-[#E91E63] hover:bg-[#E91E63]/90">
                    <Link href={`/buscar?lugar=${deseo.fk_lugar}`}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Explorar Servicios
                    </Link>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent"
                  onClick={() => handleRemoveItem(deseo.id)}
                  disabled={removing === deseo.id}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar de Lista
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
