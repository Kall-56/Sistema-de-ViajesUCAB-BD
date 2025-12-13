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

  function estaEnCarrito(venta: Venta): boolean {
    // TODO: Verificar si está en carrito (necesitamos implementar carrito)
    return false
  }

  function calcularTotal(venta: Venta): number {
    if (!venta.items || venta.items.length === 0) return 0
    return venta.items.reduce((sum: number, item: any) => {
      return sum + Number(item.costo_unitario_usd || 0)
    }, 0)
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
              const enCarrito = estaEnCarrito(venta)
              const total = calcularTotal(venta)

              return (
                <Card key={venta.id_venta} className="relative">
                  {tienePasadas && !enCarrito && (
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
                    {tienePasadas && !enCarrito && (
                      <Alert variant="destructive" className="py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Este itinerario contiene fechas pasadas. Considera actualizarlo o eliminarlo.
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
                        onClick={() => {
                          toast.info("Próximamente", {
                            description: "La descarga de PDF estará disponible pronto",
                          })
                        }}
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

