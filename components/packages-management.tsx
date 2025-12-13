"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { Package, Plus, Search, Edit, Trash2, ChevronLeft, Loader2, AlertCircle, X } from "lucide-react"

type PaqueteBD = {
  id_paquete: number;
  nombre_paquete: string;
  descripcion_paquete: string;
  tipo_paquete: string;
  ids_servicios: number[] | null;
  nombres_servicios: string[] | null;
  restricciones: string[] | null;
};

type Servicio = {
  id: number;
  nombre: string;
  tipo_servicio: string;
  lugar_nombre?: string;
  nombre_proveedor?: string;
};

export function PackagesManagement() {
  const [view, setView] = useState<"list" | "create" | "edit">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPaqueteId, setSelectedPaqueteId] = useState<number | null>(null)

  // Estados para datos reales
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paquetes, setPaquetes] = useState<PaqueteBD[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loadingServicios, setLoadingServicios] = useState(false)

  // Estados para crear/editar
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editData, setEditData] = useState<PaqueteBD | null>(null)

  // Formulario crear
  const [c_nombre, setCNombre] = useState("")
  const [c_descripcion, setCDescripcion] = useState("")
  const [c_tipoPaquete, setCTipoPaquete] = useState("")
  const [c_restricciones, setCRestricciones] = useState<string[]>([])
  const [c_restriccionTxt, setCRestriccionTxt] = useState("")
  const [c_idsServicios, setCIdsServicios] = useState<number[]>([])

  // Formulario editar
  const [e_nombre, setENombre] = useState("")
  const [e_descripcion, setEDescripcion] = useState("")
  const [e_tipoPaquete, setETipoPaquete] = useState("")
  const [e_restricciones, setERestricciones] = useState<string[]>([])
  const [e_restriccionTxt, setERestriccionTxt] = useState("")
  const [e_idsServicios, setEIdsServicios] = useState<number[]>([])

  // Cargar paquetes
  async function fetchPaquetes() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/admin/paquetes", { cache: "no-store" })
      const data = await r.json()

      if (!r.ok) throw new Error(data?.error ?? "Error listando paquetes")
      setPaquetes(Array.isArray(data?.paquetes) ? data.paquetes : [])
    } catch (err: any) {
      setError(err?.message ?? "Error")
      setPaquetes([])
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
    fetchPaquetes()
    fetchServicios()
  }, [])

  // Filtrar paquetes
  const filteredPaquetes = useMemo(() => {
    return paquetes.filter((p) => {
      const matchesSearch =
        p.nombre_paquete.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion_paquete?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tipo_paquete?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [paquetes, searchTerm])

  // Abrir edición
  async function openEdit(id: number) {
    setError(null)
    setEditData(null)
    setSelectedPaqueteId(id)
    setView("edit")

    try {
      const r = await fetch(`/api/admin/paquetes/${id}`, { cache: "no-store" })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error cargando paquete")

      const paquete = data?.paquete as PaqueteBD
      if (!paquete) throw new Error("Respuesta inválida")

      setEditData(paquete)
      setENombre(paquete.nombre_paquete)
      setEDescripcion(paquete.descripcion_paquete)
      setETipoPaquete(paquete.tipo_paquete)
      setERestricciones(paquete.restricciones || [])
      setEIdsServicios(paquete.ids_servicios || [])
    } catch (err: any) {
      setError(err?.message ?? "Error")
      setView("list")
    }
  }

  // Crear paquete
  async function onCreate() {
    setCreateSubmitting(true)
    setError(null)

    try {
      if (!c_nombre || !c_descripcion || !c_tipoPaquete) {
        throw new Error("Completa todos los campos requeridos")
      }

      if (c_idsServicios.length === 0) {
        throw new Error("Selecciona al menos un servicio")
      }

      const r = await fetch("/api/admin/paquetes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: c_nombre,
          descripcion: c_descripcion,
          tipo_paquete: c_tipoPaquete,
          restricciones: c_restricciones.length > 0 ? c_restricciones : null,
          ids_servicios: c_idsServicios,
        }),
      })

      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error creando paquete")

      setView("list")
      setCNombre("")
      setCDescripcion("")
      setCTipoPaquete("")
      setCRestricciones([])
      setCRestriccionTxt("")
      setCIdsServicios([])
      await fetchPaquetes()
    } catch (err: any) {
      setError(err?.message ?? "Error")
    } finally {
      setCreateSubmitting(false)
    }
  }

  // Guardar edición
  async function onUpdate() {
    if (!selectedPaqueteId || !editData) return
    setEditSubmitting(true)
    setError(null)

    try {
      if (!e_nombre || !e_descripcion || !e_tipoPaquete) {
        throw new Error("Completa todos los campos requeridos")
      }

      if (e_idsServicios.length === 0) {
        throw new Error("Selecciona al menos un servicio")
      }

      const r = await fetch(`/api/admin/paquetes/${selectedPaqueteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: e_nombre,
          descripcion: e_descripcion,
          tipo_paquete: e_tipoPaquete,
          restricciones: e_restricciones.length > 0 ? e_restricciones : null,
          ids_servicios: e_idsServicios,
        }),
      })

      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error actualizando paquete")

      setView("list")
      setEditData(null)
      setSelectedPaqueteId(null)
      await fetchPaquetes()
    } catch (err: any) {
      setError(err?.message ?? "Error")
    } finally {
      setEditSubmitting(false)
    }
  }

  // Eliminar
  async function onDelete() {
    if (!selectedPaqueteId) return
    setError(null)
    try {
      const r = await fetch(`/api/admin/paquetes/${selectedPaqueteId}`, { method: "DELETE" })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error eliminando paquete")
      setDeleteDialogOpen(false)
      setSelectedPaqueteId(null)
      await fetchPaquetes()
    } catch (err: any) {
      setError(err?.message ?? "Error")
    }
  }

  function addRestriccion(isEdit: boolean) {
    const txt = isEdit ? e_restriccionTxt : c_restriccionTxt
    if (!txt.trim()) return

    if (isEdit) {
      setERestricciones([...e_restricciones, txt.trim()])
      setERestriccionTxt("")
    } else {
      setCRestricciones([...c_restricciones, txt.trim()])
      setCRestriccionTxt("")
    }
  }

  function removeRestriccion(index: number, isEdit: boolean) {
    if (isEdit) {
      setERestricciones(e_restricciones.filter((_, i) => i !== index))
    } else {
      setCRestricciones(c_restricciones.filter((_, i) => i !== index))
    }
  }

  function toggleServicio(servicioId: number, isEdit: boolean) {
    if (isEdit) {
      if (e_idsServicios.includes(servicioId)) {
        setEIdsServicios(e_idsServicios.filter((id) => id !== servicioId))
      } else {
        setEIdsServicios([...e_idsServicios, servicioId])
      }
    } else {
      if (c_idsServicios.includes(servicioId)) {
        setCIdsServicios(c_idsServicios.filter((id) => id !== servicioId))
      } else {
        setCIdsServicios([...c_idsServicios, servicioId])
      }
    }
  }

  function resetCreateForm() {
    setCNombre("")
    setCDescripcion("")
    setCTipoPaquete("")
    setCRestricciones([])
    setCRestriccionTxt("")
    setCIdsServicios([])
  }

  if (view === "create") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#E91E63]" />
                Crear Nuevo Paquete
              </CardTitle>
              <CardDescription>
                Complete los datos del nuevo paquete turístico
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
              <Label htmlFor="c_tipoPaquete">
                Tipo de Paquete <span className="text-red-500">*</span>
              </Label>
              <Input
                id="c_tipoPaquete"
                value={c_tipoPaquete}
                onChange={(ev) => setCTipoPaquete(ev.target.value)}
                placeholder="Ej: Todo Incluido, Aventura, Cultural"
              />
              <p className="text-xs text-muted-foreground">
                El ID del paquete se generará automáticamente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c_nombre">
                Nombre del Paquete <span className="text-red-500">*</span>
              </Label>
              <Input
                id="c_nombre"
                value={c_nombre}
                onChange={(ev) => setCNombre(ev.target.value)}
                placeholder="Ej: Paquete Caribe Todo Incluido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c_descripcion">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="c_descripcion"
                value={c_descripcion}
                onChange={(ev) => setCDescripcion(ev.target.value)}
                placeholder="Descripción detallada del paquete..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Servicios del Paquete <span className="text-red-500">*</span>
              </Label>
              {loadingServicios ? (
                <div className="py-4 text-center text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Cargando servicios...
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {servicios.map((servicio) => (
                    <label
                      key={servicio.id}
                      className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={c_idsServicios.includes(servicio.id)}
                        onChange={() => toggleServicio(servicio.id, false)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{servicio.nombre}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {servicio.tipo_servicio} {servicio.lugar_nombre && `• ${servicio.lugar_nombre}`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Selecciona los servicios que incluirá este paquete ({c_idsServicios.length} seleccionados)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Restricciones (Opcional)</Label>
              <div className="flex gap-2">
                <Input
                  value={c_restriccionTxt}
                  onChange={(ev) => setCRestriccionTxt(ev.target.value)}
                  placeholder="Ej: Válido solo para mayores de 18 años"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addRestriccion(false)
                    }
                  }}
                />
                <Button type="button" onClick={() => addRestriccion(false)}>
                  Agregar
                </Button>
              </div>
              {c_restricciones.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {c_restricciones.map((rest, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {rest}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeRestriccion(idx, false)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
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
                Crear Paquete
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
                <Package className="h-5 w-5 text-[#E91E63]" />
                Editar Paquete
              </CardTitle>
              <CardDescription>
                Modifique los datos del paquete
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => {
              setView("list")
              setEditData(null)
              setSelectedPaqueteId(null)
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
              Cargando paquete...
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
                <Label className="text-sm font-semibold">ID del Paquete</Label>
                <p className="text-sm">{editData.id_paquete}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="e_tipoPaquete">
                  Tipo de Paquete <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="e_tipoPaquete"
                  value={e_tipoPaquete}
                  onChange={(ev) => setETipoPaquete(ev.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="e_nombre">
                  Nombre del Paquete <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="e_nombre"
                  value={e_nombre}
                  onChange={(ev) => setENombre(ev.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="e_descripcion">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="e_descripcion"
                  value={e_descripcion}
                  onChange={(ev) => setEDescripcion(ev.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Servicios del Paquete <span className="text-red-500">*</span>
                </Label>
                {loadingServicios ? (
                  <div className="py-4 text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Cargando servicios...
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                    {servicios.map((servicio) => (
                      <label
                        key={servicio.id}
                        className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={e_idsServicios.includes(servicio.id)}
                          onChange={() => toggleServicio(servicio.id, true)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{servicio.nombre}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {servicio.tipo_servicio} {servicio.lugar_nombre && `• ${servicio.lugar_nombre}`}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Selecciona los servicios que incluirá este paquete ({e_idsServicios.length} seleccionados)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Restricciones (Opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={e_restriccionTxt}
                    onChange={(ev) => setERestriccionTxt(ev.target.value)}
                    placeholder="Ej: Válido solo para mayores de 18 años"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addRestriccion(true)
                      }
                    }}
                  />
                  <Button type="button" onClick={() => addRestriccion(true)}>
                    Agregar
                  </Button>
                </div>
                {e_restricciones.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {e_restricciones.map((rest, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                        {rest}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeRestriccion(idx, true)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
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
                    setSelectedPaqueteId(null)
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
              <Package className="h-5 w-5 text-[#E91E63]" />
              Gestión de Paquetes Turísticos
            </CardTitle>
            <CardDescription>Crear, editar y gestionar paquetes combinados</CardDescription>
          </div>
          <Button onClick={() => setView("create")} className="bg-[#E91E63] hover:bg-[#C2185B]">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paquete
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

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, descripción o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={fetchPaquetes}
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
              Cargando paquetes...
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Servicios</TableHead>
                    <TableHead>Restricciones</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPaquetes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {paquetes.length === 0
                          ? "No hay paquetes registrados"
                          : "No se encontraron paquetes con ese criterio"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPaquetes.map((pkg) => (
                      <TableRow key={pkg.id_paquete}>
                        <TableCell className="font-medium">{pkg.id_paquete}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{pkg.nombre_paquete}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {pkg.descripcion_paquete}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{pkg.tipo_paquete}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {pkg.nombres_servicios?.slice(0, 2).map((nombre, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {nombre}
                              </Badge>
                            ))}
                            {pkg.nombres_servicios && pkg.nombres_servicios.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{pkg.nombres_servicios.length - 2}
                              </Badge>
                            )}
                            {(!pkg.nombres_servicios || pkg.nombres_servicios.length === 0) && (
                              <span className="text-xs text-muted-foreground">Sin servicios</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {pkg.restricciones && pkg.restricciones.length > 0 ? (
                            <Badge variant="secondary" className="text-xs">
                              {pkg.restricciones.length} restricción(es)
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin restricciones</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => openEdit(pkg.id_paquete)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedPaqueteId(pkg.id_paquete)
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
              Mostrando {filteredPaquetes.length} de {paquetes.length} paquetes
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
              ¿Estás seguro de que deseas eliminar este paquete? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteDialogOpen(false)
              setSelectedPaqueteId(null)
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
