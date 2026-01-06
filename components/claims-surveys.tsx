"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquare, Star, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react"

type TipoReclamo = {
  id: number
  descripcion: string
}

type Reclamo = {
  id: number
  comentario: string
  fk_itinerario: number
  tipo_reclamo: string
  estado: string
  fecha_inicio: string
  fecha_final: string | null
  nombre_servicio: string
}

type Reseña = {
  id: number
  calificacion_resena: number
  comentario: string
  fk_itinerario: number
  nombre_servicio: string
  fecha_inicio: string
}

export function ClaimsSurveys() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tiposReclamo, setTiposReclamo] = useState<TipoReclamo[]>([])
  const [reclamos, setReclamos] = useState<Reclamo[]>([])
  const [reseñas, setReseñas] = useState<Reseña[]>([])
  
  // Estados para nuevo reclamo
  const [showReclamoDialog, setShowReclamoDialog] = useState(false)
  const [idItinerarioReclamo, setIdItinerarioReclamo] = useState<number | null>(null)
  const [idTipoReclamo, setIdTipoReclamo] = useState("")
  const [comentarioReclamo, setComentarioReclamo] = useState("")
  const [creandoReclamo, setCreandoReclamo] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      await Promise.all([
        loadTiposReclamo(),
        loadReclamos(),
        loadReseñas(),
      ])
    } catch (err) {
      console.error("Error cargando datos:", err)
    } finally {
      setLoading(false)
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

  async function loadReclamos() {
    try {
      const r = await fetch("/api/cliente/reclamos", { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setReclamos(Array.isArray(data?.reclamos) ? data.reclamos : [])
      } else {
        if (r.status === 401 || r.status === 403) {
          router.push("/login?next=/reclamos")
          return
        }
      }
    } catch (err) {
      console.error("Error cargando reclamos:", err)
    }
  }

  async function loadReseñas() {
    try {
      const r = await fetch("/api/cliente/resenas", { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setReseñas(Array.isArray(data?.reseñas) ? data.reseñas : [])
      } else {
        if (r.status === 401 || r.status === 403) {
          router.push("/login?next=/reclamos")
          return
        }
      }
    } catch (err) {
      console.error("Error cargando reseñas:", err)
    }
  }

  async function crearReclamo() {
    if (!idItinerarioReclamo) {
      toast.error("Error", {
        description: "Debes seleccionar un itinerario",
      })
      return
    }

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
          id_itinerario: idItinerarioReclamo,
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

      setShowReclamoDialog(false)
      setIdItinerarioReclamo(null)
      setIdTipoReclamo("")
      setComentarioReclamo("")
      await loadReclamos()
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudo crear el reclamo",
      })
    } finally {
      setCreandoReclamo(false)
    }
  }

  function getEstadoBadge(estado: string) {
    const estadoLower = estado.toLowerCase()
    if (estadoLower.includes("resuelto") || estadoLower.includes("resuelta")) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Resuelto
        </Badge>
      )
    }
    if (estadoLower.includes("proceso") || estadoLower.includes("procesando")) {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
          <Clock className="h-3 w-3 mr-1" />
          En Proceso
        </Badge>
      )
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
        <AlertCircle className="h-3 w-3 mr-1" />
        {estado}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#E91E63]" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="claims" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="claims">Reclamos</TabsTrigger>
        <TabsTrigger value="surveys">Mis Reseñas</TabsTrigger>
      </TabsList>

      {/* Claims Tab */}
      <TabsContent value="claims" className="space-y-6">
        {/* New Claim Form */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Abrir Nuevo Reclamo
            </CardTitle>
            <CardDescription className="text-white/90">
              Describe tu problema y te ayudaremos a resolverlo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claim-type">Tipo de Problema</Label>
              <Select value={idTipoReclamo} onValueChange={setIdTipoReclamo}>
                <SelectTrigger id="claim-type">
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
              <Label htmlFor="claim-description">Descripción Detallada</Label>
              <Textarea
                id="claim-description"
                placeholder="Describe tu problema con el mayor detalle posible..."
                value={comentarioReclamo}
                onChange={(e) => setComentarioReclamo(e.target.value)}
                rows={5}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Nota:</strong> Para crear un reclamo, debes seleccionar el itinerario desde la página{" "}
                <a href="/mis-viajes" className="underline font-semibold">
                  Mis Viajes
                </a>
                . Allí encontrarás la opción para crear un reclamo sobre un servicio específico.
              </p>
            </div>

            <Button
              className="w-full bg-[#E91E63] hover:bg-[#E91E63]/90"
              size="lg"
              onClick={() => router.push("/mis-viajes")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Ir a Mis Viajes
            </Button>
          </CardContent>
        </Card>

        {/* Claims List */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Reclamos</CardTitle>
            <CardDescription>Seguimiento de tus reclamos abiertos y resueltos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reclamos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No tienes reclamos registrados
              </p>
            ) : (
              reclamos.map((reclamo) => (
                <div key={reclamo.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{reclamo.tipo_reclamo}</Badge>
                        {getEstadoBadge(reclamo.estado)}
                      </div>
                      <p className="font-semibold">{reclamo.nombre_servicio}</p>
                      <p className="text-sm text-muted-foreground mt-1">{reclamo.comentario}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Caso #{reclamo.id} • {new Date(reclamo.fecha_inicio).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Surveys Tab */}
      <TabsContent value="surveys" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mis Reseñas</CardTitle>
            <CardDescription>Las reseñas que has publicado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reseñas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No has publicado ninguna reseña aún. Puedes calificar servicios desde{" "}
                <a href="/mis-viajes" className="text-[#E91E63] underline font-semibold">
                  Mis Viajes
                </a>
                .
              </p>
            ) : (
              reseñas.map((reseña) => (
                <div key={reseña.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{reseña.nombre_servicio}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(reseña.fecha_inicio).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= reseña.calificacion_resena
                              ? "fill-[#E91E63] text-[#E91E63]"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm mt-2">{reseña.comentario}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
