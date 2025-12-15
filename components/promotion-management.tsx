"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tag, Plus, Edit, Trash2, Search, ChevronLeft, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"

type Servicio = {
  id: number;
  nombre: string;
  tipo_servicio: string;
  lugar_nombre?: string;
  nombre_proveedor?: string;
};

type Descuento = {
  id: number;
  porcentaje_descuento: number;
  fecha_vencimiento: string | null;
  fk_servicio: number;
  servicio_nombre: string;
  tipo_servicio: string;
  costo_servicio: number;
  denominacion: string;
  lugar_nombre?: string;
  nombre_proveedor?: string;
  activo: boolean;
};

export function PromotionManagement() {
  const [view, setView] = useState<"list" | "create" | "edit">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDescuentoId, setSelectedDescuentoId] = useState<number | null>(null)

  // Estados para datos reales
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [descuentos, setDescuentos] = useState<Descuento[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loadingServicios, setLoadingServicios] = useState(false)

  // Estados para crear/editar
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editData, setEditData] = useState<Descuento | null>(null)

  // Formulario crear
  const [c_fkServicio, setCFkServicio] = useState<string>("")
  const [c_porcentaje, setCPorcentaje] = useState<number | "">("")
  const [c_fechaVencimiento, setCFechaVencimiento] = useState<string>("")

  // Formulario editar
  const [e_porcentaje, setEPorcentaje] = useState<number | "">("")
  const [e_fechaVencimiento, setEFechaVencimiento] = useState<string>("")

  // Cargar descuentos
  async function fetchDescuentos() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/admin/descuentos", { cache: "no-store" })
      const data = await r.json()

      if (!r.ok) throw new Error(data?.error ?? "Error listando descuentos")
      setDescuentos(Array.isArray(data?.descuentos) ? data.descuentos : [])
    } catch (err: any) {
      setError(err?.message ?? "Error")
      setDescuentos([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar servicios
  async function fetchServicios() {
    setLoadingServicios(true)
    try {
      const r = await fetch("/api/admin/servicios", { cache: "no-store" })
      if (!r.ok) throw new Error("Error cargando servicios")
      const data = await r.json()
      setServicios(Array.isArray(data?.servicios) ? data.servicios : [])
    } catch (err: any) {
      setError(err?.message ?? "Error cargando servicios")
    } finally {
      setLoadingServicios(false)
    }
  }

  useEffect(() => {
    fetchDescuentos()
    fetchServicios()
  }, [])

  // Filtrar descuentos
  const filteredDescuentos = useMemo(() => {
    return descuentos.filter((d) => {
      const matchesSearch =
        d.servicio_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.nombre_proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.lugar_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && d.activo) ||
        (statusFilter === "inactive" && !d.activo)
      
      return matchesSearch && matchesStatus
    })
  }, [descuentos, searchTerm, statusFilter])

  // Abrir edición
  async function openEdit(id: number) {
    setError(null)
    setEditData(null)
    setSelectedDescuentoId(id)
    setView("edit")

    try {
      const r = await fetch(`/api/admin/descuentos/${id}`, { cache: "no-store" })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error cargando descuento")

      const descuento = data?.descuento as Descuento
      if (!descuento) throw new Error("Respuesta inválida")

      setEditData(descuento)
      setEPorcentaje(descuento.porcentaje_descuento)
      setEFechaVencimiento(descuento.fecha_vencimiento ? descuento.fecha_vencimiento.split('T')[0] : "")
    } catch (err: any) {
      setError(err?.message ?? "Error")
      setView("list")
    }
  }

  // Crear descuento
  async function onCreate() {
    setCreateSubmitting(true)
    setError(null)

    try {
      const fkServicioN = Number(c_fkServicio)
      const porcentajeN = Number(c_porcentaje)
      const fechaVenc = c_fechaVencimiento || null

      if (!Number.isInteger(fkServicioN) || !Number.isFinite(porcentajeN)) {
        throw new Error("Selecciona un servicio e ingresa un porcentaje válido")
      }

      if (porcentajeN < 0 || porcentajeN > 100) {
        throw new Error("El porcentaje debe estar entre 0 y 100")
      }

      const r = await fetch("/api/admin/descuentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fk_servicio: fkServicioN,
          porcentaje: porcentajeN,
          fecha_vencimiento: fechaVenc,
        }),
      })

      const data = await r.json()
      if (!r.ok) {
        const errorMsg = data?.error ?? "Error creando descuento"
        toast.error("Error creando promoción", {
          description: errorMsg,
          duration: 5000,
        })
        throw new Error(errorMsg)
      }

      // Mostrar advertencia si existe
      if (data?.warning) {
        toast.warning("Promoción creada", {
          description: data.warning,
          duration: 4000,
        })
      } else {
        toast.success("Promoción creada", {
          description: "La promoción ha sido creada correctamente",
        })
      }

      setView("list")
      setCFkServicio("")
      setCPorcentaje("")
      setCFechaVencimiento("")
      await fetchDescuentos()
    } catch (err: any) {
      setError(err?.message ?? "Error")
    } finally {
      setCreateSubmitting(false)
    }
  }

  // Guardar edición
  async function onUpdate() {
    if (!selectedDescuentoId || !editData) return
    setEditSubmitting(true)
    setError(null)

    try {
      const porcentajeN = Number(e_porcentaje)
      const fechaVenc = e_fechaVencimiento || null

      if (!Number.isFinite(porcentajeN)) {
        throw new Error("Ingresa un porcentaje válido")
      }

      if (porcentajeN < 0 || porcentajeN > 100) {
        throw new Error("El porcentaje debe estar entre 0 y 100")
      }

      const r = await fetch(`/api/admin/descuentos/${selectedDescuentoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          porcentaje: porcentajeN,
          fecha_vencimiento: fechaVenc,
        }),
      })

      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error actualizando descuento")

      setView("list")
      setEditData(null)
      setSelectedDescuentoId(null)
      await fetchDescuentos()
    } catch (err: any) {
      setError(err?.message ?? "Error")
    } finally {
      setEditSubmitting(false)
    }
  }

  // Eliminar
  async function onDelete() {
    if (!selectedDescuentoId) return
    setError(null)
    try {
      const r = await fetch(`/api/admin/descuentos/${selectedDescuentoId}`, { method: "DELETE" })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error eliminando descuento")
      setDeleteDialogOpen(false)
      setSelectedDescuentoId(null)
      await fetchDescuentos()
    } catch (err: any) {
      setError(err?.message ?? "Error")
    }
  }

  function resetCreateForm() {
    setCFkServicio("")
    setCPorcentaje("")
    setCFechaVencimiento("")
  }

  if (view === "create") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#E91E63]" />
                Crear Nueva Promoción
              </CardTitle>
              <CardDescription>
                Asocie un descuento a un servicio específico
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => {
              setView("list")
              resetCreateForm()
            }}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form 
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              onCreate()
            }}
          >
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="c_servicio">
                Servicio <span className="text-red-500">*</span>
              </Label>
              <Select
                value={c_fkServicio}
                onValueChange={setCFkServicio}
                disabled={loadingServicios}
              >
                <SelectTrigger id="c_servicio">
                  <SelectValue placeholder="Seleccione un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {servicios.map((servicio) => (
                    <SelectItem key={servicio.id} value={String(servicio.id)}>
                      {servicio.nombre} - {servicio.tipo_servicio}
                      {servicio.lugar_nombre && ` (${servicio.lugar_nombre})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Seleccione el servicio al que aplicará el descuento
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="c_porcentaje">
                  Porcentaje de Descuento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="c_porcentaje"
                  type="number"
                  value={c_porcentaje}
                  onChange={(ev) =>
                    setCPorcentaje(ev.target.value === "" ? "" : Number(ev.target.value))
                  }
                  placeholder="30"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  Ingrese un valor entre 0 y 100
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="c_fechaVencimiento">
                  Fecha de Vencimiento (Opcional)
                </Label>
                <Input
                  id="c_fechaVencimiento"
                  type="date"
                  value={c_fechaVencimiento}
                  onChange={(ev) => setCFechaVencimiento(ev.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-muted-foreground">
                  Si no se especifica, la promoción no expira
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="bg-[#E91E63] hover:bg-[#C2185B]"
                disabled={createSubmitting}
              >
                {createSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Crear Promoción
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setView("list")
                  resetCreateForm()
                }}
                disabled={createSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (view === "edit") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#E91E63]" />
                Editar Promoción
              </CardTitle>
              <CardDescription>
                Modifique el descuento del servicio
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => {
              setView("list")
              setEditData(null)
              setSelectedDescuentoId(null)
            }}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!editData ? (
            <div className="py-10 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Cargando descuento...
            </div>
          ) : (
            <form 
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                onUpdate()
              }}
            >
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <Label className="text-sm font-semibold">Servicio Asociado</Label>
                <p className="text-sm">{editData.servicio_nombre}</p>
                <p className="text-xs text-muted-foreground">
                  Tipo: {editData.tipo_servicio} • Proveedor: {editData.nombre_proveedor || "N/A"}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="e_porcentaje">
                    Porcentaje de Descuento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="e_porcentaje"
                    type="number"
                    value={e_porcentaje}
                    onChange={(ev) =>
                      setEPorcentaje(ev.target.value === "" ? "" : Number(ev.target.value))
                    }
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="e_fechaVencimiento">
                    Fecha de Vencimiento (Opcional)
                  </Label>
                  <Input
                    id="e_fechaVencimiento"
                    type="date"
                    value={e_fechaVencimiento}
                    onChange={(ev) => setEFechaVencimiento(ev.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="bg-[#E91E63] hover:bg-[#C2185B]"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Edit className="h-4 w-4 mr-2" />
                  )}
                  Guardar Cambios
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setView("list")
                    setEditData(null)
                    setSelectedDescuentoId(null)
                  }}
                  disabled={editSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-[#E91E63]" />
              Gestión de Promociones
            </CardTitle>
            <CardDescription>Crear, editar y gestionar ofertas y descuentos</CardDescription>
          </div>
          <Button onClick={() => setView("create")} className="bg-[#E91E63] hover:bg-[#C2185B]">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Promoción
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por servicio, proveedor o destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={fetchDescuentos}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Refrescar
            </Button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Cargando promociones...
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDescuentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {descuentos.length === 0
                          ? "No hay promociones registradas"
                          : "No se encontraron promociones con ese criterio"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDescuentos.map((desc) => (
                      <TableRow key={desc.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{desc.servicio_nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              {desc.tipo_servicio} • {desc.lugar_nombre || "Sin destino"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-[#E91E63]">
                            {desc.porcentaje_descuento}% OFF
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {desc.fecha_vencimiento
                            ? new Date(desc.fecha_vencimiento).toLocaleDateString()
                            : "Sin vencimiento"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {desc.nombre_proveedor || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={desc.activo ? "default" : "secondary"}
                            className={desc.activo ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                          >
                            {desc.activo ? "Activa" : "Vencida"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => openEdit(desc.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedDescuentoId(desc.id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Info */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredDescuentos.length} de {descuentos.length} promociones
            </p>
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta promoción? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteDialogOpen(false)
              setSelectedDescuentoId(null)
            }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
