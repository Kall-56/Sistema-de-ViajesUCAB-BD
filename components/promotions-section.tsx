"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Percent, ArrowRight, Flame, Loader2, ShoppingCart } from "lucide-react"
import { WishlistButton } from "@/components/wishlist-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

type PromocionAPI = {
  descuento_id: number;
  porcentaje_descuento: number;
  servicio_id: number;
  servicio_nombre: string;
  descripcion: string;
  costo_servicio: number;
  costo_servicio_bs?: number;
  denominacion: string;
  precio_con_descuento: number;
  precio_con_descuento_bs?: number;
  ahorro: number;
  ahorro_bs?: number;
  imagen_principal: string | null;
};

type PromocionDisplay = {
  id: string;
  title: string;
  description: string;
  discount: string;
  originalPrice: number;
  originalPrice_bs?: number;
  price: number;
  price_bs?: number;
  denominacion?: string;
  savings: number;
  savings_bs?: number;
  image: string | null;
  isHotDeal: boolean;
  servicioId?: number;
  descuentoId?: number;
};

export function PromotionsSection() {
  const router = useRouter()
  const [promotions, setPromotions] = useState<PromocionDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [showDateDialog, setShowDateDialog] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState<PromocionDisplay | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    async function fetchPromociones() {
      setLoading(true)
      try {
        const r = await fetch("/api/promociones", { cache: "no-store" })
        if (!r.ok) throw new Error("Error cargando promociones")
        const data = await r.json()
        
        const promos: PromocionAPI[] = Array.isArray(data?.promociones) ? data.promociones : []
        
        // Mapear y tomar solo las 3 primeras (ordenadas por descuento)
        const mapped = promos
          .sort((a, b) => b.porcentaje_descuento - a.porcentaje_descuento)
          .slice(0, 3)
          .map((p): PromocionDisplay => ({
            id: `promo-${p.descuento_id}`,
            title: p.servicio_nombre,
            description: p.descripcion || "Sin descripción",
            discount: `${p.porcentaje_descuento}% OFF`,
            originalPrice: p.costo_servicio,
            originalPrice_bs: p.costo_servicio_bs || (p.precio_con_descuento_bs ? p.costo_servicio * (p.precio_con_descuento_bs / p.precio_con_descuento) : undefined),
            price: p.precio_con_descuento,
            price_bs: p.precio_con_descuento_bs || p.precio_con_descuento,
            denominacion: p.denominacion || "USD",
            savings: p.ahorro,
            savings_bs: p.ahorro_bs || p.ahorro,
            image: p.imagen_principal,
            isHotDeal: p.porcentaje_descuento >= 30,
            servicioId: p.servicio_id,
            descuentoId: p.descuento_id
          }))
        
        setPromotions(mapped)
      } catch (err) {
        console.error("Error cargando promociones:", err)
        setPromotions([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchPromociones()
  }, [])

  async function handleAgregarAlCarrito(promo: PromocionDisplay) {
    try {
      const authCheck = await fetch("/api/auth/me", { cache: "no-store" })
      const authData = await authCheck.json()
      
      if (!authData.user || !authData.user.userId) {
        toast.error("Debes iniciar sesión para agregar promociones al carrito")
        router.push(`/login?next=/`)
        return
      }

      if (authData.user.rolId !== 1) {
        toast.error("Solo los clientes pueden agregar promociones al carrito")
        return
      }

      setSelectedPromo(promo)
      setSelectedDate("")
      setShowDateDialog(true)
    } catch (error) {
      console.error("Error verificando autenticación:", error)
      toast.error("Error al verificar autenticación")
    }
  }

  async function handleConfirmarAgregar() {
    if (!selectedPromo || !selectedDate) {
      toast.error("Debes seleccionar una fecha")
      return
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaSeleccionada = new Date(selectedDate)
    fechaSeleccionada.setHours(0, 0, 0, 0)

    if (fechaSeleccionada < hoy) {
      toast.error("La fecha no puede ser anterior a hoy")
      return
    }

    setAddingToCart(true)
    try {
      // Verificar que tenemos el servicio_id
      if (!selectedPromo.servicioId) {
        throw new Error("No se pudo obtener la información del servicio")
      }

      // Crear o obtener una venta pendiente
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

      // Agregar servicio al itinerario con descuento aplicado
      const agregarRes = await fetch("/api/cliente/itinerarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_venta: idVenta,
          id_servicio: selectedPromo.servicioId,
          fecha_inicio: selectedDate,
          aplicar_descuento: true, // Aplicar el descuento activo
        }),
      })

      if (!agregarRes.ok) {
        const errorData = await agregarRes.json()
        console.error("Error del servidor:", errorData)
        throw new Error(errorData.error || "Error agregando al carrito")
      }

      toast.success("¡Promoción agregada al carrito!", {
        description: "La promoción ha sido agregada a tu carrito de compras",
      })

      window.dispatchEvent(new Event("cart-updated"))
      setShowDateDialog(false)
      setSelectedPromo(null)
      setSelectedDate("")
    } catch (error: any) {
      console.error("Error agregando promoción al carrito:", error)
      toast.error(error.message || "Error al agregar la promoción al carrito")
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <section id="promotions" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Percent className="h-6 w-6 text-[#E91E63]" />
              <span className="text-sm font-semibold uppercase tracking-wider text-[#E91E63]">Ofertas Especiales</span>
            </div>
            <h2 className="text-balance text-3xl font-bold md:text-4xl">Promociones Destacadas</h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Aprovecha nuestros descuentos exclusivos por tiempo limitado
            </p>
          </div>
          <Button asChild variant="outline" className="hidden md:inline-flex bg-transparent">
            <Link href="/promociones">
              Ver Todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#E91E63]" />
            <p className="text-muted-foreground">Cargando promociones...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No hay promociones disponibles en este momento</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo, index) => (
            <Card key={index} className="group overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative overflow-hidden">
                <img
                  src={promo.image || "/placeholder.svg"}
                  alt={promo.title}
                  className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <Badge className="absolute right-4 top-4 bg-[#E91E63] text-white border-0 text-base px-3 py-1">
                  {promo.discount}
                </Badge>
                {promo.isHotDeal && (
                  <Badge className="absolute left-4 top-4 bg-orange-500 text-white border-0 gap-1">
                    <Flame className="h-3 w-3" />
                    Hot Deal
                  </Badge>
                )}
                {promo.servicioId && (
                  <div className="absolute left-4 bottom-4">
                    <WishlistButton 
                      itemId={promo.servicioId} 
                      itemName={promo.title} 
                      itemType="servicio"
                      variant="icon" 
                    />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold">{promo.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{promo.description}</p>
                <div className="mb-4 border-t pt-4">
                  <div className="mb-2 flex items-center gap-2">
                    {promo.denominacion === "VEN" ? (
                      <>
                        {promo.originalPrice_bs && (
                          <span className="text-base text-muted-foreground line-through">
                            Bs. {promo.originalPrice_bs.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                        )}
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                        >
                          Ahorras Bs. {promo.savings_bs?.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || promo.savings.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </Badge>
                      </>
                    ) : (
                      <>
                        <span className="text-base text-muted-foreground line-through">
                          {promo.denominacion === "USD" ? "$" : promo.denominacion === "EUR" ? "€" : ""}
                          {promo.originalPrice.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                        >
                          Ahorras {promo.denominacion === "USD" ? "$" : promo.denominacion === "EUR" ? "€" : ""}
                          {promo.savings.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </Badge>
                      </>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#E91E63]">
                      {promo.denominacion === "VEN" 
                        ? `Bs. ${promo.price_bs?.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || promo.price.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                        : promo.denominacion === "USD"
                        ? `$${promo.price.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                        : promo.denominacion === "EUR"
                        ? `€${promo.price.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                        : `${promo.price.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${promo.denominacion || "USD"}`
                      }
                    </span>
                    {promo.denominacion && promo.denominacion !== "VEN" && (
                      <span className="text-sm text-muted-foreground">{promo.denominacion}</span>
                    )}
                  </div>
                  {promo.denominacion && promo.denominacion !== "VEN" && promo.price_bs && (
                    <p className="text-xs text-muted-foreground">
                      Bs. {promo.price_bs.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  )}
                </div>
                <Button 
                  className="w-full bg-[#E91E63] hover:bg-[#E91E63]/90"
                  onClick={() => handleAgregarAlCarrito(promo)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Agregar al Carrito
                </Button>
              </div>
            </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/promociones">
              Ver Todas las Promociones
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Dialog para seleccionar fecha */}
      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Fecha</DialogTitle>
            <DialogDescription>
              Selecciona la fecha de inicio para {selectedPromo?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha de inicio</Label>
              <Input
                id="fecha"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarAgregar} disabled={addingToCart || !selectedDate}>
              {addingToCart ? (
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
