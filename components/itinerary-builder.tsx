"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Plane,
  Hotel,
  Ship,
  Car,
  MapPin,
  Calendar,
  Trash2,
  Save,
  Download,
  ArrowRight,
  DollarSign,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Search,
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type Servicio = {
  id: number;
  nombre: string;
  descripcion: string;
  costo_servicio: number;
  denominacion: string;
  millas_otorgadas: number;
  tipo_servicio: string;
  lugar_nombre: string | null;
  nombre_proveedor: string | null;
  imagen_principal: string | null;
};

type ItineraryItem = {
  id_itinerario: number;
  id_servicio: number;
  nombre_servicio: string;
  costo_unitario_usd?: number; // Mantener para compatibilidad
  costo_unitario_original?: number; // Precio original antes de conversión
  costo_unitario_bs?: number; // Precio convertido a Bs
  fecha_inicio: string;
  tipo_servicio: string;
  denominacion?: string; // Siempre 'VEN' para precios convertidos
  denominacion_original?: string; // Denominación original del servicio
};

type Venta = {
  id_venta: number;
  monto_total: number;
  monto_compensacion: number;
};

export function ItineraryBuilder({ ventaId }: { ventaId?: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [venta, setVenta] = useState<Venta | null>(null)
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loadingServicios, setLoadingServicios] = useState(false)
  const [searchServicio, setSearchServicio] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addingItem, setAddingItem] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tieneFechasPasadas, setTieneFechasPasadas] = useState(false)

  // Formulario para agregar servicio
  const [selectedServicioId, setSelectedServicioId] = useState<string>("")
  const [fechaInicio, setFechaInicio] = useState("")

  // Cargar venta específica o crear nueva
  useEffect(() => {
    async function initVenta() {
      setLoading(true)
      setError(null)
      try {
        if (ventaId) {
          // Cargar venta específica
          const r = await fetch(`/api/cliente/ventas/${ventaId}`, { cache: "no-store" })
          const data = await r.json()
          if (!r.ok) {
            if (r.status === 401 || r.status === 403) {
              router.push("/login?next=/itinerario")
              return
            }
            throw new Error(data?.error ?? "Error cargando itinerario")
          }
          setVenta(data.venta)
          setItems(Array.isArray(data?.items) ? data.items : [])
          verificarFechasPasadas(data.items)
        } else {
          // Redirigir a lista si no hay ventaId
          router.push("/itinerario")
          return
        }
      } catch (err: any) {
        setError(err?.message ?? "Error inicializando itinerario")
        if (err?.message?.includes("No autenticado") || err?.message?.includes("Cliente no identificado")) {
          router.push("/login?next=/itinerario")
        }
      } finally {
        setLoading(false)
      }
    }

    initVenta()
    loadServicios()
  }, [router, ventaId])

  function verificarFechasPasadas(items: ItineraryItem[]) {
    if (!items || items.length === 0) {
      setTieneFechasPasadas(false)
      return
    }
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const tienePasadas = items.some((item) => {
      if (!item.fecha_inicio) return false
      const fecha = new Date(item.fecha_inicio)
      fecha.setHours(0, 0, 0, 0)
      return fecha < hoy
    })
    setTieneFechasPasadas(tienePasadas)
  }

  async function loadServicios() {
    setLoadingServicios(true)
    try {
      const r = await fetch("/api/cliente/servicios", { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setServicios(Array.isArray(data?.servicios) ? data.servicios : [])
      }
    } catch (err) {
      console.error("Error cargando servicios:", err)
    } finally {
      setLoadingServicios(false)
    }
  }

  async function loadItinerario(idVenta: number) {
    try {
      const r = await fetch(`/api/cliente/ventas/${idVenta}`, { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        const itemsData = Array.isArray(data?.items) ? data.items : []
        setItems(itemsData)
        verificarFechasPasadas(itemsData)
        if (data?.venta) {
          setVenta(data.venta)
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Error cargando itinerario")
    }
  }

  async function agregarServicio() {
    if (!venta || !selectedServicioId || !fechaInicio) {
      setError("Completa todos los campos requeridos")
      return
    }

    // Validar que la fecha no sea pasada
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaInicioDate = new Date(fechaInicio)
    fechaInicioDate.setHours(0, 0, 0, 0)
    
    if (fechaInicioDate < hoy) {
      setError("La fecha de inicio no puede ser anterior a hoy")
      return
    }

    setAddingItem(true)
    setError(null)

    try {
      const r = await fetch("/api/cliente/itinerarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_venta: venta.id_venta,
          id_servicio: Number(selectedServicioId),
          fecha_inicio: fechaInicio,
        }),
      })

      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error agregando servicio")

      toast.success("Servicio agregado", {
        description: "El servicio ha sido agregado a tu itinerario",
      })

      setShowAddDialog(false)
      setSelectedServicioId("")
      setFechaInicio("")
      await loadItinerario(venta.id_venta)
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudo agregar el servicio",
      })
      setError(err?.message ?? "Error")
    } finally {
      setAddingItem(false)
    }
  }

  async function eliminarItem(idItinerario: number) {
    setError(null)
    try {
      const r = await fetch(`/api/cliente/itinerarios/${idItinerario}`, { method: "DELETE" })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error eliminando servicio")

      toast.success("Servicio eliminado", {
        description: "El servicio ha sido eliminado del itinerario",
      })

      if (venta) {
        await loadItinerario(venta.id_venta)
      }
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudo eliminar el servicio",
      })
      setError(err?.message ?? "Error")
    }
  }

  const serviciosFiltrados = useMemo(() => {
    if (!searchServicio) return servicios
    const search = searchServicio.toLowerCase()
    return servicios.filter(
      (s) =>
        s.nombre.toLowerCase().includes(search) ||
        s.descripcion?.toLowerCase().includes(search) ||
        s.lugar_nombre?.toLowerCase().includes(search) ||
        s.tipo_servicio.toLowerCase().includes(search)
    )
  }, [servicios, searchServicio])

  // Calcular total en Bs (usar costo_unitario_bs si existe, sino costo_unitario_usd como fallback)
  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      // Priorizar costo_unitario_bs (ya convertido a Bs), sino usar costo_unitario_usd como fallback
      const costo = Number(item.costo_unitario_bs || item.costo_unitario_usd || 0)
      return sum + costo
    }, 0)
  }, [items])

  const getIcon = (tipoServicio: string | null | undefined) => {
    if (!tipoServicio) return <MapPin className="h-5 w-5" />
    const tipo = tipoServicio.toLowerCase()
    if (tipo.includes("aereo") || tipo.includes("vuelo")) return <Plane className="h-5 w-5" />
    if (tipo.includes("hotel") || tipo.includes("hospedaje")) return <Hotel className="h-5 w-5" />
    if (tipo.includes("maritimo") || tipo.includes("crucero")) return <Ship className="h-5 w-5" />
    if (tipo.includes("terrestre") || tipo.includes("traslado")) return <Car className="h-5 w-5" />
    return <MapPin className="h-5 w-5" />
  }

  const getTypeLabel = (tipoServicio: string | null | undefined) => {
    if (!tipoServicio) return "Servicio"
    const tipo = tipoServicio.toLowerCase()
    if (tipo.includes("aereo")) return "Vuelo"
    if (tipo.includes("hotel")) return "Hotel"
    if (tipo.includes("maritimo")) return "Crucero"
    if (tipo.includes("terrestre")) return "Terrestre"
    return tipoServicio
  }

  async function descargarPDF() {
    if (!venta || items.length === 0) {
      toast.error("No hay datos para generar el PDF")
      return
    }

    try {
      // Obtener información del cliente
      const userRes = await fetch("/api/auth/user-info", { cache: "no-store" })
      const userData = await userRes.json()
      const nombreCliente = userData?.user?.nombre || "Cliente"

      // Crear PDF
      const doc = new jsPDF()
      
      // Título
      doc.setFontSize(20)
      doc.setTextColor(233, 30, 99)
      doc.text("Itinerario de Viaje", 14, 20)
      
      // Información del cliente y venta
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(`Cliente: ${nombreCliente}`, 14, 30)
      doc.text(`Número de Itinerario: #${venta.id_venta}`, 14, 36)
      doc.text(`Fecha de Generación: ${new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })}`, 14, 42)

      // Ordenar items por fecha
      const itemsOrdenados = [...items].sort((a, b) => {
        const dateA = new Date(a.fecha_inicio).getTime()
        const dateB = new Date(b.fecha_inicio).getTime()
        return dateA - dateB
      })

      // Preparar datos de la tabla
      const headers = [["#", "Tipo", "Servicio", "Fecha Inicio", "Costo (Bs.)"]]
      const rows = itemsOrdenados.map((item, index) => [
        String(index + 1),
        getTypeLabel(item.tipo_servicio),
        item.nombre_servicio || "Sin nombre",
        item.fecha_inicio 
          ? new Date(item.fecha_inicio).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })
          : "N/A",
        `Bs. ${Number(item.costo_unitario_bs || item.costo_unitario_usd || 0).toLocaleString("es-VE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      ])

      // Agregar tabla
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 50,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [233, 30, 99],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 10, left: 14, right: 14 },
      })

      // Agregar total
      const finalY = (doc as any).lastAutoTable.finalY || 50
      doc.setFontSize(12)
      doc.setFont(undefined, "bold")
      doc.text("Total del Itinerario:", 14, finalY + 15)
      doc.setFontSize(14)
      doc.setTextColor(233, 30, 99)
      doc.text(
        totalPrice.toLocaleString("es-VE", {
          style: "currency",
          currency: "USD"
        }),
        14,
        finalY + 22
      )

      // Pie de página
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Página ${i} de ${pageCount} - ViajesUCAB`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        )
      }

      // Guardar PDF
      doc.save(`itinerario-${venta.id_venta}-${new Date().toISOString().split("T")[0]}.pdf`)
      toast.success("Itinerario descargado en formato PDF")
    } catch (error: any) {
      toast.error(error.message || "Error al generar el PDF")
    }
  }

  if (loading) {
    return (
      <div className="bg-muted/30 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#E91E63]" />
          <p className="text-muted-foreground">Cargando constructor de itinerarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-muted/30 min-h-screen overflow-x-hidden">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Constructor de Itinerarios</h1>
          <p className="text-white/90 text-base md:text-lg">
            Diseña tu viaje perfecto: agrega vuelos, hoteles, cruceros y más servicios en orden cronológico
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Botón volver */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/itinerario")}
            className="text-muted-foreground"
          >
            ← Volver a mis itinerarios
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {tieneFechasPasadas && (
          <div className="mb-6 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <span>
              <strong>Advertencia:</strong> Este itinerario contiene servicios con fechas pasadas. 
              Considera actualizar las fechas o eliminar estos servicios.
            </span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Builder */}
          <div className="lg:col-span-8 space-y-6">
            {/* Info Card */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">¿Qué es un itinerario?</h3>
                    <p className="text-sm text-muted-foreground">
                      Un itinerario es tu plan de viaje personalizado. Agrega servicios (vuelos, hoteles, cruceros, etc.) 
                      en el orden que los usarás durante tu viaje. Cada servicio se guarda con sus fechas y costos, 
                      y el sistema calcula automáticamente el total de tu viaje.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Service Button */}
            <Card>
              <CardHeader>
                <CardTitle>Agregar servicios</CardTitle>
                <CardDescription>
                  Haz clic en el botón para buscar y agregar servicios disponibles a tu itinerario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-[#E91E63] hover:bg-[#E91E63]/90 h-12"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Servicio al Itinerario
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Tu itinerario de viaje</CardTitle>
                <CardDescription>
                  Los servicios aparecen ordenados por fecha de inicio. Arrastra para reorganizar (próximamente).
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay servicios agregados aún</p>
                    <p className="text-sm">Haz clic en "Agregar Servicio" para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items
                      .sort((a, b) => {
                        const dateA = new Date(a.fecha_inicio).getTime()
                        const dateB = new Date(b.fecha_inicio).getTime()
                        return dateA - dateB
                      })
                      .map((item, index) => (
                        <div key={item.id_itinerario}>
                          <div className="flex gap-4">
                            {/* Timeline indicator */}
                            <div className="flex flex-col items-center">
                              <div className="w-10 h-10 rounded-full bg-[#E91E63] text-white flex items-center justify-center">
                                {getIcon(item.tipo_servicio)}
                              </div>
                              {index < items.length - 1 && (
                                <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-700 my-2" />
                              )}
                            </div>

                            {/* Item details */}
                            <Card className="flex-1 min-w-0">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className="flex-1 min-w-0">
                                    <Badge variant="secondary" className="mb-2">
                                      {getTypeLabel(item.tipo_servicio)}
                                    </Badge>
                                    <h3 className="font-semibold text-base md:text-lg mb-1 break-words">
                                      {item.nombre_servicio || "Servicio sin nombre"}
                                    </h3>
                                    {item.fecha_inicio && (
                                      <p className="text-xs md:text-sm text-muted-foreground break-words">
                                        <Calendar className="h-3 w-3 inline mr-1" />
                                        {new Date(item.fecha_inicio).toLocaleDateString("es-ES", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-destructive shrink-0"
                                    onClick={() => eliminarItem(item.id_itinerario)}
                                    title="Eliminar servicio"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                  <span className="text-xs md:text-sm text-muted-foreground">Costo:</span>
                                  <span className="font-semibold text-[#E91E63] text-sm md:text-base">
                                    Bs. {Number(item.costo_unitario_bs || item.costo_unitario_usd || 0).toLocaleString("es-VE", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-4 space-y-4">
              {/* Price Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#E91E63]" />
                    Resumen de costos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {items.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay servicios agregados
                      </p>
                    ) : (
                      items.map((item) => (
                        <div key={item.id_itinerario} className="flex justify-between gap-2 text-sm">
                          <span className="text-muted-foreground truncate">
                            {getTypeLabel(item.tipo_servicio)}
                          </span>
                          <span className="font-medium whitespace-nowrap shrink-0">
                            Bs. {Number(item.costo_unitario_bs || item.costo_unitario_usd || 0).toLocaleString("es-VE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-2xl text-[#E91E63]">
                      Bs. {totalPrice.toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {venta && (
                    <p className="text-xs text-muted-foreground">
                      Venta #{venta.id_venta} • {items.length} servicio{items.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Trip Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del viaje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Servicios:</span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Servicios únicos:</span>
                    <span className="font-medium">{new Set(items.map((i) => i.tipo_servicio).filter(Boolean)).size}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button
                    className="w-full bg-[#E91E63] hover:bg-[#E91E63]/90 h-12"
                    disabled={items.length === 0 || saving}
                    onClick={async () => {
                      // Por ahora solo recargamos para recalcular total
                      if (venta) {
                        setSaving(true)
                        await loadItinerario(venta.id_venta)
                        toast.success("Itinerario guardado", {
                          description: "Los cambios han sido guardados correctamente",
                        })
                        setSaving(false)
                      }
                    }}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? "Guardando..." : "Guardar Itinerario"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    disabled={items.length === 0}
                    onClick={descargarPDF}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    El pago estará disponible próximamente
                  </p>
                </CardContent>
              </Card>

              {/* Help */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-3">¿Necesitas ayuda para planificar tu viaje?</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Contactar asesor
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog para agregar servicio */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Servicio al Itinerario</DialogTitle>
            <DialogDescription>
              Selecciona un servicio disponible y define las fechas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label>Buscar servicio</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, destino o tipo..."
                  value={searchServicio}
                  onChange={(e) => setSearchServicio(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Select de servicio */}
            <div className="space-y-2">
              <Label>
                Servicio <span className="text-red-500">*</span>
              </Label>
              {loadingServicios ? (
                <div className="py-4 text-center text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Cargando servicios...
                </div>
              ) : (
                <Select value={selectedServicioId} onValueChange={setSelectedServicioId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {serviciosFiltrados.map((servicio) => (
                      <SelectItem key={servicio.id} value={String(servicio.id)}>
                        <div className="flex flex-col">
                          <span className="font-medium">{servicio.nombre}</span>
                          <span className="text-xs text-muted-foreground">
                            {servicio.tipo_servicio} {servicio.lugar_nombre && `• ${servicio.lugar_nombre}`}
                            {" • "}
                            {servicio.costo_servicio?.toLocaleString("es-VE", {
                              style: "currency",
                              currency: servicio.denominacion || "USD",
                            })}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Fechas */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Fecha de inicio <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 bg-[#E91E63] hover:bg-[#E91E63]/90"
              onClick={agregarServicio}
              disabled={addingItem || !selectedServicioId || !fechaInicio}
            >
              {addingItem ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Agregar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false)
                setSelectedServicioId("")
                setFechaInicio("")
              }}
              disabled={addingItem}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
