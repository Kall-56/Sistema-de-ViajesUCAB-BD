"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  HeadphonesIcon,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Reembolso {
  id_reembolso: number
  monto_reembolso: number
  fk_venta: number
  monto_original: number
  nombre_cliente: string
  ci_cliente: number
  estado_venta: string
  fecha_reembolso: string
  fecha_viaje: string | null
  penalizacion?: number
}

interface Claim {
  id: number
  id_venta: number
  nombre_cliente: string
  c_i: number
  tipo_reclamo: string
  id_tipo_reclamo: number
  comentario: string
  estado: string
  id_estado: number
  fecha_inicio: string
  fecha_final: string | null
  nombre_servicio: string
  fk_itinerario: number
}

interface Survey {
  id: number
  id_venta: number
  nombre_cliente: string
  c_i: number
  calificacion_resena: number
  comentario: string
  nombre_servicio: string
  fk_itinerario: number
}

interface Estado {
  id: number
  nombre: string
}

export function PostsaleManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("cancellations")
  const [claims, setClaims] = useState<Claim[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [reembolsos, setReembolsos] = useState<Reembolso[]>([])
  const [updatingClaim, setUpdatingClaim] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      await Promise.all([loadClaims(), loadSurveys(), loadEstados(), loadReembolsos()])
    } catch (err) {
      console.error("Error cargando datos:", err)
      toast.error("Error", {
        description: "No se pudieron cargar los datos",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadReembolsos() {
    try {
      const r = await fetch("/api/admin/reembolsos", { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setReembolsos(Array.isArray(data?.reembolsos) ? data.reembolsos : [])
      } else {
        if (r.status === 401 || r.status === 403) {
          router.push("/login?next=/admin")
          return
        }
        throw new Error(data?.error ?? "Error cargando reembolsos")
      }
    } catch (err: any) {
      console.error("Error cargando reembolsos:", err)
      toast.error("Error", {
        description: err?.message ?? "No se pudieron cargar los reembolsos",
      })
    }
  }

  async function loadClaims() {
    try {
      const r = await fetch("/api/admin/reclamos", { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setClaims(Array.isArray(data?.reclamos) ? data.reclamos : [])
      } else {
        if (r.status === 401 || r.status === 403) {
          router.push("/login?next=/admin")
          return
        }
        throw new Error(data?.error ?? "Error cargando reclamos")
      }
    } catch (err: any) {
      console.error("Error cargando reclamos:", err)
      toast.error("Error", {
        description: err?.message ?? "No se pudieron cargar los reclamos",
      })
    }
  }

  async function loadSurveys() {
    try {
      const r = await fetch("/api/admin/resenas", { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setSurveys(Array.isArray(data?.reseñas) ? data.reseñas : [])
      } else {
        if (r.status === 401 || r.status === 403) {
          router.push("/login?next=/admin")
          return
        }
        throw new Error(data?.error ?? "Error cargando reseñas")
      }
    } catch (err: any) {
      console.error("Error cargando reseñas:", err)
      toast.error("Error", {
        description: err?.message ?? "No se pudieron cargar las reseñas",
      })
    }
  }

  async function loadEstados() {
    try {
      const r = await fetch("/api/admin/estados", { cache: "no-store" })
      if (r.ok) {
        const data = await r.json()
        setEstados(Array.isArray(data?.estados) ? data.estados : [])
      }
    } catch (err) {
      console.error("Error cargando estados:", err)
      // Si no existe la API, usar estados comunes
      setEstados([
        { id: 8, nombre: "En Espera" },
        { id: 9, nombre: "En Proceso" },
        { id: 10, nombre: "Resuelto" },
        { id: 11, nombre: "Cerrado" },
      ])
    }
  }

  async function handleUpdateClaimStatus(claimId: number, newEstadoId: number) {
    setUpdatingClaim(claimId)
    try {
      const r = await fetch(`/api/admin/reclamos/${claimId}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estado: newEstadoId }),
      })

      const data = await r.json()
      if (!r.ok) {
        throw new Error(data?.error ?? "Error actualizando estado")
      }

      toast.success("Estado actualizado", {
        description: "El estado del reclamo ha sido actualizado exitosamente",
      })

      await loadClaims()
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudo actualizar el estado",
      })
    } finally {
      setUpdatingClaim(null)
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

  const filteredClaims = claims.filter(
    (claim) =>
      claim.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.comentario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.id_venta.toString().includes(searchTerm)
  )

  const filteredSurveys = surveys.filter(
    (survey) =>
      survey.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.comentario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.id_venta.toString().includes(searchTerm)
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#E91E63]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeadphonesIcon className="h-5 w-5 text-[#E91E63]" />
          Gestión Postventa
        </CardTitle>
        <CardDescription>Cancelaciones, reembolsos, reclamos y encuestas</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cancellations">Cancelaciones</TabsTrigger>
            <TabsTrigger value="claims">Reclamos</TabsTrigger>
            <TabsTrigger value="surveys">Encuestas</TabsTrigger>
          </TabsList>

          {/* Cancellations Tab - Solo listar reembolsos */}
          <TabsContent value="cancellations" className="space-y-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID de venta o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Venta</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto Original</TableHead>
                    <TableHead>Penalización</TableHead>
                    <TableHead>Monto Reembolsado</TableHead>
                    <TableHead>Fecha Reembolso</TableHead>
                    <TableHead>Fecha Viaje</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reembolsos.filter((r) =>
                    r.fk_venta.toString().includes(searchTerm) ||
                    r.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        {reembolsos.length === 0 ? "No hay reembolsos registrados" : "No se encontraron resultados"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    reembolsos
                      .filter((r) =>
                        r.fk_venta.toString().includes(searchTerm) ||
                        r.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((reembolso) => (
                        <TableRow key={reembolso.id_reembolso}>
                          <TableCell className="font-medium">#{reembolso.fk_venta}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{reembolso.nombre_cliente}</div>
                              <div className="text-xs text-muted-foreground">CI: {reembolso.ci_cliente}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            Bs. {Number(reembolso.monto_original).toLocaleString("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-green-600 font-medium">
                            Bs. {Number(reembolso.monto_reembolso).toLocaleString("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(reembolso.fecha_reembolso).toLocaleDateString("es-ES")}
                          </TableCell>
                          <TableCell className="text-sm">
                            {reembolso.fecha_viaje
                              ? new Date(reembolso.fecha_viaje).toLocaleDateString("es-ES")
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              reembolso.estado_venta === "Cancelado" 
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            }>
                              {reembolso.estado_venta === "Cancelado" ? (
                                <Clock className="h-3 w-3 mr-1" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              )}
                              {reembolso.estado_venta}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/venta/${reembolso.fk_venta}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims" className="space-y-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar reclamos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Venta</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {claims.length === 0 ? "No hay reclamos registrados" : "No se encontraron resultados"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClaims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-medium">#{claim.id_venta}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{claim.nombre_cliente}</div>
                            <div className="text-xs text-muted-foreground">CI: {claim.c_i}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{claim.tipo_reclamo}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{claim.comentario}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEstadoBadge(claim.estado)}
                            <Select
                              value={claim.id_estado.toString()}
                              onValueChange={(value) => handleUpdateClaimStatus(claim.id, Number.parseInt(value))}
                              disabled={updatingClaim === claim.id}
                            >
                              <SelectTrigger className="w-32 h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {estados.map((estado) => (
                                  <SelectItem key={estado.id} value={estado.id.toString()}>
                                    {estado.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(claim.fecha_inicio).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/venta/${claim.id_venta}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys" className="space-y-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar encuestas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid gap-4">
              {filteredSurveys.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {surveys.length === 0 ? "No hay reseñas registradas" : "No se encontraron resultados"}
                </div>
              ) : (
                filteredSurveys.map((survey) => (
                  <Card key={survey.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{survey.nombre_cliente}</p>
                          <p className="text-sm text-muted-foreground">
                            Venta #{survey.id_venta} • {survey.nombre_servicio}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= survey.calificacion_resena
                                  ? "fill-[#E91E63] text-[#E91E63]"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-2 font-semibold">{survey.calificacion_resena}/5</span>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{survey.comentario}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">CI: {survey.c_i}</p>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/venta/${survey.id_venta}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver venta
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {filteredSurveys.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Mostrando {filteredSurveys.length} reseñas</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
