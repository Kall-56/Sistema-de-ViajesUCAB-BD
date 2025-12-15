"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Trash2,
  Search,
  Calendar,
  MapPin,
  User,
  Package,
  Plane,
  Hotel,
  Ship,
  Car,
  Loader2,
  Filter,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type Itinerario = {
  id_itinerario: number
  id_servicio: number
  id_venta: number
  id_cliente: number
  nombre_cliente: string
  email_cliente: string
  nombre_servicio: string
  tipo_servicio: string
  lugar_nombre: string | null
  nombre_proveedor: string | null
  fecha_hora_inicio: string
  costo_especial: number | null
  costo_servicio: number
  costo_unitario_bs: number
  denominacion: string
  estado_venta: string | null
  monto_total: number
  monto_compensacion: number
}

export function ItinerariesManagement() {
  const [itinerarios, setItinerarios] = useState<Itinerario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterServicio, setFilterServicio] = useState<string>("")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [filterTipo, setFilterTipo] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itinerarioToDelete, setItinerarioToDelete] = useState<Itinerario | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    loadItinerarios()
  }, [filterServicio, filterEstado, filterTipo])

  async function loadItinerarios() {
    setLoading(true)
    setError(null)
    try {
      let url = "/api/admin/itinerarios"
      const params = new URLSearchParams()
      
      if (filterServicio) {
        params.append("servicio_id", filterServicio)
      }
      if (filterEstado && filterEstado !== "all") {
        // El estado viene de la venta, no del itinerario directamente
        // Por ahora no filtramos por estado en la API
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const r = await fetch(url, { cache: "no-store" })
      const data = await r.json()
      
      if (!r.ok) {
        const errorMsg = data?.error ?? "Error cargando itinerarios"
        console.error("Error en API de itinerarios:", errorMsg, data)
        setError(errorMsg)
        toast.error("Error cargando itinerarios", {
          description: errorMsg,
          duration: 5000,
        })
        setItinerarios([])
        return
      }
      
      if (!Array.isArray(data?.itinerarios)) {
        console.error("Respuesta de API no tiene formato esperado:", data)
        const errorMsg = "La respuesta del servidor no tiene el formato esperado"
        setError(errorMsg)
        toast.error("Error en formato de datos", {
          description: errorMsg,
          duration: 5000,
        })
        setItinerarios([])
        return
      }
      
      setItinerarios(data.itinerarios)
      setError(null)
    } catch (err: any) {
      console.error("Error cargando itinerarios:", err)
      const errorMsg = err?.message ?? "No se pudieron cargar los itinerarios. Verifica tu conexión y permisos."
      setError(errorMsg)
      toast.error("Error cargando itinerarios", {
        description: errorMsg,
        duration: 5000,
      })
      setItinerarios([])
    } finally {
      setLoading(false)
    }
  }

  const filteredItinerarios = useMemo(() => {
    let filtered = itinerarios

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (i) =>
          i.nombre_servicio.toLowerCase().includes(term) ||
          i.nombre_cliente.toLowerCase().includes(term) ||
          i.email_cliente.toLowerCase().includes(term) ||
          i.lugar_nombre?.toLowerCase().includes(term) ||
          String(i.id_itinerario).includes(term) ||
          String(i.id_venta).includes(term)
      )
    }

    // Filtro por tipo de servicio
    if (filterTipo !== "all") {
      filtered = filtered.filter((i) => i.tipo_servicio === filterTipo)
    }

    // Filtro por estado
    if (filterEstado !== "all") {
      filtered = filtered.filter((i) => i.estado_venta === filterEstado)
    }

    return filtered
  }, [itinerarios, searchTerm, filterTipo, filterEstado])

  // Paginación
  const totalPages = Math.ceil(filteredItinerarios.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItinerarios = filteredItinerarios.slice(startIndex, endIndex)

  function getTypeIcon(tipo: string) {
    switch (tipo) {
      case "aereo":
        return <Plane className="h-4 w-4" />
      case "hotel":
        return <Hotel className="h-4 w-4" />
      case "maritimo":
        return <Ship className="h-4 w-4" />
      case "terrestre":
        return <Car className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  function getTypeLabel(tipo: string) {
    const labels: Record<string, string> = {
      aereo: "Aéreo",
      hotel: "Hotel",
      maritimo: "Crucero",
      terrestre: "Terrestre",
      restaurante: "Restaurante",
    }
    return labels[tipo] || tipo
  }

  function getEstadoBadge(estado: string | null) {
    if (!estado) return <Badge variant="outline">Sin estado</Badge>
    
    const estados: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pendiente: { variant: "secondary", label: "Pendiente" },
      confirmado: { variant: "default", label: "Confirmado" },
      cancelado: { variant: "destructive", label: "Cancelado" },
      completado: { variant: "default", label: "Completado" },
    }
    
    const estadoInfo = estados[estado] || { variant: "outline" as const, label: estado }
    return <Badge variant={estadoInfo.variant}>{estadoInfo.label}</Badge>
  }

  async function handleDelete() {
    if (!itinerarioToDelete) return

    setDeleting(true)
    try {
      const r = await fetch(`/api/admin/itinerarios/${itinerarioToDelete.id_itinerario}`, {
        method: "DELETE",
      })

      const data = await r.json()
      if (!r.ok) {
        throw new Error(data?.error ?? "Error eliminando itinerario")
      }

      toast.success("Itinerario eliminado correctamente")
      setDeleteDialogOpen(false)
      setItinerarioToDelete(null)
      await loadItinerarios()
    } catch (err: any) {
      toast.error(err?.message ?? "Error eliminando itinerario")
    } finally {
      setDeleting(false)
    }
  }

  function clearFilters() {
    setSearchTerm("")
    setFilterServicio("")
    setFilterEstado("all")
    setFilterTipo("all")
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gestión de Itinerarios
          </CardTitle>
          <CardDescription>
            Administra todos los itinerarios del sistema. Puedes filtrar por servicio, tipo, estado y cliente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por servicio, cliente, email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Tipo de Servicio</Label>
              <Select value={filterTipo} onValueChange={(v) => { setFilterTipo(v); setCurrentPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="aereo">Aéreo</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="maritimo">Crucero</SelectItem>
                  <SelectItem value="terrestre">Terrestre</SelectItem>
                  <SelectItem value="restaurante">Restaurante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estado de Venta</Label>
              <Select value={filterEstado} onValueChange={(v) => { setFilterEstado(v); setCurrentPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>

          {/* Filtro por servicio ID */}
          <div className="flex items-center gap-2">
            <Label htmlFor="servicio-filter">Filtrar por ID de Servicio:</Label>
            <Input
              id="servicio-filter"
              type="number"
              placeholder="ID del servicio"
              value={filterServicio}
              onChange={(e) => {
                setFilterServicio(e.target.value)
                setCurrentPage(1)
              }}
              className="w-32"
            />
            {filterServicio && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterServicio("")
                  setCurrentPage(1)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error al cargar itinerarios</span>
              </div>
              <p className="mt-2 text-sm text-destructive/80">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadItinerarios}
                className="mt-3"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          )}

          {/* Tabla */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#E91E63]" />
              <p className="mt-4 text-sm text-muted-foreground">Cargando itinerarios...</p>
            </div>
          ) : error ? null : paginatedItinerarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No se encontraron itinerarios</p>
              <p className="text-sm mt-2">
                {searchTerm || filterServicio || filterEstado !== "all" || filterTipo !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Aún no hay itinerarios registrados en el sistema"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha Inicio</TableHead>
                      <TableHead>Precio (Bs.)</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Venta ID</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItinerarios.map((it) => (
                      <TableRow key={it.id_itinerario}>
                        <TableCell className="font-medium">{it.id_itinerario}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{it.nombre_cliente}</span>
                            <span className="text-xs text-muted-foreground">{it.email_cliente}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{it.nombre_servicio}</span>
                            {it.lugar_nombre && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {it.lugar_nombre}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            {getTypeIcon(it.tipo_servicio)}
                            {getTypeLabel(it.tipo_servicio)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(it.fecha_hora_inicio).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              Bs. {it.costo_unitario_bs.toLocaleString("es-VE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            {it.costo_especial && (
                              <span className="text-xs text-muted-foreground line-through">
                                Bs. {it.costo_servicio.toLocaleString("es-VE")}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getEstadoBadge(it.estado_venta)}</TableCell>
                        <TableCell className="font-mono text-sm">{it.id_venta}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setItinerarioToDelete(it)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredItinerarios.length)} de {filteredItinerarios.length} itinerarios
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page
                        if (totalPages <= 5) {
                          page = i + 1
                        } else if (currentPage <= 3) {
                          page = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i
                        } else {
                          page = currentPage - 2 + i
                        }
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar itinerario?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar el itinerario #{itinerarioToDelete?.id_itinerario} del servicio "{itinerarioToDelete?.nombre_servicio}" 
              del cliente {itinerarioToDelete?.nombre_cliente}.
              <br />
              <br />
              Esta acción no se puede deshacer. El monto de la venta será recalculado automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

