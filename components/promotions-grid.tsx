"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Flame, ArrowRight, Filter, X, Calendar, Loader2, ShoppingCart } from "lucide-react"
import { WishlistButton } from "@/components/wishlist-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

type PromocionAPI = {
  descuento_id: number;
  porcentaje_descuento: number;
  fecha_vencimiento: string | null;
  servicio_id: number;
  servicio_nombre: string;
  descripcion: string;
  costo_servicio: number;
  denominacion: string;
  millas_otorgadas: number;
  tipo_servicio: string;
  lugar_nombre: string | null;
  nombre_proveedor: string | null;
  precio_con_descuento: number;
  ahorro: number;
  dias_restantes: number | null;
  imagen_principal: string | null;
};

type PromocionDisplay = {
  id: string;
  name: string;
  destination: string;
  description: string;
  discount: string;
  discountPercent: number;
  originalPrice: number;
  price: number;
  miles: number;
  validUntil: string | null;
  daysLeft: number | null;
  savings: number;
  image: string | null;
  type: string;
  isHotDeal: boolean;
  servicioId?: number; // ID del servicio para agregar al carrito
  descuentoId?: number; // ID del descuento
};

export function PromotionsGrid() {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("discount")
  const [loading, setLoading] = useState(true)
  const [promociones, setPromociones] = useState<PromocionDisplay[]>([])
  const [showDateDialog, setShowDateDialog] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState<PromocionDisplay | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [addingToCart, setAddingToCart] = useState(false)

  // Cargar promociones desde API
  useEffect(() => {
    async function fetchPromociones() {
      setLoading(true)
      try {
        const r = await fetch("/api/promociones", { cache: "no-store" })
        if (!r.ok) throw new Error("Error cargando promociones")
        const data = await r.json()
        
        const promos: PromocionAPI[] = Array.isArray(data?.promociones) ? data.promociones : []
        
        // Mapear datos de API al formato del componente
        const mapped = promos.map((p): PromocionDisplay => {
          const tipoMap: Record<string, string> = {
            aereo: "Aéreo",
            maritimo: "Crucero",
            terrestre: "Terrestre",
            otro: "Otro"
          };
          
          return {
            id: `promo-${p.descuento_id}`,
            name: p.servicio_nombre,
            destination: p.lugar_nombre || "Destino no especificado",
            description: p.descripcion || "Sin descripción",
            discount: `${p.porcentaje_descuento}% OFF`,
            discountPercent: p.porcentaje_descuento,
            originalPrice: p.costo_servicio,
            price: p.precio_con_descuento,
            miles: p.millas_otorgadas,
            validUntil: p.fecha_vencimiento,
            daysLeft: p.dias_restantes,
            savings: p.ahorro,
            image: p.imagen_principal,
            type: tipoMap[p.tipo_servicio] || p.tipo_servicio,
            isHotDeal: p.porcentaje_descuento >= 30, // Hot deal si descuento >= 30%
            servicioId: p.servicio_id, // Guardar servicio_id directamente
            descuentoId: p.descuento_id // Guardar descuento_id directamente
          };
        });
        
        setPromociones(mapped)
      } catch (err) {
        console.error("Error cargando promociones:", err)
        setPromociones([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchPromociones()
  }, [])

  const filteredPromotions = useMemo(() => {
    let filtered = promociones.filter((promo) => {
      const matchesType = selectedType === "all" || promo.type === selectedType
      return matchesType
    })

    // Sort promotions
    if (sortBy === "discount") {
      filtered = [...filtered].sort((a, b) => b.discountPercent - a.discountPercent)
    } else if (sortBy === "price") {
      filtered = [...filtered].sort((a, b) => a.price - b.price)
    } else if (sortBy === "ending") {
      filtered = [...filtered].sort((a, b) => {
        const aDays = a.daysLeft ?? 999999
        const bDays = b.daysLeft ?? 999999
        return aDays - bDays
      })
    }

    return filtered
  }, [promociones, selectedType, sortBy])

  const clearFilters = () => {
    setSelectedType("all")
    setSortBy("discount")
  }

  async function handleAgregarAlCarrito(promo: PromocionDisplay) {
    try {
      const authCheck = await fetch("/api/auth/me", { cache: "no-store" })
      const authData = await authCheck.json()
      
      if (!authData.user || !authData.user.userId) {
        toast.error("Debes iniciar sesión para agregar promociones al carrito")
        router.push(`/login?next=/promociones`)
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
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Todas las Promociones</h2>
            <p className="mt-2 text-sm text-muted-foreground">{filteredPromotions.length} ofertas activas</p>
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        {showFilters && (
          <Card className="mb-8 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Filtrar Promociones</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de Servicio</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los servicios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los servicios</SelectItem>
                    <SelectItem value="Aéreo">Aéreo</SelectItem>
                    <SelectItem value="Terrestre">Terrestre</SelectItem>
                    <SelectItem value="Crucero">Crucero</SelectItem>
                    <SelectItem value="Tour">Tour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mayor descuento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Mayor descuento</SelectItem>
                    <SelectItem value="price">Menor precio</SelectItem>
                    <SelectItem value="ending">Próximas a vencer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#E91E63]" />
            <p className="text-muted-foreground">Cargando promociones...</p>
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No hay promociones disponibles en este momento</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPromotions.map((promo) => (
            <Card key={promo.id} className="group overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative overflow-hidden">
                <img
                  src={promo.image || "/placeholder.svg"}
                  alt={promo.name}
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Discount Badge */}
                <Badge className="absolute right-4 top-4 bg-[#E91E63] text-white border-0 text-base px-3 py-1">
                  {promo.discount}
                </Badge>

                {/* Hot Deal Badge */}
                {promo.isHotDeal && (
                  <Badge className="absolute left-4 top-4 bg-orange-500 text-white border-0 gap-1">
                    <Flame className="h-3 w-3" />
                    Hot Deal
                  </Badge>
                )}

                {/* Days Left Badge */}
                {promo.daysLeft !== null && promo.daysLeft <= 15 && (
                  <Badge className="absolute left-4 bottom-4 bg-red-500 text-white border-0 gap-1">
                    <Clock className="h-3 w-3" />
                    Últimos {promo.daysLeft} días
                  </Badge>
                )}

                <div className="absolute right-4 bottom-4">
                  <WishlistButton itemId={promo.id} itemName={promo.name} variant="icon" />
                </div>
              </div>

              <div className="p-6">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{promo.destination}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {promo.type}
                  </Badge>
                </div>

                <h3 className="mb-2 text-xl font-bold">{promo.name}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">{promo.description}</p>

                {/* Validity Period */}
                {promo.validUntil && (
                  <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Válido hasta el{" "}
                      {new Date(promo.validUntil).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {!promo.validUntil && (
                  <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Promoción permanente</span>
                  </div>
                )}

                {/* Pricing */}
                <div className="mb-4 border-t pt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg text-muted-foreground line-through">
                      ${promo.originalPrice.toLocaleString()}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                    >
                      Ahorras ${promo.savings}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#E91E63]">${promo.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">USD</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">o {promo.miles.toLocaleString()} millas</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-[#E91E63] hover:bg-[#E91E63]/90"
                    onClick={() => handleAgregarAlCarrito(promo)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Agregar al Carrito
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/servicios/${promo.id.replace('promo-', '')}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog para seleccionar fecha */}
      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Fecha</DialogTitle>
            <DialogDescription>
              Selecciona la fecha de inicio para {selectedPromo?.name}
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
