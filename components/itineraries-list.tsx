"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Plus,
  Calendar,
  DollarSign,
  MapPin,
  AlertTriangle,
  FileText,
  ShoppingCart,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Separator } from "@/components/ui/separator"
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

type Venta = {
  id_venta: number
  monto_total: number
  monto_compensacion: number
  cantidad_items: number
  fecha_inicio_minima: string | null
  fecha_fin_maxima: string | null
  items: any[] | null
}

export function ItinerariesList() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ventas, setVentas] = useState<Venta[]>([])
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ventaToDelete, setVentaToDelete] = useState<number | null>(null)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)

  useEffect(() => {
    loadVentas()
  }, [])

  async function loadVentas() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/cliente/ventas", { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setVentas(Array.isArray(data?.ventas) ? data.ventas : [])
      } else {
        if (r.status === 401 || r.status === 403) {
          router.push("/login?next=/itinerario")
          return
        }
        throw new Error(data?.error ?? "Error cargando itinerarios")
      }
    } catch (err: any) {
      setError(err?.message ?? "Error")
    } finally {
      setLoading(false)
    }
  }

  async function crearNuevoItinerario() {
    setCreating(true)
    setError(null)
    try {
      const r = await fetch("/api/cliente/ventas", { method: "POST" })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error creando itinerario")
      toast.success("Itinerario creado", {
        description: "Tu nuevo itinerario está listo para agregar servicios",
      })
      await loadVentas()
      // Redirigir al nuevo itinerario
      router.push(`/itinerario/${data.id_venta}`)
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudo crear el itinerario",
      })
      setError(err?.message ?? "Error")
    } finally {
      setCreating(false)
    }
  }

  async function eliminarItinerario(idVenta: number) {
    setDeleting(idVenta)
    try {
      const r = await fetch(`/api/cliente/ventas/${idVenta}`, { method: "DELETE" })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error eliminando itinerario")
      toast.success("Itinerario eliminado", {
        description: "El itinerario ha sido eliminado correctamente",
      })
      await loadVentas()
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudo eliminar el itinerario",
      })
    } finally {
      setDeleting(null)
      setDeleteDialogOpen(false)
      setVentaToDelete(null)
    }
  }

  async function agregarAlCarrito(idVenta: number) {
    setAddingToCart(idVenta)
    try {
      const r = await fetch("/api/cliente/carrito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_venta: idVenta }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error ?? "Error agregando al carrito")
      toast.success("Agregado al carrito", {
        description: "El itinerario ha sido agregado a tu carrito de compras",
      })
      
      // Notificar al header para actualizar contador
      window.dispatchEvent(new Event("cart-updated"))
      
      // Recargar lista para reflejar cambios
      await loadVentas()
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudo agregar al carrito",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  function tieneFechasPasadas(venta: Venta): boolean {
    if (!venta.fecha_inicio_minima) return false
    const fechaMin = new Date(venta.fecha_inicio_minima)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return fechaMin < hoy
  }

  // Una venta está en el carrito si está pendiente y tiene items
  // Esto se verifica automáticamente en la API del carrito

  function calcularTotal(venta: Venta): number {
    if (!venta.items || venta.items.length === 0) return 0
    return venta.items.reduce((sum: number, item: any) => {
      return sum + Number(item.costo_unitario_usd || 0)
    }, 0)
  }

  function getTypeLabel(tipoServicio: string | null | undefined): string {
    if (!tipoServicio) return "Servicio"
    const tipo = tipoServicio.toLowerCase()
    if (tipo.includes("aereo")) return "Vuelo"
    if (tipo.includes("hotel")) return "Hotel"
    if (tipo.includes("maritimo")) return "Crucero"
    if (tipo.includes("terrestre")) return "Terrestre"
    return tipoServicio
  }

  async function descargarPDF(idVenta: number) {
    try {
      // Cargar datos completos del itinerario
      const r = await fetch(`/api/cliente/ventas/${idVenta}`, { cache: "no-store" })
      const data = await r.json()
      
      if (!r.ok || !data.venta || !data.items || data.items.length === 0) {
        toast.error("No hay datos para generar el PDF")
        return
      }

      // Obtener información del cliente
      const userRes = await fetch("/api/auth/user-info", { cache: "no-store" })
      const userData = await userRes.json()
      const nombreCliente = userData?.user?.nombre || "Cliente"

      const venta = data.venta
      const items = data.items

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
      const itemsOrdenados = [...items].sort((a: any, b: any) => {
        const dateA = new Date(a.fecha_inicio || 0).getTime()
        const dateB = new Date(b.fecha_inicio || 0).getTime()
        return dateA - dateB
      })

      // Preparar datos de la tabla
      const headers = [["#", "Tipo", "Servicio", "Fecha Inicio", "Fecha Fin", "Costo (USD)"]]
      const rows = itemsOrdenados.map((item: any, index: number) => [
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
        item.fecha_fin
          ? new Date(item.fecha_fin).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })
          : "N/A",
        (item.costo_unitario_usd || 0).toLocaleString("es-VE", {
          style: "currency",
          currency: "USD"
        })
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

      // Calcular total
      const total = items.reduce((sum: number, item: any) => {
        return sum + Number(item.costo_unitario_usd || 0)
      }, 0)

      // Agregar total
      const finalY = (doc as any).lastAutoTable.finalY || 50
      doc.setFontSize(12)
      doc.setFont(undefined, "bold")
      doc.text("Total del Itinerario:", 14, finalY + 15)
      doc.setFontSize(14)
      doc.setTextColor(233, 30, 99)
      doc.text(
        total.toLocaleString("es-VE", {
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
          <p className="text-muted-foreground">Cargando itinerarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-muted/30 min-h-screen overflow-x-hidden">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Mis Itinerarios</h1>
          <p className="text-white/90 text-base md:text-lg">
            Gestiona todos tus planes de viaje. Crea, edita y organiza tus itinerarios personalizados.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Botón crear nuevo */}
        <div className="mb-6">
          <Button
            className="bg-[#E91E63] hover:bg-[#E91E63]/90 h-12"
            onClick={crearNuevoItinerario}
            disabled={creating}
          >
            {creating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Crear Nuevo Itinerario
          </Button>
        </div>

        {/* Lista de itinerarios */}
        {ventas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No tienes itinerarios aún</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer itinerario para comenzar a planificar tu viaje
              </p>
              <Button
                className="bg-[#E91E63] hover:bg-[#E91E63]/90"
                onClick={crearNuevoItinerario}
                disabled={creating}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Itinerario
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ventas.map((venta) => {
              const tienePasadas = tieneFechasPasadas(venta)
              const total = calcularTotal(venta)

              return (
                <Card key={venta.id_venta} className="relative">
                  {tienePasadas && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Fechas pasadas
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Itinerario #{venta.id_venta}</CardTitle>
                        <CardDescription>
                          {venta.cantidad_items || 0} servicio{venta.cantidad_items !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Fechas */}
                    {venta.fecha_inicio_minima && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(venta.fecha_inicio_minima).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {venta.fecha_fin_maxima &&
                            ` - ${new Date(venta.fecha_fin_maxima).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}`}
                        </span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm font-medium">Total estimado:</span>
                      <span className="text-lg font-bold text-[#E91E63]">
                        {total.toLocaleString("es-VE", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </span>
                    </div>

                    {/* Warning si tiene fechas pasadas */}
                    {tienePasadas && (
                      <Alert variant="destructive" className="py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Este itinerario contiene fechas pasadas. No se puede agregar al carrito. Considera actualizarlo o eliminarlo.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Separator />

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/itinerario/${venta.id_venta}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => agregarAlCarrito(venta.id_venta)}
                        disabled={tienePasadas || addingToCart === venta.id_venta}
                      >
                        {addingToCart === venta.id_venta ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        Carrito
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => descargarPDF(venta.id_venta)}
                        disabled={!venta.items || venta.items.length === 0}
                        title="Descargar PDF"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setVentaToDelete(venta.id_venta)
                          setDeleteDialogOpen(true)
                        }}
                        disabled={deleting === venta.id_venta}
                        title="Eliminar itinerario"
                        className="text-destructive hover:text-destructive"
                      >
                        {deleting === venta.id_venta ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar itinerario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los servicios asociados a este itinerario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (ventaToDelete) {
                  eliminarItinerario(ventaToDelete)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

