"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trash2,
  MapPin,
  Calendar,
  Users,
  Plane,
  Hotel,
  Ship,
  Car,
  CreditCard,
  Shield,
  CheckCircle2,
  Wallet,
  Bitcoin,
  Award,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

type ItinerarioItem = {
  id_itinerario: number
  id_servicio: number
  nombre_servicio: string
  descripcion_servicio?: string
  costo_unitario_usd: number
  fecha_inicio: string
  fecha_fin: string
  tipo_servicio: string
  denominacion: string
  lugar_nombre?: string
}

type VentaCarrito = {
  id_venta: number
  monto_total: number
  monto_compensacion: number
  cantidad_items: number
  fecha_inicio_minima: string | null
  fecha_fin_maxima: string | null
  items: ItinerarioItem[] | null
}

export function CartCheckout() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ventas, setVentas] = useState<VentaCarrito[]>([])
  const [removing, setRemoving] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [installments, setInstallments] = useState("1")
  const [useMiles, setUseMiles] = useState(false)
  const [milesAmount, setMilesAmount] = useState("0")

  useEffect(() => {
    loadCart()
  }, [])

  async function loadCart() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/cliente/carrito", { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setVentas(Array.isArray(data?.items) ? data.items : [])
      } else {
        if (r.status === 401 || r.status === 403) {
          router.push("/login?next=/carrito")
          return
        }
        throw new Error(data?.error ?? "Error cargando carrito")
      }
    } catch (err: any) {
      setError(err?.message ?? "Error")
      toast.error("Error", {
        description: err?.message ?? "No se pudo cargar el carrito",
      })
    } finally {
      setLoading(false)
    }
  }

  async function removeItinerario(idVenta: number) {
    setRemoving(idVenta)
    try {
      const r = await fetch(`/api/cliente/ventas/${idVenta}`, { method: "DELETE" })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error eliminando del carrito")

      toast.success("Eliminado del carrito", {
        description: "El itinerario ha sido eliminado del carrito",
      })

      await loadCart()
      // Refrescar contador en header
      window.dispatchEvent(new Event("cart-updated"))
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudo eliminar del carrito",
      })
    } finally {
      setRemoving(null)
    }
  }

  function getIcon(tipoServicio: string) {
    const tipo = tipoServicio.toLowerCase()
    if (tipo.includes("aereo") || tipo.includes("vuelo")) return <Plane className="h-5 w-5" />
    if (tipo.includes("hotel") || tipo.includes("hospedaje")) return <Hotel className="h-5 w-5" />
    if (tipo.includes("maritimo") || tipo.includes("crucero")) return <Ship className="h-5 w-5" />
    if (tipo.includes("terrestre") || tipo.includes("traslado")) return <Car className="h-5 w-5" />
    return <MapPin className="h-5 w-5" />
  }

  function getTypeLabel(tipoServicio: string) {
    const tipo = tipoServicio.toLowerCase()
    if (tipo.includes("aereo")) return "Vuelo"
    if (tipo.includes("hotel")) return "Hotel"
    if (tipo.includes("maritimo")) return "Crucero"
    if (tipo.includes("terrestre")) return "Terrestre"
    return tipoServicio
  }

  // Calcular totales
  const totalVentas = ventas.reduce((sum, venta) => {
    if (!venta.items || venta.items.length === 0) return sum
    return sum + venta.items.reduce((itemSum, item) => itemSum + Number(item.costo_unitario_usd || 0), 0)
  }, 0)

  const taxes = totalVentas * 0.12 // 12% tax
  const milesDiscount = useMiles ? Number.parseInt(milesAmount) * 0.01 : 0
  const total = totalVentas + taxes - milesDiscount

  // Contar total de servicios
  const totalServicios = ventas.reduce((sum, venta) => sum + (venta.items?.length || 0), 0)

  if (loading) {
    return (
      <div className="bg-muted/30 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#E91E63]" />
          <p className="text-muted-foreground">Cargando carrito...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-muted/30 min-h-screen overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Carrito de Reservas</h1>
          <p className="text-white/90">Revisa tu selección y completa tu reserva</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {error && (
          <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {ventas.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">Tu carrito está vacío</h2>
              <p className="text-muted-foreground mb-6">
                Agrega itinerarios desde la página de itinerarios para comenzar
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild className="bg-[#E91E63] hover:bg-[#E91E63]/90">
                  <Link href="/itinerario">Ver mis itinerarios</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">Explorar destinos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Cart Items */}
            <div className="lg:col-span-7 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Itinerarios en el carrito ({ventas.length} itinerario{ventas.length !== 1 ? "s" : ""})
                  </CardTitle>
                  <CardDescription>
                    {totalServicios} servicio{totalServicios !== 1 ? "s" : ""} en total
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {ventas.map((venta, ventaIdx) => (
                    <div key={venta.id_venta}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">Itinerario #{venta.id_venta}</h3>
                          {venta.fecha_inicio_minima && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(venta.fecha_inicio_minima).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                              {venta.fecha_fin_maxima &&
                                ` - ${new Date(venta.fecha_fin_maxima).toLocaleDateString("es-ES", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}`}
                            </p>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => removeItinerario(venta.id_venta)}
                          disabled={removing === venta.id_venta}
                          title="Eliminar del carrito"
                        >
                          {removing === venta.id_venta ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {venta.items && venta.items.length > 0 ? (
                          venta.items.map((item, itemIdx) => (
                            <div key={item.id_itinerario} className="flex gap-4 p-3 rounded-lg border bg-card">
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#E91E63]/20 to-[#C2185B]/20 flex items-center justify-center shrink-0">
                                {getIcon(item.tipo_servicio)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate">{item.nombre_servicio}</h4>
                                    {item.lugar_nombre && (
                                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        {item.lugar_nombre}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {getTypeLabel(item.tipo_servicio)}
                                  </Badge>
                                  {item.fecha_inicio && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(item.fecha_inicio).toLocaleDateString("es-ES", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Costo:</span>
                                  <span className="font-bold text-[#E91E63]">
                                    {Number(item.costo_unitario_usd || 0).toLocaleString("es-VE", {
                                      style: "currency",
                                      currency: item.denominacion || "USD",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No hay servicios en este itinerario
                          </p>
                        )}
                      </div>

                      {ventaIdx < ventas.length - 1 && <Separator className="my-6" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Método de pago</CardTitle>
                  <CardDescription>Selecciona cómo deseas pagar tu reserva</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <RadioGroupItem value="credit-card" />
                        <CreditCard className="h-5 w-5 text-[#E91E63]" />
                        <div className="flex-1">
                          <p className="font-medium">Tarjeta de crédito/débito</p>
                          <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <RadioGroupItem value="zelle" />
                        <Wallet className="h-5 w-5 text-[#E91E63]" />
                        <div className="flex-1">
                          <p className="font-medium">Zelle</p>
                          <p className="text-sm text-muted-foreground">Transferencia instantánea</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <RadioGroupItem value="paypal" />
                        <Wallet className="h-5 w-5 text-[#E91E63]" />
                        <div className="flex-1">
                          <p className="font-medium">PayPal</p>
                          <p className="text-sm text-muted-foreground">Pago seguro con PayPal</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <RadioGroupItem value="crypto" />
                        <Bitcoin className="h-5 w-5 text-[#E91E63]" />
                        <div className="flex-1">
                          <p className="font-medium">Criptomonedas</p>
                          <p className="text-sm text-muted-foreground">BTC, USDT, ETH</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <RadioGroupItem value="bank-transfer" />
                        <Wallet className="h-5 w-5 text-[#E91E63]" />
                        <div className="flex-1">
                          <p className="font-medium">Transferencia bancaria</p>
                          <p className="text-sm text-muted-foreground">Pago móvil o transferencia</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "credit-card" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2 space-y-2">
                          <Label>Número de tarjeta</Label>
                          <Input placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha de vencimiento</Label>
                          <Input placeholder="MM/AA" />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input placeholder="123" type="password" maxLength={4} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label>Nombre en la tarjeta</Label>
                          <Input placeholder="Como aparece en la tarjeta" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Cuotas</Label>
                        <Select value={installments} onValueChange={setInstallments}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 pago (sin intereses)</SelectItem>
                            <SelectItem value="3">3 cuotas (3% interés)</SelectItem>
                            <SelectItem value="6">6 cuotas (6% interés)</SelectItem>
                            <SelectItem value="12">12 cuotas (12% interés)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox />
                      <span className="text-sm">Combinar con otro método de pago</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Frequent Flyer Miles */}
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-600" />
                    Millas de viajero frecuente
                  </CardTitle>
                  <CardDescription>Usa tus millas para reducir el costo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Millas disponibles:</span>
                    <span className="font-semibold">15,420 millas</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={useMiles} onCheckedChange={(checked) => setUseMiles(checked as boolean)} />
                    <span className="text-sm">Usar millas en esta reserva</span>
                  </label>
                  {useMiles && (
                    <div className="space-y-2">
                      <Label>Cantidad de millas a usar</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        max="15420"
                        value={milesAmount}
                        onChange={(e) => setMilesAmount(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">1 milla = $0.01 USD. Descuento máximo: $154.20</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-4 space-y-4">
                {/* Price Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen de la reserva</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">
                          {totalVentas.toLocaleString("es-VE", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Impuestos y tasas (12%)</span>
                        <span className="font-medium">
                          {taxes.toLocaleString("es-VE", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </span>
                      </div>
                      {useMiles && milesDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Descuento por millas</span>
                          <span className="font-medium">
                            -{milesDiscount.toLocaleString("es-VE", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Total a pagar</span>
                        <span className="text-3xl font-bold text-[#E91E63]">
                          {total.toLocaleString("es-VE", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </span>
                      </div>
                      {installments !== "1" && (
                        <p className="text-xs text-muted-foreground">
                          {installments} cuotas de{" "}
                          {(total / Number.parseInt(installments)).toLocaleString("es-VE", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Confirm Button */}
                    <Button
                      className="w-full h-12 bg-[#E91E63] hover:bg-[#E91E63]/90 text-lg"
                      onClick={() => {
                        toast.info("Próximamente", {
                          description: "La funcionalidad de pago estará disponible pronto",
                        })
                      }}
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Confirmar y pagar
                    </Button>

                    {/* Trust Messages */}
                    <div className="space-y-2 pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>Tus datos están protegidos</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Transacción 100% segura</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Confirmación inmediata</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Traveler Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información de pasajeros</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>Pasajero principal</Label>
                      <Input placeholder="Nombre completo" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" placeholder="tu@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input type="tel" placeholder="+58 412 123 4567" />
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer text-sm">
                      <Checkbox className="mt-0.5" />
                      <span className="text-muted-foreground">
                        Acepto los términos y condiciones y la política de privacidad
                      </span>
                    </label>
                  </CardContent>
                </Card>

                {/* Help */}
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-3">¿Necesitas ayuda con tu reserva?</p>
                    <Button variant="outline" size="sm" className="w-full bg-background">
                      Contactar soporte
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
