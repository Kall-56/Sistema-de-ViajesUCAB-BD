"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  MapPin,
  Plane,
  Hotel,
  Ship,
  Car,
  Loader2,
  FileText,
  Ticket,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard } from "lucide-react"
import { CuotasCronograma } from "@/components/cuotas-cronograma"

type ItinerarioItem = {
  id_itinerario: number
  id_servicio: number
  nombre_servicio: string
  descripcion_servicio?: string
  costo_unitario_bs: number
  fecha_inicio: string
  tipo_servicio: string
  lugar_nombre?: string
}

type Pago = {
  id_pago: number
  monto: number
  fecha_hora: string
  denominacion: string
  metodo_pago: string
}

type PlanCuotas = {
  id_plan_cuotas: number
  tasa_interes: number
  total_cuotas: number
  cuotas_pagadas: number
  monto_total_financiado: number
  saldo_pendiente: number
}

type Compra = {
  id_venta: number
  monto_total: number
  monto_compensacion: number
  cantidad_items: number
  fecha_inicio_minima: string | null
  fecha_inicio_maxima: string | null
  estado: string
  fecha_estado: string
  items: ItinerarioItem[] | null
  pagos: Pago[] | null
  plan_cuotas: PlanCuotas | null
}

export function MisViajesList() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [compras, setCompras] = useState<Compra[]>([])
  const [reseñas, setReseñas] = useState<Map<number, any>>(new Map()) // Map<id_itinerario, reseña>
  const [tiposReclamo, setTiposReclamo] = useState<any[]>([])
  const [showReseñaDialog, setShowReseñaDialog] = useState<number | null>(null)
  const [showReclamoDialog, setShowReclamoDialog] = useState<number | null>(null)
  const [calificacion, setCalificacion] = useState(0)
  const [comentarioReseña, setComentarioReseña] = useState("")
  const [creandoReseña, setCreandoReseña] = useState(false)
  const [idTipoReclamo, setIdTipoReclamo] = useState("")
  const [comentarioReclamo, setComentarioReclamo] = useState("")
  const [creandoReclamo, setCreandoReclamo] = useState(false)

  useEffect(() => {
    loadCompras()
    loadReseñas()
    loadTiposReclamo()
  }, [])

  async function loadCompras() {
    setLoading(true)
    try {
      const r = await fetch("/api/cliente/mis-viajes", { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setCompras(Array.isArray(data?.compras) ? data.compras : [])
      } else {
        if (r.status === 401 || r.status === 403) {
          router.push("/login?next=/mis-viajes")
          return
        }
        throw new Error(data?.error ?? "Error cargando compras")
      }
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudieron cargar tus compras",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadReseñas() {
    try {
      const r = await fetch("/api/cliente/resenas", { cache: "no-store" })
      const data = await r.json()
      if (r.ok && Array.isArray(data?.reseñas)) {
        const reseñasMap = new Map()
        data.reseñas.forEach((res: any) => {
          reseñasMap.set(res.fk_itinerario, res)
        })
        setReseñas(reseñasMap)
      }
    } catch (err: any) {
      console.error("Error cargando reseñas:", err)
    }
  }

  async function loadTiposReclamo() {
    try {
      const r = await fetch("/api/cliente/reclamos/tipos", { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setTiposReclamo(Array.isArray(data?.tipos) ? data.tipos : [])
      }
    } catch (err) {
      console.error("Error cargando tipos de reclamo:", err)
    }
  }

  async function crearReseña(idItinerario: number) {
    if (calificacion === 0) {
      toast.error("Calificación requerida", {
        description: "Debes seleccionar una calificación",
      })
      return
    }

    if (!comentarioReseña.trim()) {
      toast.error("Comentario requerido", {
        description: "Debes escribir un comentario",
      })
      return
    }

    setCreandoReseña(true)
    try {
      const r = await fetch("/api/cliente/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_itinerario: idItinerario,
          calificacion_resena: calificacion,
          comentario: comentarioReseña,
        }),
      })

      const data = await r.json()
      if (!r.ok) {
        throw new Error(data?.error ?? "Error creando reseña")
      }

      toast.success("Reseña creada", {
        description: "Tu reseña ha sido publicada exitosamente",
      })

      setShowReseñaDialog(null)
      setCalificacion(0)
      setComentarioReseña("")
      await loadReseñas()
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudo crear la reseña",
      })
    } finally {
      setCreandoReseña(false)
    }
  }

  async function crearReclamo(idItinerario: number) {
    if (!idTipoReclamo) {
      toast.error("Tipo de reclamo requerido", {
        description: "Selecciona el tipo de problema",
      })
      return
    }

    if (!comentarioReclamo.trim()) {
      toast.error("Comentario requerido", {
        description: "Describe el problema",
      })
      return
    }

    setCreandoReclamo(true)
    try {
      const r = await fetch("/api/cliente/reclamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_itinerario: idItinerario,
          id_tipo_reclamo: Number.parseInt(idTipoReclamo),
          comentario: comentarioReclamo,
        }),
      })

      const data = await r.json()
      if (!r.ok) {
        throw new Error(data?.error ?? "Error creando reclamo")
      }

      toast.success("Reclamo creado", {
        description: "Tu reclamo ha sido registrado. Te contactaremos pronto.",
      })

      setShowReclamoDialog(null)
      setIdTipoReclamo("")
      setComentarioReclamo("")
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudo crear el reclamo",
      })
    } finally {
      setCreandoReclamo(false)
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

  function getEstadoBadge(estado: string) {
    const estadoLower = estado.toLowerCase()
    if (estadoLower === "pagado") {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Pagado
        </Badge>
      )
    }
    if (estadoLower === "pendiente") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
          <Clock className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      )
    }
    if (estadoLower === "completado") {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completado
        </Badge>
      )
    }
    if (estadoLower === "cancelado") {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelado
        </Badge>
      )
    }
    return <Badge variant="secondary">{estado}</Badge>
  }

  function getMetodoPagoLabel(metodo: string) {
    const metodoLower = metodo.toLowerCase()
    if (metodoLower === "tarjeta") return "Tarjeta"
    if (metodoLower === "deposito") return "Depósito"
    if (metodoLower === "billetera") return "Billetera Digital"
    if (metodoLower === "cheque") return "Cheque"
    if (metodoLower === "cripto") return "Criptomoneda"
    return metodo
  }

  if (loading) {
    return (
      <div className="bg-muted/30 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#E91E63]" />
          <p className="text-muted-foreground">Cargando tus compras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-muted/30 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Mis Viajes</h1>
          <p className="text-white/90">Gestiona tus reservas y compras</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {compras.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">No tienes compras aún</h2>
              <p className="text-muted-foreground mb-6">
                Tus reservas y compras aparecerán aquí una vez que completes el pago
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
          <div className="space-y-6">
            {compras.map((compra) => (
              <Card key={compra.id_venta}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Reserva #{compra.id_venta}
                        {getEstadoBadge(compra.estado)}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {compra.cantidad_items} servicio{compra.cantidad_items !== 1 ? "s" : ""}
                        {compra.fecha_inicio_minima && (
                          <span className="ml-2">
                            • {new Date(compra.fecha_inicio_minima).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#E91E63]">
                        Bs. {compra.monto_total.toLocaleString("es-VE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(compra.fecha_estado).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items del itinerario */}
                  {compra.items && compra.items.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Servicios incluidos:</h4>
                      {compra.items.map((item) => (
                        <div
                          key={item.id_itinerario}
                          className="flex gap-4 p-3 rounded-lg border bg-card"
                        >
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#E91E63]/20 to-[#C2185B]/20 flex items-center justify-center shrink-0">
                            {getIcon(item.tipo_servicio)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h5 className="font-semibold">{item.nombre_servicio}</h5>
                              <span className="font-medium text-[#E91E63]">
                                Bs. {item.costo_unitario_bs.toLocaleString("es-VE", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            {item.lugar_nombre && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.lugar_nombre}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.fecha_inicio).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                            {/* Botones para reseña y reclamo si está pagado */}
                            {compra.estado.toLowerCase() === "pagado" && (
                              <div className="mt-2 flex gap-2">
                                {reseñas.has(item.id_itinerario) ? (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>Ya calificaste</span>
                                  </div>
                                ) : (
                                  <Dialog
                                    open={showReseñaDialog === item.id_itinerario}
                                    onOpenChange={(open) => {
                                      setShowReseñaDialog(open ? item.id_itinerario : null)
                                      if (!open) {
                                        setCalificacion(0)
                                        setComentarioReseña("")
                                      }
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="text-xs">
                                        <Star className="h-3 w-3 mr-1" />
                                        Calificar
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Calificar servicio</DialogTitle>
                                        <DialogDescription>
                                          Comparte tu experiencia con {item.nombre_servicio}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label>Calificación</Label>
                                          <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <button
                                                key={star}
                                                type="button"
                                                onClick={() => setCalificacion(star)}
                                                className="transition-transform hover:scale-110"
                                              >
                                                <Star
                                                  className={`h-8 w-8 ${
                                                    star <= calificacion
                                                      ? "fill-[#E91E63] text-[#E91E63]"
                                                      : "text-muted-foreground"
                                                  }`}
                                                />
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Comentario</Label>
                                          <Textarea
                                            placeholder="Describe tu experiencia..."
                                            value={comentarioReseña}
                                            onChange={(e) => setComentarioReseña(e.target.value)}
                                            rows={4}
                                          />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setShowReseñaDialog(null)
                                              setCalificacion(0)
                                              setComentarioReseña("")
                                            }}
                                          >
                                            Cancelar
                                          </Button>
                                          <Button
                                            onClick={() => crearReseña(item.id_itinerario)}
                                            disabled={creandoReseña}
                                            className="bg-[#E91E63] hover:bg-[#E91E63]/90"
                                          >
                                            {creandoReseña ? (
                                              <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Publicando...
                                              </>
                                            ) : (
                                              "Publicar reseña"
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                                
                                {/* Botón para reclamo */}
                                <Dialog
                                  open={showReclamoDialog === item.id_itinerario}
                                  onOpenChange={(open) => {
                                    setShowReclamoDialog(open ? item.id_itinerario : null)
                                    if (!open) {
                                      setIdTipoReclamo("")
                                      setComentarioReclamo("")
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-xs">
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      Reclamar
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Crear reclamo</DialogTitle>
                                      <DialogDescription>
                                        Reporta un problema con {item.nombre_servicio}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label>Tipo de problema</Label>
                                        <Select value={idTipoReclamo} onValueChange={setIdTipoReclamo}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el tipo de problema" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {tiposReclamo.map((tipo) => (
                                              <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                                {tipo.descripcion}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Descripción del problema</Label>
                                        <Textarea
                                          placeholder="Describe el problema con el mayor detalle posible..."
                                          value={comentarioReclamo}
                                          onChange={(e) => setComentarioReclamo(e.target.value)}
                                          rows={4}
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            setShowReclamoDialog(null)
                                            setIdTipoReclamo("")
                                            setComentarioReclamo("")
                                          }}
                                        >
                                          Cancelar
                                        </Button>
                                        <Button
                                          onClick={() => crearReclamo(item.id_itinerario)}
                                          disabled={creandoReclamo}
                                          className="bg-[#E91E63] hover:bg-[#E91E63]/90"
                                        >
                                          {creandoReclamo ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Enviando...
                                            </>
                                          ) : (
                                            "Enviar reclamo"
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator />

                  {/* Información de pagos */}
                  {compra.pagos && compra.pagos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Pagos realizados:</h4>
                      {compra.pagos.map((pago) => (
                        <div
                          key={pago.id_pago}
                          className="flex items-center justify-between p-2 rounded bg-muted"
                        >
                          <div>
                            <span className="font-medium">
                              {getMetodoPagoLabel(pago.metodo_pago)}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              • {new Date(pago.fecha_hora).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                          <span className="font-semibold">
                            {pago.denominacion === "VEN" ? "Bs." : pago.denominacion}{" "}
                            {pago.monto.toLocaleString("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Plan de cuotas */}
                  {compra.plan_cuotas && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Plan de Financiamiento</h4>
                          <Badge variant="secondary">
                            {compra.plan_cuotas.cuotas_pagadas} / {compra.plan_cuotas.total_cuotas} cuotas pagadas
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Tasa de interés</p>
                            <p className="font-semibold">{compra.plan_cuotas.tasa_interes}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Saldo pendiente</p>
                            <p className="font-semibold text-[#E91E63]">
                              Bs. {compra.plan_cuotas.saldo_pendiente.toLocaleString("es-VE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                        <CuotasCronograma idVenta={compra.id_venta} />
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Acciones */}
                  <div className="flex gap-2">
                    {compra.estado.toLowerCase() === "pagado" && (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/factura/${compra.id_venta}`}>
                            <FileText className="h-4 w-4 mr-2" />
                            Ver factura
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/ticket/${compra.id_venta}`}>
                            <Ticket className="h-4 w-4 mr-2" />
                            Ver ticket
                          </Link>
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/venta/${compra.id_venta}`}>
                        Ver detalles
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

