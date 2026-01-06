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

interface Cancellation {
  id: string
  bookingId: string
  customerName: string
  service: string
  amount: number
  penalty: number
  refund: number
  status: "pending" | "approved" | "rejected"
  requestDate: string
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
  const [updatingClaim, setUpdatingClaim] = useState<number | null>(null)

  // Cancelaciones hardcodeadas (no hay API aún)
  const cancellations: Cancellation[] = [
    {
      id: "1",
      bookingId: "BK-2025-001",
      customerName: "Juan Pérez",
      service: "Paquete Caribe 7 noches",
      amount: 1299,
      penalty: 129.9,
      refund: 1169.1,
      status: "pending",
      requestDate: "2025-02-10",
    },
    {
      id: "2",
      bookingId: "BK-2025-045",
      customerName: "María González",
      service: "Vuelo CCS-MIA",
      amount: 450,
      penalty: 45,
      refund: 405,
      status: "approved",
      requestDate: "2025-02-09",
    },
  ]

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      await Promise.all([loadClaims(), loadSurveys(), loadEstados()])
    } catch (err) {
      console.error("Error cargando datos:", err)
      toast.error("Error", {
        description: "No se pudieron cargar los datos",
      })
    } finally {
      setLoading(false)
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

          {/* Cancellations Tab */}
          <TabsContent value="cancellations" className="space-y-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID de reserva o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Reserva</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Penalización (10%)</TableHead>
                    <TableHead>Reembolso (90%)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cancellations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No hay cancelaciones pendientes
                      </TableCell>
                    </TableRow>
                  ) : (
                    cancellations.map((cancel) => (
                      <TableRow key={cancel.id}>
                        <TableCell className="font-medium">{cancel.bookingId}</TableCell>
                        <TableCell>{cancel.customerName}</TableCell>
                        <TableCell className="text-sm">{cancel.service}</TableCell>
                        <TableCell className="font-medium">${cancel.amount}</TableCell>
                        <TableCell className="text-red-600">${cancel.penalty.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600 font-medium">${cancel.refund.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              cancel.status === "approved"
                                ? "default"
                                : cancel.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              cancel.status === "approved" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""
                            }
                          >
                            {cancel.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {cancel.status === "approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {cancel.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                            {cancel.status === "pending"
                              ? "Pendiente"
                              : cancel.status === "approved"
                                ? "Aprobada"
                                : "Rechazada"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                              <XCircle className="h-4 w-4 mr-1" />
                              Rechazar
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
