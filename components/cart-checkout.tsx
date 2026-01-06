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
  costo_unitario_bs?: number // Precio convertido a Bs
  costo_unitario_original?: number // Precio original antes de conversión
  fecha_inicio: string
  tipo_servicio: string
  denominacion: string
  denominacion_original?: string // Denominación original del servicio
  lugar_nombre?: string
}

type VentaCarrito = {
  id_venta: number
  monto_total: number
  monto_compensacion: number
  cantidad_items: number
  fecha_inicio_minima: string | null
  items: ItinerarioItem[] | null
}

type CambiosCarrito = {
  hay_cambios: boolean
  items_precio_cambiado: number
  items_no_disponibles: number
  servicios_no_disponibles: Array<{
    id_itinerario: number
    nombre: string
  }>
  items_precio_actualizado?: Array<{
    id_itinerario: number
    nombre: string
  }>
}

export function CartCheckout() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ventas, setVentas] = useState<VentaCarrito[]>([])
  const [cambios, setCambios] = useState<CambiosCarrito | null>(null)
  const [tasaCambioUSD, setTasaCambioUSD] = useState<number>(36.5) // Valor por defecto
  const [removing, setRemoving] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [installments, setInstallments] = useState("1")
  const [useMiles, setUseMiles] = useState(false)
  const [milesAmount, setMilesAmount] = useState("0")
  const [processing, setProcessing] = useState(false)
  
  // Estados para datos de pago
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCVV, setCardCVV] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [transferReference, setTransferReference] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferDate, setTransferDate] = useState("")
  const [officePaymentType, setOfficePaymentType] = useState("efectivo")
  const [officeNote, setOfficeNote] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)

  useEffect(() => {
    loadCart()
    
    // Escuchar eventos de actualización del carrito
    const handleCartUpdate = () => {
      loadCart()
    }
    
    window.addEventListener("cart-updated", handleCartUpdate)
    
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate)
    }
  }, [])

  async function loadCart() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/cliente/carrito", { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setVentas(Array.isArray(data?.items) ? data.items : [])
        setCambios(data?.cambios || null)
        
        // Mostrar notificación si hay cambios
        if (data?.cambios?.hay_cambios) {
          const mensajes: string[] = []
          if (data.cambios.items_precio_cambiado > 0) {
            mensajes.push(`${data.cambios.items_precio_cambiado} artículo(s) cambiaron de precio`)
          }
          if (data.cambios.items_no_disponibles > 0) {
            mensajes.push(`${data.cambios.items_no_disponibles} artículo(s) ya no están disponibles`)
          }
          
          if (mensajes.length > 0) {
            toast.warning("Cambios en tu carrito", {
              description: mensajes.join(". "),
              duration: 6000,
            })
          }
        }
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

  async function handleCheckout() {
    // Validaciones pre-checkout
    if (ventas.length === 0) {
      toast.error("Carrito vacío", {
        description: "Agrega al menos un itinerario al carrito",
      })
      return
    }

    // Validar que no haya servicios no disponibles
    const hayServiciosNoDisponibles = ventas.some((v) =>
      v.items?.some((item) => !item.servicio_activo)
    )

    if (hayServiciosNoDisponibles) {
      toast.error("Carrito inválido", {
        description: "Hay servicios no disponibles en tu carrito. Elimínalos para continuar.",
      })
      return
    }

    if (!acceptTerms) {
      toast.error("Términos y condiciones", {
        description: "Debes aceptar los términos y condiciones para continuar",
      })
      return
    }

    // Validar datos según método de pago
    if (paymentMethod === "credit-card") {
      if (!cardNumber || !cardHolder || !cardExpiry) {
        toast.error("Datos incompletos", {
          description: "Completa todos los datos de la tarjeta",
        })
        return
      }
    } else if (paymentMethod === "zelle" || paymentMethod === "bank-transfer") {
      if (!transferReference) {
        toast.error("Datos incompletos", {
          description: "Ingresa el número de referencia de la transferencia",
        })
        return
      }
    }

    setProcessing(true)

    try {
      // Preparar datos de pago según el método
      const ventasParaCheckout = ventas.map((venta) => {
        let datosMetodoPago: any = {}
        let metodoPagoBD = ""

        if (paymentMethod === "credit-card") {
          metodoPagoBD = "tarjeta"
          datosMetodoPago = {
            numero_tarjeta: cardNumber.replace(/\s/g, ""),
            codigo_seguridad: cardCVV ? Number.parseInt(cardCVV) : null,
            fecha_vencimiento: cardExpiry ? new Date(cardExpiry) : null,
            titular: cardHolder,
            emisor: null, // Se puede agregar un campo para esto
            fk_banco: null,
          }
        } else if (paymentMethod === "zelle" || paymentMethod === "bank-transfer") {
          metodoPagoBD = "billetera" // Zelle/PayPal se manejan como billetera
          datosMetodoPago = {
            numero_confirmacion: transferReference,
            fk_tbd: null, // Tipo de billetera digital (se puede agregar)
            fk_banco: null,
          }
        } else if (paymentMethod === "crypto") {
          metodoPagoBD = "cripto"
          datosMetodoPago = {
            nombre_criptomoneda: "USDT", // Por defecto, se puede hacer select
            direccion_billetera: transferReference,
          }
        } else if (paymentMethod === "office") {
          // Pago en oficina: solo registramos intención, no creamos método de pago real
          // Usaremos "cheque" como placeholder pero con nota
          metodoPagoBD = "cheque"
          datosMetodoPago = {
            codigo_cuenta: null,
            numero_cheque: null, // Se puede generar un número de referencia
            fk_banco: null,
          }
        }

        return {
          id_venta: venta.id_venta,
          metodo_pago: metodoPagoBD,
          datos_metodo_pago: datosMetodoPago,
          monto_pago: venta.monto_total, // Monto total de la venta en Bs
          denominacion: "VEN",
        }
      })

      const response = await fetch("/api/cliente/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ventas: ventasParaCheckout }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error ?? "Error procesando el pago")
      }

      // Verificar resultados
      const todasExitosas = data.resultados?.every((r: any) => r.exito) ?? false
      const algunasExitosas = data.resultados?.some((r: any) => r.exito) ?? false

      if (todasExitosas) {
        // Todas las ventas fueron pagadas exitosamente
        const estadosFinales = data.resultados.map((r: any) => r.estado_final)
        const todasPagadas = estadosFinales.every((e: string) => e === "Pagado")

        if (todasPagadas) {
          toast.success("¡Pago exitoso!", {
            description: "Tu compra ha sido confirmada. Redirigiendo a tus viajes...",
            duration: 3000,
          })

          // Limpiar carrito
          window.dispatchEvent(new Event("cart-updated"))

          // Redirigir a mis viajes después de un breve delay
          setTimeout(() => {
            router.push("/mis-viajes")
          }, 2000)
        } else {
          // Algunas quedaron pendientes
          toast.success("Reserva registrada", {
            description: "Tu reserva ha sido registrada. El pago está pendiente de confirmación.",
            duration: 5000,
          })

          setTimeout(() => {
            router.push("/mis-viajes")
          }, 2000)
        }
      } else if (algunasExitosas) {
        // Algunas exitosas, algunas fallaron
        const errores = data.resultados
          .filter((r: any) => !r.exito)
          .map((r: any) => r.error)
          .join(", ")

        toast.warning("Pago parcial", {
          description: `Algunas ventas se procesaron, pero hubo errores: ${errores}`,
          duration: 6000,
        })

        // Recargar carrito para ver qué quedó pendiente
        await loadCart()
      } else {
        // Todas fallaron
        const errores = data.resultados
          .map((r: any) => r.error || "Error desconocido")
          .join(", ")

        throw new Error(`Error procesando pagos: ${errores}`)
      }
    } catch (err: any) {
      console.error("Error en checkout:", err)
      toast.error("Error procesando pago", {
        description: err?.message ?? "No se pudo procesar el pago. Intenta nuevamente.",
        duration: 6000,
      })
    } finally {
      setProcessing(false)
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

  // Calcular totales en Bs (usar costo_unitario_bs si existe, sino costo_unitario_usd como fallback)
  const totalVentas = ventas.reduce((sum, venta) => {
    if (!venta.items || venta.items.length === 0) return sum
    return sum + venta.items.reduce((itemSum, item) => {
      // Priorizar costo_unitario_bs (ya convertido a Bs), sino usar costo_unitario_usd como fallback
      const costo = Number(item.costo_unitario_bs || item.costo_unitario_usd || 0)
      return itemSum + costo
    }, 0)
  }, 0)

  // Calcular descuentos totales de promociones (en Bs)
  const descuentosPromociones = ventas.reduce((sum, venta) => {
    if (!venta.items || venta.items.length === 0) return sum
    return sum + venta.items.reduce((itemSum, item) => {
      if (item.tiene_descuento && item.descuento_aplicado) {
        // Convertir descuento a Bs si la denominación original no es VEN
        const descuentoOriginal = Number(item.descuento_aplicado || 0)
        if (item.denominacion_original && item.denominacion_original !== 'VEN') {
          return itemSum + (descuentoOriginal * tasaCambioUSD) // Usar tasa de cambio para convertir
        }
        return itemSum + descuentoOriginal
      }
      return itemSum
    }, 0)
  }, 0)

  const taxes = totalVentas * 0.12 // 12% tax
  // Descuento por millas: 1 milla = $0.01 USD, convertimos a Bs usando tasa de cambio real
  const milesDiscountUSD = useMiles ? Number.parseInt(milesAmount) * 0.01 : 0
  const milesDiscount = milesDiscountUSD * tasaCambioUSD // Convertir a Bs usando tasa real
  const total = totalVentas + taxes - descuentosPromociones - milesDiscount

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
                  {/* Mensaje de cambios en el carrito */}
                  {cambios?.hay_cambios && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                            Cambios en tu carrito
                          </h4>
                          <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                            {cambios.items_precio_cambiado > 0 && (
                              <p>
                                • {cambios.items_precio_cambiado} artículo(s) {cambios.items_precio_cambiado === 1 ? "cambió" : "cambiaron"} de precio. 
                                Los precios han sido actualizados automáticamente.
                              </p>
                            )}
                            {cambios.items_no_disponibles > 0 && (
                              <p>
                                • {cambios.items_no_disponibles} artículo(s) {cambios.items_no_disponibles === 1 ? "ya no está" : "ya no están"} disponible(s). 
                                Por favor, elimínalo(s) de tu carrito para continuar.
                              </p>
                            )}
                            {cambios.servicios_no_disponibles && cambios.servicios_no_disponibles.length > 0 && (
                              <div className="mt-2">
                                <p className="font-medium mb-1">Servicios no disponibles:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {cambios.servicios_no_disponibles.map((s) => (
                                    <li key={s.id_itinerario}>{s.nombre}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {ventas.map((venta, ventaIdx) => {
                    // Mostrar número secuencial (1, 2, 3...) en lugar del ID de BD
                    const numeroSecuencial = ventaIdx + 1
                    return (
                    <div key={venta.id_venta}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">Itinerario #{numeroSecuencial}</h3>
                          {venta.fecha_inicio_minima && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(venta.fecha_inicio_minima).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
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
                            <div 
                              key={item.id_itinerario} 
                              className={`flex gap-4 p-3 rounded-lg border bg-card ${
                                !item.servicio_activo ? 'border-destructive/50 bg-destructive/5' : 
                                item.precio_cambiado ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/10' : ''
                              }`}
                            >
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#E91E63]/20 to-[#C2185B]/20 flex items-center justify-center shrink-0">
                                {getIcon(item.tipo_servicio)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-semibold truncate">{item.nombre_servicio}</h4>
                                      {!item.servicio_activo && (
                                        <Badge variant="destructive" className="text-xs">
                                          No disponible
                                        </Badge>
                                      )}
                                      {item.precio_cambiado && item.servicio_activo && (
                                        <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:text-amber-400">
                                          Precio actualizado
                                        </Badge>
                                      )}
                                    </div>
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
                                  <div className="flex flex-col items-end gap-1">
                                    {item.tiene_descuento && item.costo_unitario_sin_descuento && (
                                      <span className="text-xs text-muted-foreground line-through">
                                        Bs. {Number(item.costo_unitario_sin_descuento).toLocaleString("es-VE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                      </span>
                                    )}
                                    <span className="font-bold text-[#E91E63]">
                                      Bs. {Number(item.costo_unitario_bs || item.costo_unitario_usd || 0).toLocaleString("es-VE", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </span>
                                    {item.tiene_descuento && item.descuento_aplicado && (
                                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 text-xs">
                                        Ahorras Bs. {Number(item.descuento_aplicado).toLocaleString("es-VE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                      </Badge>
                                    )}
                                  </div>
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
                  )
                  })}
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

                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <RadioGroupItem value="office" />
                        <Wallet className="h-5 w-5 text-[#E91E63]" />
                        <div className="flex-1">
                          <p className="font-medium">Pago en oficina</p>
                          <p className="text-sm text-muted-foreground">Efectivo, cheque o depósito</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "credit-card" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2 space-y-2">
                          <Label>Número de tarjeta</Label>
                          <Input 
                            placeholder="1234 5678 9012 3456" 
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                            maxLength={16}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha de vencimiento</Label>
                          <Input 
                            placeholder="MM/AA" 
                            value={cardExpiry}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                              if (value.length >= 2) {
                                setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`)
                              } else {
                                setCardExpiry(value)
                              }
                            }}
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input 
                            placeholder="123" 
                            type="password" 
                            maxLength={4}
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ""))}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label>Nombre en la tarjeta</Label>
                          <Input 
                            placeholder="Como aparece en la tarjeta" 
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                          />
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

                  {(paymentMethod === "zelle" || paymentMethod === "bank-transfer") && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label>Número de referencia / Confirmación</Label>
                        <Input 
                          placeholder="Ingresa el número de referencia de la transferencia" 
                          value={transferReference}
                          onChange={(e) => setTransferReference(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          {paymentMethod === "zelle" 
                            ? "Ingresa el número de confirmación de Zelle"
                            : "Ingresa el número de referencia de la transferencia bancaria o pago móvil"}
                        </p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Monto transferido</Label>
                          <Input 
                            type="number"
                            placeholder="0.00"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha de transferencia</Label>
                          <Input 
                            type="date"
                            value={transferDate}
                            onChange={(e) => setTransferDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "crypto" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label>Dirección de billetera</Label>
                        <Input 
                          placeholder="0x..." 
                          value={transferReference}
                          onChange={(e) => setTransferReference(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Ingresa la dirección de tu billetera cripto
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "office" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label>Tipo de pago en oficina</Label>
                        <Select value={officePaymentType} onValueChange={setOfficePaymentType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="efectivo">Efectivo</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                            <SelectItem value="deposito">Depósito</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nota adicional (opcional)</Label>
                        <Input 
                          placeholder="Información adicional sobre el pago" 
                          value={officeNote}
                          onChange={(e) => setOfficeNote(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Esta reserva quedará pendiente hasta que se confirme el pago en oficina
                        </p>
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
                      <p className="text-xs text-muted-foreground">
                        1 milla = Bs. {(0.01 * tasaCambioUSD).toFixed(2)}. Descuento máximo: Bs. {(15420 * 0.01 * tasaCambioUSD).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
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
                          Bs. {totalVentas.toLocaleString("es-VE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Impuestos y tasas (12%)</span>
                        <span className="font-medium">
                          Bs. {taxes.toLocaleString("es-VE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      {descuentosPromociones > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Descuento por promociones</span>
                          <span className="font-medium">
                            -Bs. {descuentosPromociones.toLocaleString("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                      {useMiles && milesDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Descuento por millas</span>
                          <span className="font-medium">
                            -Bs. {milesDiscount.toLocaleString("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Total a pagar</span>
                        <span className="text-3xl font-bold text-[#E91E63]">
                          Bs. {total.toLocaleString("es-VE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      {installments !== "1" && (
                        <p className="text-xs text-muted-foreground">
                          {installments} cuotas de{" "}
                          Bs. {(total / Number.parseInt(installments)).toLocaleString("es-VE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Confirm Button */}
                    <Button
                      className="w-full h-12 bg-[#E91E63] hover:bg-[#E91E63]/90 text-lg"
                      onClick={handleCheckout}
                      disabled={processing || ventas.length === 0}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Confirmar y pagar
                        </>
                      )}
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
                      <Checkbox 
                        className="mt-0.5" 
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      />
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
