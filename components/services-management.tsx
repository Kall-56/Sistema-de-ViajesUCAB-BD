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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plane,
  Hotel,
  Ship,
  MapPinned,
  Car,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react"

type ServiceType = "flight" | "hotel" | "cruise" | "tour" | "transfer"

type Lugar = {
  id: number;
  nombre: string;
};

type AerolineaRow = {
  id: number;
  nombre: string;
  descripcion: string;
  costo_servicio?: number;
  denominacion?: string;
  millas_otorgadas?: number;
  lugar_nombre?: string;
  nombre_proveedor?: string;
  tipo_avion?: string;
  numero_cupo?: number;
  costo_compensacion?: number;
};

type AerolineaDetalle = {
  nombre: string;
  descripcion: string;
  costo_servicio: number;
  costo_compensacion: number;
  denominacion: string;
  millas_otorgadas: number;
  id_lugar: number;
  id_proveedor: number;
  tipo_avion: string;
  cupo: number;
  nombre_terminal: string;
  lugar_terminal: number;
  links_imagenes: string[];
};

function parseLinks(text: string): string[] {
  return text
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ServicesManagement() {
  const [activeServiceType, setActiveServiceType] = useState<ServiceType>("flight")
  const [view, setView] = useState<"list" | "create" | "edit">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)

  // Estados para datos reales
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aerolineas, setAerolineas] = useState<AerolineaRow[]>([])
  const [lugares, setLugares] = useState<Lugar[]>([])
  const [loadingLugares, setLoadingLugares] = useState(false)

  // Estados para editar
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editData, setEditData] = useState<AerolineaDetalle | null>(null)
  const [editLinksTxt, setEditLinksTxt] = useState("")

  // Cargar aerolíneas
  async function fetchAerolineas() {
    if (activeServiceType !== "flight") return;
    
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/admin/aerolineas", { cache: "no-store" })
      const data = await r.json()

      if (!r.ok) throw new Error(data?.error ?? "Error listando aerolíneas")
      setAerolineas(Array.isArray(data?.aerolineas) ? data.aerolineas : [])
    } catch (err: any) {
      setError(err?.message ?? "Error")
      setAerolineas([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar lugares
  async function fetchLugares() {
    setLoadingLugares(true)
    try {
      const r = await fetch("/api/lugares", { cache: "no-store" })
      if (!r.ok) throw new Error("Error cargando lugares")
      const data = await r.json()
      setLugares(Array.isArray(data?.lugares) ? data.lugares : [])
    } catch (err: any) {
      setError(err?.message ?? "Error cargando lugares")
    } finally {
      setLoadingLugares(false)
    }
  }

  useEffect(() => {
    if (activeServiceType === "flight") {
      fetchAerolineas()
    }
  }, [activeServiceType])

  useEffect(() => {
    fetchLugares()
  }, [])

  // Filtrar aerolíneas
  const filteredAerolineas = useMemo(() => {
    return aerolineas.filter((a) =>
      a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nombre_proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.lugar_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [aerolineas, searchTerm])

  // Abrir edición
  async function openEdit(id: number) {
    setError(null)
    setEditData(null)
    setEditLinksTxt("")
    setSelectedServiceId(id)
    setView("edit")

    try {
      const r = await fetch(`/api/admin/aerolineas/${id}`, { cache: "no-store" })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error cargando aerolínea")

      const detalle = data?.aerolinea as AerolineaDetalle
      if (!detalle) throw new Error("Respuesta inválida de detalle")

      setEditData(detalle)
      setEditLinksTxt(
        Array.isArray(detalle.links_imagenes)
          ? detalle.links_imagenes.join("\n")
          : ""
      )
    } catch (err: any) {
      setError(err?.message ?? "Error")
      setView("list")
    }
  }

  // Guardar edición
  async function onUpdate() {
    if (!selectedServiceId || !editData) return
    setEditSubmitting(true)
    setError(null)

    try {
      const payload = {
        ...editData,
        links_imagenes: parseLinks(editLinksTxt),
      }

      if (
        !payload.nombre ||
        !payload.descripcion ||
        payload.costo_servicio == null ||
        payload.costo_compensacion == null ||
        !payload.denominacion ||
        payload.millas_otorgadas == null ||
        !payload.id_lugar ||
        !payload.tipo_avion ||
        payload.cupo == null ||
        !payload.nombre_terminal ||
        !payload.lugar_terminal
      ) {
        throw new Error("Completa todos los campos requeridos antes de actualizar.")
      }

      const r = await fetch(`/api/admin/aerolineas/${selectedServiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error actualizando aerolínea")

      setView("list")
      setEditData(null)
      await fetchAerolineas()
    } catch (err: any) {
      setError(err?.message ?? "Error")
    } finally {
      setEditSubmitting(false)
    }
  }

  // Eliminar
  async function onDelete() {
    if (!selectedServiceId) return
    setError(null)
    try {
      const r = await fetch(`/api/admin/aerolineas/${selectedServiceId}`, { method: "DELETE" })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error eliminando aerolínea")
      setDeleteDialogOpen(false)
      setSelectedServiceId(null)
      await fetchAerolineas()
    } catch (err: any) {
      setError(err?.message ?? "Error")
    }
  }

  const getServiceIcon = (type: ServiceType) => {
    switch (type) {
      case "flight":
        return <Plane className="h-5 w-5 text-[#E91E63]" />
      case "hotel":
        return <Hotel className="h-5 w-5 text-[#E91E63]" />
      case "cruise":
        return <Ship className="h-5 w-5 text-[#E91E63]" />
      case "tour":
        return <MapPinned className="h-5 w-5 text-[#E91E63]" />
      case "transfer":
        return <Car className="h-5 w-5 text-[#E91E63]" />
    }
  }

  const getServiceTitle = (type: ServiceType) => {
    switch (type) {
      case "flight":
        return "Vuelos"
      case "hotel":
        return "Hoteles"
      case "cruise":
        return "Cruceros"
      case "tour":
        return "Tours y Actividades"
      case "transfer":
        return "Traslados"
    }
  }

  const renderServiceForm = () => {
    switch (activeServiceType) {
      case "flight":
        if (view === "edit" && editData) {
          return (
            <div className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              <Tabs defaultValue="basico" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basico">Información Básica</TabsTrigger>
                  <TabsTrigger value="vuelo">Detalles del Vuelo</TabsTrigger>
                  <TabsTrigger value="adicional">Información Adicional</TabsTrigger>
                </TabsList>

                <TabsContent value="basico" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="e_nombre">
                      Nombre del Servicio <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="e_nombre"
                      value={editData.nombre}
                      onChange={(ev) => setEditData({ ...editData, nombre: ev.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="e_descripcion">
                      Descripción <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="e_descripcion"
                      value={editData.descripcion}
                      onChange={(ev) => setEditData({ ...editData, descripcion: ev.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="e_destino">
                        Destino <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={String(editData.id_lugar)}
                        onValueChange={(val) => setEditData({ ...editData, id_lugar: Number(val) })}
                        disabled={loadingLugares}
                      >
                        <SelectTrigger id="e_destino">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {lugares.map((lugar) => (
                            <SelectItem key={lugar.id} value={String(lugar.id)}>
                              {lugar.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="e_denominacion">
                        Moneda <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={editData.denominacion}
                        onValueChange={(val) => setEditData({ ...editData, denominacion: val })}
                      >
                        <SelectTrigger id="e_denominacion">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - Dólar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="VES">VES - Bolívar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vuelo" className="space-y-4 mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="e_costoServicio">
                        Costo del Servicio <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="e_costoServicio"
                        type="number"
                        value={editData.costo_servicio}
                        onChange={(ev) => setEditData({ ...editData, costo_servicio: Number(ev.target.value) })}
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="e_costoCompensacion">
                        Costo de Compensación <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="e_costoCompensacion"
                        type="number"
                        value={editData.costo_compensacion}
                        onChange={(ev) => setEditData({ ...editData, costo_compensacion: Number(ev.target.value) })}
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="e_millas">
                        Millas Otorgadas <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="e_millas"
                        type="number"
                        value={editData.millas_otorgadas}
                        onChange={(ev) => setEditData({ ...editData, millas_otorgadas: Number(ev.target.value) })}
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="e_cupo">
                        Capacidad (Cupos) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="e_cupo"
                        type="number"
                        value={editData.cupo}
                        onChange={(ev) => setEditData({ ...editData, cupo: Number(ev.target.value) })}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="e_tipoAvion">
                      Tipo de Aeronave <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="e_tipoAvion"
                      value={editData.tipo_avion}
                      onChange={(ev) => setEditData({ ...editData, tipo_avion: ev.target.value })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="adicional" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="e_nombreTerminal">
                      Nombre de la Terminal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="e_nombreTerminal"
                      value={editData.nombre_terminal}
                      onChange={(ev) => setEditData({ ...editData, nombre_terminal: ev.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="e_lugarTerminal">
                      Ubicación de la Terminal <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={String(editData.lugar_terminal)}
                      onValueChange={(val) => setEditData({ ...editData, lugar_terminal: Number(val) })}
                      disabled={loadingLugares}
                    >
                      <SelectTrigger id="e_lugarTerminal">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lugares.map((lugar) => (
                          <SelectItem key={lugar.id} value={String(lugar.id)}>
                            {lugar.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="e_linksTxt">Enlaces de Imágenes</Label>
                    <Textarea
                      id="e_linksTxt"
                      value={editLinksTxt}
                      onChange={(ev) => setEditLinksTxt(ev.target.value)}
                      rows={4}
                      placeholder="Pegue los enlaces separados por coma o línea nueva"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )
        }
        // Para crear (no implementado aún en admin)
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              La creación de servicios desde el admin está pendiente. Los proveedores crean los servicios.
            </p>
          </div>
        )
      case "hotel":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hotelName">Nombre del Hotel *</Label>
                <Input id="hotelName" placeholder="Hotel Caribe Paradise" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chain">Cadena Hotelera</Label>
                <Input id="chain" placeholder="Marriott" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input id="city" placeholder="Punta Cana" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stars">Categoría *</Label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Estrellas</SelectItem>
                    <SelectItem value="4">4 Estrellas</SelectItem>
                    <SelectItem value="5">5 Estrellas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="roomType">Tipo de Habitación *</Label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Estándar</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mealPlan">Plan de Alimentación *</Label>
                <Select defaultValue="all-inclusive">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room-only">Solo Habitación</SelectItem>
                    <SelectItem value="breakfast">Con Desayuno</SelectItem>
                    <SelectItem value="half-board">Media Pensión</SelectItem>
                    <SelectItem value="full-board">Pensión Completa</SelectItem>
                    <SelectItem value="all-inclusive">Todo Incluido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="rooms">Habitaciones Disponibles *</Label>
                <Input id="rooms" type="number" placeholder="50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerNight">Tarifa por Noche (USD) *</Label>
                <Input id="pricePerNight" type="number" placeholder="180" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minNights">Noches Mínimas</Label>
                <Input id="minNights" type="number" placeholder="3" />
              </div>
            </div>
          </div>
        )
      case "cruise":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cruiseLine">Naviera *</Label>
                <Input id="cruiseLine" placeholder="Royal Caribbean" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ship">Barco *</Label>
                <Input id="ship" placeholder="Symphony of the Seas" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="route">Ruta / Puertos *</Label>
              <Textarea id="route" placeholder="Miami - Cozumel - Gran Caimán - Jamaica - Miami" rows={2} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="departureDate">Fecha de Zarpe *</Label>
                <Input id="departureDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (noches) *</Label>
                <Input id="duration" type="number" placeholder="7" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cabinType">Tipo de Camarote *</Label>
                <Select defaultValue="interior">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interior">Interior</SelectItem>
                    <SelectItem value="oceanview">Vista al Mar</SelectItem>
                    <SelectItem value="balcony">Balcón</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cabins">Camarotes Disponibles *</Label>
                <Input id="cabins" type="number" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cruisePrice">Tarifa (USD) *</Label>
                <Input id="cruisePrice" type="number" placeholder="1200" />
              </div>
            </div>
          </div>
        )
      case "tour":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tourName">Nombre del Tour *</Label>
                <Input id="tourName" placeholder="City Tour París" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator">Operador *</Label>
                <Input id="operator" placeholder="Paris Tours Inc." />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tourDescription">Descripción *</Label>
              <Textarea id="tourDescription" placeholder="Recorrido por los principales monumentos..." rows={3} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="duration">Duración *</Label>
                <Input id="duration" placeholder="4 horas" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tourCapacity">Capacidad *</Label>
                <Input id="tourCapacity" type="number" placeholder="30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tourPrice">Precio (USD) *</Label>
                <Input id="tourPrice" type="number" placeholder="85" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="includes">Incluye</Label>
              <Textarea id="includes" placeholder="Guía en español, transporte, entradas..." rows={2} />
            </div>
          </div>
        )
      case "transfer":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transferType">Tipo de Traslado *</Label>
                <Select defaultValue="ground">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ground">Terrestre</SelectItem>
                    <SelectItem value="maritime">Marítimo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Tipo de Vehículo *</Label>
                <Select defaultValue="sedan">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedán</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transferOrigin">Origen *</Label>
                <Input id="transferOrigin" placeholder="Aeropuerto Internacional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferDestination">Destino *</Label>
                <Input id="transferDestination" placeholder="Hotel Caribe Paradise" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="transferCapacity">Capacidad *</Label>
                <Input id="transferCapacity" type="number" placeholder="4" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferPrice">Tarifa (USD) *</Label>
                <Input id="transferPrice" type="number" placeholder="45" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">Horario</Label>
                <Input id="schedule" placeholder="24/7" />
              </div>
            </div>
          </div>
        )
    }
  }

  if (view === "create" || view === "edit") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getServiceIcon(activeServiceType)}
                {view === "create" ? "Crear Nuevo Servicio" : "Editar Servicio"} - {getServiceTitle(activeServiceType)}
              </CardTitle>
              <CardDescription>
                {view === "create" ? "Complete los datos del nuevo servicio" : "Modifique los datos del servicio"}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setView("list")}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {view === "edit" && activeServiceType === "flight" && !editData ? (
            <div className="py-10 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Cargando detalle...
            </div>
          ) : (
            <form 
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                if (view === "edit" && activeServiceType === "flight") {
                  onUpdate()
                }
              }}
            >
              {renderServiceForm()}

              {view === "edit" && activeServiceType === "flight" && (
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="bg-[#E91E63] hover:bg-[#C2185B]"
                    disabled={editSubmitting}
                  >
                    {editSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Guardar Cambios
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setView("list")
                      setEditData(null)
                      setSelectedServiceId(null)
                    }}
                    disabled={editSubmitting}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
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
              {getServiceIcon(activeServiceType)}
              Gestión de Servicios
            </CardTitle>
            <CardDescription>
              {activeServiceType === "flight" 
                ? "Administrar servicios aéreos creados por proveedores"
                : "Vuelos, hoteles, cruceros, tours y traslados"}
            </CardDescription>
          </div>
          {activeServiceType === "flight" && (
            <Button 
              onClick={fetchAerolineas} 
              variant="outline"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Refrescar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeServiceType} onValueChange={(value) => setActiveServiceType(value as ServiceType)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="flight" className="gap-2">
              <Plane className="h-4 w-4" />
              Vuelos
            </TabsTrigger>
            <TabsTrigger value="hotel" className="gap-2">
              <Hotel className="h-4 w-4" />
              Hoteles
            </TabsTrigger>
            <TabsTrigger value="cruise" className="gap-2">
              <Ship className="h-4 w-4" />
              Cruceros
            </TabsTrigger>
            <TabsTrigger value="tour" className="gap-2">
              <MapPinned className="h-4 w-4" />
              Tours
            </TabsTrigger>
            <TabsTrigger value="transfer" className="gap-2">
              <Car className="h-4 w-4" />
              Traslados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flight" className="space-y-4 mt-6">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vuelos por nombre, proveedor o destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Table */}
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Cargando aerolíneas...
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Capacidad</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAerolineas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {aerolineas.length === 0 
                            ? "No hay servicios aéreos registrados"
                            : "No se encontraron servicios con ese criterio de búsqueda"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAerolineas.map((aerolinea) => (
                        <TableRow key={aerolinea.id}>
                          <TableCell className="font-medium">{aerolinea.nombre}</TableCell>
                          <TableCell>{aerolinea.nombre_proveedor || "N/A"}</TableCell>
                          <TableCell>{aerolinea.lugar_nombre || `Lugar #${aerolinea.id}`}</TableCell>
                          <TableCell>
                            {aerolinea.denominacion || "USD"} ${aerolinea.costo_servicio?.toLocaleString() || "0"}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {aerolinea.numero_cupo || 0} cupos
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => openEdit(aerolinea.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setSelectedServiceId(aerolinea.id)
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
                Mostrando {filteredAerolineas.length} de {aerolineas.length} servicios
              </p>
            </div>
          </TabsContent>

          {/* Otros tipos de servicios (placeholder) */}
          {activeServiceType !== "flight" && (
            <TabsContent value={activeServiceType} className="space-y-4 mt-6">
              <div className="py-10 text-center text-muted-foreground">
                Gestión de {getServiceTitle(activeServiceType).toLowerCase()} pendiente de implementar
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este servicio aéreo? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteDialogOpen(false)
              setSelectedServiceId(null)
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
