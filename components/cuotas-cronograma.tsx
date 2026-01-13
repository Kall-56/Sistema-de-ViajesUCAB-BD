"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Clock, Calendar, CreditCard, Loader2 } from "lucide-react"

type Cuota = {
  id_cuota: number
  monto_cuota: number
  fecha_pagar: string
  estado: string
  fecha_estado: string
  tiene_pago: number
}

type PlanCuotas = {
  id_plan_cuotas: number
  tasa_interes: number
  fk_venta: number
  monto_total_venta: number
  total_cuotas: number
  cuotas_pagadas: number
  monto_total_financiado: number
  monto_pagado: number
  saldo_pendiente: number
  cuotas: Cuota[]
}

interface CuotasCronogramaProps {
  idVenta: number
}

export function CuotasCronograma({ idVenta }: CuotasCronogramaProps) {
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<PlanCuotas | null>(null)
  const [showPagarDialog, setShowPagarDialog] = useState(false)
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<Cuota | null>(null)
  const [metodosPago, setMetodosPago] = useState<any[]>([])
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState("")
  const [pagando, setPagando] = useState(false)

  useEffect(() => {
    loadPlanCuotas()
    loadMetodosPago()
  }, [idVenta])

  async function loadPlanCuotas() {
    setLoading(true)
    try {
      const r = await fetch(`/api/cliente/cuotas?id_venta=${idVenta}`, { cache: "no-store" })
      const data = await r.json()

      if (r.ok && data.planes?.length > 0) {
        setPlan(data.planes[0])
      } else {
        setPlan(null)
      }
    } catch (err: any) {
      console.error("Error cargando plan de cuotas:", err)
      setPlan(null)
    } finally {
      setLoading(false)
    }
  }

  async function loadMetodosPago() {
    try {
      const r = await fetch("/api/cliente/metodos-pago", { cache: "no-store" })
      const data = await r.json()

      if (r.ok && Array.isArray(data?.metodos)) {
        setMetodosPago(data.metodos)
      }
    } catch (err: any) {
      console.error("Error cargando métodos de pago:", err)
    }
  }

  async function handlePagarCuota() {
    if (!cuotaSeleccionada || !metodoPagoSeleccionado) {
      toast.error("Debes seleccionar un método de pago")
      return
    }

    setPagando(true)
    try {
      const r = await fetch("/api/cliente/cuotas/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cuota: cuotaSeleccionada.id_cuota,
          monto: cuotaSeleccionada.monto_cuota,
          id_metodo_pago: Number(metodoPagoSeleccionado),
          denominacion: "VEN",
        }),
      })

      const data = await r.json()

      if (r.ok) {
        toast.success("Cuota pagada exitosamente", {
          description: `Se registró el pago de Bs. ${cuotaSeleccionada.monto_cuota.toLocaleString("es-VE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        })
        setShowPagarDialog(false)
        setCuotaSeleccionada(null)
        setMetodoPagoSeleccionado("")
        await loadPlanCuotas()
      } else {
        throw new Error(data?.error ?? "Error pagando cuota")
      }
    } catch (err: any) {
      console.error("Error pagando cuota:", err)
      toast.error("Error", {
        description: err.message ?? "No se pudo procesar el pago de la cuota",
      })
    } finally {
      setPagando(false)
    }
  }

  function getEstadoBadge(estado: string) {
    if (estado === "Pagado") {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Pagada
        </Badge>
      )
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
        <Clock className="h-3 w-3 mr-1" />
        Pendiente
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-[#E91E63]" />
      </div>
    )
  }

  if (!plan || !plan.cuotas || plan.cuotas.length === 0) {
    return null
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cronograma de Cuotas</CardTitle>
          <CardDescription>
            {plan.cuotas_pagadas} de {plan.total_cuotas} cuotas pagadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {plan.cuotas.map((cuota) => (
            <div
              key={cuota.id_cuota}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">Cuota #{plan.cuotas.indexOf(cuota) + 1}</span>
                  {getEstadoBadge(cuota.estado)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(cuota.fecha_pagar).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">
                    Bs. {cuota.monto_cuota.toLocaleString("es-VE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
              {cuota.estado === "pendiente" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCuotaSeleccionada(cuota)
                    setShowPagarDialog(true)
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={showPagarDialog} onOpenChange={setShowPagarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagar Cuota</DialogTitle>
            <DialogDescription>
              Selecciona el método de pago para pagar esta cuota
            </DialogDescription>
          </DialogHeader>
          {cuotaSeleccionada && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 bg-muted">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monto de la cuota</span>
                    <span className="font-semibold">
                      Bs. {cuotaSeleccionada.monto_cuota.toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fecha de pago</span>
                    <span>
                      {new Date(cuotaSeleccionada.fecha_pagar).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodo-pago">Método de Pago *</Label>
                <Select value={metodoPagoSeleccionado} onValueChange={setMetodoPagoSeleccionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    {metodosPago.map((metodo) => {
                      let label = metodo.tipo_metodo_pago
                      if (metodo.tipo_metodo_pago === 'milla') {
                        label = `Millas (${metodo.cantidad_millas?.toLocaleString("es-VE") || 0} disponibles)`
                      } else if (metodo.numero_tarjeta) {
                        label += ` • ${String(metodo.numero_tarjeta).slice(-4)}`
                      } else if (metodo.numero_referencia) {
                        label += ` • Ref: ${String(metodo.numero_referencia).slice(-4)}`
                      } else if (metodo.numero_cheque) {
                        label += ` • Cheque: ${metodo.numero_cheque}`
                      }
                      return (
                        <SelectItem key={metodo.id_metodo_pago} value={metodo.id_metodo_pago.toString()}>
                          {label}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {metodosPago.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tienes métodos de pago registrados. Agrega uno desde tu perfil.
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPagarDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handlePagarCuota}
              disabled={pagando || !metodoPagoSeleccionado || metodosPago.length === 0}
              className="bg-[#E91E63] hover:bg-[#E91E63]/90"
            >
              {pagando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Confirmar Pago
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
