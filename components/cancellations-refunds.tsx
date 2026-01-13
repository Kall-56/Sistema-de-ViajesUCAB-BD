"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XCircle, AlertTriangle, Download, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

type VentaPagada = {
  id_venta: number
  monto_total: number
  cantidad_items: number
  fecha_inicio_minima: string
  fecha_inicio_maxima: string
  estado: string
  fecha_estado: string
  items: Array<{
    id_itinerario: number
    id_servicio: number
    nombre_servicio: string
    descripcion_servicio?: string
    costo_unitario_bs: number
    fecha_inicio: string
    tipo_servicio: string
    lugar_nombre?: string
  }> | null
}

type Reembolso = {
  id_reembolso: number
  monto_reembolso: number
  fk_venta: number
  monto_original: number
  estado_venta: string
  fecha_reembolso: string
  fecha_viaje: string | null
  servicios: string[] | null
}

export function CancellationsRefunds() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadingReembolsos, setLoadingReembolsos] = useState(true)
  const [solicitando, setSolicitando] = useState(false)
  const [ventasPagadas, setVentasPagadas] = useState<VentaPagada[]>([])
  const [reembolsos, setReembolsos] = useState<Reembolso[]>([])
  const [selectedReservation, setSelectedReservation] = useState("")
  const [cancellationReason, setCancellationReason] = useState("")
  const [esCancelacionVoluntaria, setEsCancelacionVoluntaria] = useState(false)

  useEffect(() => {
    loadVentasPagadas()
    loadReembolsos()
  }, [])

  async function loadVentasPagadas() {
    setLoading(true)
    try {
      const r = await fetch("/api/cliente/mis-viajes", { cache: "no-store" })
      const data = await r.json()
      
      if (r.ok) {
        // Filtrar solo ventas pagadas que no tienen reembolso
        const ventasFiltradas = (data.compras || []).filter((v: any) => {
          return v.estado === "Pagado"
        })
        setVentasPagadas(ventasFiltradas)
      } else {
        if (r.status === 401 || r.status === 403) {
          router.push("/login?next=/cancelaciones-reembolsos")
          return
        }
        throw new Error(data?.error ?? "Error cargando ventas")
      }
    } catch (err: any) {
      console.error("Error cargando ventas:", err)
      toast.error("Error", {
        description: err.message ?? "No se pudieron cargar las reservas",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadReembolsos() {
    setLoadingReembolsos(true)
    try {
      const r = await fetch("/api/cliente/reembolsos", { cache: "no-store" })
      const data = await r.json()
      
      if (r.ok) {
        setReembolsos(data.reembolsos || [])
      } else {
        if (r.status === 401 || r.status === 403) {
          router.push("/login?next=/cancelaciones-reembolsos")
          return
        }
        console.error("Error cargando reembolsos:", data?.error)
      }
    } catch (err: any) {
      console.error("Error cargando reembolsos:", err)
    } finally {
      setLoadingReembolsos(false)
    }
  }

  async function handleSolicitarReembolso() {
    if (!selectedReservation) {
      toast.error("Selecciona una reserva")
      return
    }

    const idVenta = Number.parseInt(selectedReservation)
    if (isNaN(idVenta)) {
      toast.error("Reserva inválida")
      return
    }

    setSolicitando(true)
    try {
      const r = await fetch("/api/cliente/reembolsos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id_venta: idVenta,
          es_cancelacion_voluntaria: esCancelacionVoluntaria
        }),
      })

      const data = await r.json()

      if (r.ok) {
        toast.success("Reembolso procesado", {
          description: "Tu reembolso ha sido procesado exitosamente. El monto será reembolsado a tu método de pago original.",
        })
        setSelectedReservation("")
        setCancellationReason("")
        setMontoCalculado(null)
        // Recargar datos
        await loadVentasPagadas()
        await loadReembolsos()
      } else {
        throw new Error(data?.error ?? "Error procesando reembolso")
      }
    } catch (err: any) {
      console.error("Error solicitando reembolso:", err)
      toast.error("Error", {
        description: err.message ?? "No se pudo procesar la solicitud de reembolso",
      })
    } finally {
      setSolicitando(false)
    }
  }

  const selectedVenta = ventasPagadas.find((v) => v.id_venta.toString() === selectedReservation)
  const [montoCalculado, setMontoCalculado] = useState<{
    monto_original: number
    monto_reembolso: number
    penalizacion: number
    puede_reembolsar: boolean
  } | null>(null)
  const [calculandoMonto, setCalculandoMonto] = useState(false)

  useEffect(() => {
    async function calcularMontoReembolso() {
      if (!selectedReservation) {
        setMontoCalculado(null)
        return
      }

      setCalculandoMonto(true)
      try {
        const r = await fetch(`/api/cliente/reembolsos/calcular?id_venta=${selectedReservation}&es_cancelacion_voluntaria=${esCancelacionVoluntaria}`, {
          cache: "no-store"
        })
        const data = await r.json()

        if (r.ok) {
          setMontoCalculado({
            monto_original: data.monto_original,
            monto_reembolso: data.monto_reembolso,
            penalizacion: data.penalizacion || 0,
            puede_reembolsar: data.puede_reembolsar
          })
        } else {
          setMontoCalculado(null)
          if (data.error && !data.error.includes("Solo se pueden reembolsar")) {
            toast.error("Error", {
              description: data.error
            })
          }
        }
      } catch (err: any) {
        console.error("Error calculando monto de reembolso:", err)
        setMontoCalculado(null)
      } finally {
        setCalculandoMonto(false)
      }
    }

    calcularMontoReembolso()
  }, [selectedReservation, esCancelacionVoluntaria])

  const montoOriginal = montoCalculado?.monto_original || selectedVenta?.monto_total || 0
  const penalizacion = montoCalculado?.penalizacion || 0
  const montoReembolso = montoCalculado?.monto_reembolso || montoOriginal

  // Formatear fecha
  const formatFecha = (fechaStr: string | null) => {
    if (!fechaStr) return "N/A"
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
  }

  // Formatear rango de fechas
  const formatRangoFechas = (fechaMin: string, fechaMax: string) => {
    if (fechaMin === fechaMax) {
      return formatFecha(fechaMin)
    }
    return `${formatFecha(fechaMin)} - ${formatFecha(fechaMax)}`
  }

  // Obtener destino de la venta (primer lugar de los items)
  const getDestino = (venta: VentaPagada) => {
    if (!venta.items || venta.items.length === 0) return "Destino no especificado"
    const primerItem = venta.items[0]
    return primerItem.lugar_nombre || primerItem.nombre_servicio || "Destino no especificado"
  }

  if (loading || loadingReembolsos) {
    return (
      <div className="py-16">
        <Card className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#E91E63]" />
          <p className="text-muted-foreground">Cargando información...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cancellation Form */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white">
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Solicitar Cancelación
          </CardTitle>
          <CardDescription className="text-white/90">
            Selecciona la reserva que deseas cancelar y conoce el monto a reembolsar
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reservation">Seleccionar Reserva</Label>
            <Select 
              value={selectedReservation || undefined} 
              onValueChange={setSelectedReservation}
            >
              <SelectTrigger id="reservation">
                <SelectValue placeholder="Elige una reserva pagada" />
              </SelectTrigger>
              <SelectContent>
                {ventasPagadas.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No hay reservas pagadas disponibles
                  </div>
                ) : (
                  ventasPagadas.map((venta) => (
                    <SelectItem key={venta.id_venta} value={venta.id_venta.toString()}>
                      Venta #{venta.id_venta} - {getDestino(venta)} ({formatRangoFechas(venta.fecha_inicio_minima, venta.fecha_inicio_maxima)})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedVenta && (
            <>
              <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Destino</span>
                  <span className="font-semibold">{getDestino(selectedVenta)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fechas</span>
                  <span className="font-semibold">
                    {formatRangoFechas(selectedVenta.fecha_inicio_minima, selectedVenta.fecha_inicio_maxima)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monto Original</span>
                  <span className="font-semibold">
                    Bs. {montoOriginal.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {calculandoMonto ? (
                  <div className="border-t pt-3 flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-[#E91E63] mr-2" />
                    <span className="text-sm text-muted-foreground">Calculando monto de reembolso...</span>
                  </div>
                ) : montoCalculado && montoCalculado.puede_reembolsar ? (
                  <div className="border-t pt-3 space-y-2">
                    {penalizacion > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span className="text-sm flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Penalización
                        </span>
                        <span className="font-semibold">
                          -Bs. {penalizacion.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">Monto a Reembolsar</span>
                      <span className="font-bold text-[#E91E63]">
                        Bs. {montoReembolso.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ) : montoCalculado && !montoCalculado.puede_reembolsar ? (
                  <div className="border-t pt-3">
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <AlertTriangle className="h-4 w-4 inline mr-2" />
                        Esta venta no puede ser reembolsada en este momento.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motivo de Cancelación (Opcional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Cuéntanos por qué necesitas cancelar tu reserva..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                  <Checkbox
                    id="cancelacion-voluntaria"
                    checked={esCancelacionVoluntaria}
                    onCheckedChange={(checked) => setEsCancelacionVoluntaria(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="cancelacion-voluntaria" className="cursor-pointer font-medium">
                      Cancelación voluntaria
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Si marcas esta opción, se aplicará una penalización del 10% sobre el monto total. 
                      Si no la marcas, se procesará un reembolso total (100%) por parte de la empresa.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  <strong>Política de Cancelación:</strong> {
                    esCancelacionVoluntaria 
                      ? "Cancelación voluntaria: se aplica penalización del 10%, reembolso del 90%."
                      : "Reembolso total: se reembolsa el 100% del monto pagado."
                  }
                  El reembolso se procesará y se reflejará en tu método de pago original.
                </p>
              </div>

              <Button 
                className="w-full bg-[#E91E63] hover:bg-[#E91E63]/90" 
                size="lg"
                onClick={handleSolicitarReembolso}
                disabled={solicitando || !montoCalculado?.puede_reembolsar || calculandoMonto}
              >
                {solicitando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando Reembolso...
                  </>
                ) : !montoCalculado?.puede_reembolsar ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    No Disponible
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Confirmar Reembolso
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Refund History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#E91E63]" />
            Historial de Reembolsos
          </CardTitle>
          <CardDescription>Seguimiento de tus solicitudes de cancelación y reembolsos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reembolsos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes reembolsos registrados</p>
            </div>
          ) : (
            reembolsos.map((refund) => (
              <div key={refund.id_reembolso} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      {refund.servicios && refund.servicios.length > 0 
                        ? refund.servicios.join(", ")
                        : "Venta #" + refund.fk_venta}
                    </p>
                    <p className="text-sm text-muted-foreground">Venta: #{refund.fk_venta}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Solicitado: {formatFecha(refund.fecha_reembolso)}
                    </p>
                    {refund.fecha_viaje && (
                      <p className="text-xs text-muted-foreground">
                        Fecha del viaje: {formatFecha(refund.fecha_viaje)}
                      </p>
                    )}
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completado
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Monto Original</p>
                    <p className="font-semibold">
                      Bs. {refund.monto_original.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monto Reembolsado</p>
                    <p className="font-semibold text-green-600">
                      Bs. {refund.monto_reembolso.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estado</p>
                    <p className="font-semibold">{refund.estado_venta}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Comprobante
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
