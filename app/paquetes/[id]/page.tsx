"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, MapPin, Star, CheckCircle2, XCircle, ShoppingCart, Calendar } from "lucide-react"
import { WishlistButton } from "@/components/wishlist-button"
import { toast } from "sonner"
import Link from "next/link"

type PaqueteDetalle = {
  id_paquete: number;
  nombre_paquete: string;
  descripcion_paquete: string;
  tipo_paquete: string;
  restricciones: string[] | null;
  ids_servicios: number[] | null;
  precio_total: number;
  millas_totales: number;
  destinos: string[] | null;
  imagen_principal: string | null;
  servicios: Array<{
    id: number;
    nombre: string;
    descripcion: string;
    costo_servicio: number;
    millas_otorgadas: number;
    tipo_servicio: string;
    denominacion: string;
    lugar_nombre: string | null;
    imagenes: string[];
  }>;
};

export default function PaqueteDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [paquete, setPaquete] = useState<PaqueteDetalle | null>(null)
  const [agregando, setAgregando] = useState(false)
  const [showFechasDialog, setShowFechasDialog] = useState(false)
  const [fechas, setFechas] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    async function fetchPaquete() {
      const id = params.id as string
      if (!id) {
        toast.error("ID de paquete no válido")
        router.push("/paquetes")
        return
      }

      try {
        const response = await fetch(`/api/paquetes/${id}`, { cache: "no-store" })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error cargando paquete")
        }

        const data = await response.json()
        setPaquete(data.paquete)
      } catch (error: any) {
        console.error("Error cargando paquete:", error)
        toast.error(error.message || "Error cargando detalles del paquete")
        router.push("/paquetes")
      } finally {
        setLoading(false)
      }
    }

    fetchPaquete()
  }, [params.id, router])

  const handleAgregarAlCarrito = async () => {
    if (!paquete) return

    // Verificar que el usuario esté autenticado
    try {
      const authCheck = await fetch("/api/auth/me", { cache: "no-store" })
      if (!authCheck.ok) {
        toast.error("Debes iniciar sesión para agregar paquetes al carrito")
        router.push(`/login?next=/paquetes/${paquete.id_paquete}`)
        return
      }

      const authData = await authCheck.json()
      if (!authData.user || authData.user.rolId !== 1) {
        toast.error("Solo los clientes pueden agregar paquetes al carrito")
        return
      }

      // Abrir diálogo para seleccionar fechas
      setShowFechasDialog(true)
      // Inicializar fechas vacías
      const fechasIniciales: { [key: number]: string } = {}
      paquete.servicios.forEach((s) => {
        fechasIniciales[s.id] = ""
      })
      setFechas(fechasIniciales)
    } catch (error) {
      console.error("Error verificando autenticación:", error)
      toast.error("Error al verificar autenticación")
    }
  }

  const handleConfirmarFechas = async () => {
    if (!paquete) return

    // Validar que todas las fechas estén seleccionadas
    const todasFechasSeleccionadas = paquete.servicios.every((s) => {
      const fecha = fechas[s.id]
      return fecha && fecha.trim() !== ""
    })

    if (!todasFechasSeleccionadas) {
      toast.error("Debes seleccionar una fecha para cada servicio")
      return
    }

    // Validar que ninguna fecha sea pasada
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    for (const servicio of paquete.servicios) {
      const fechaStr = fechas[servicio.id]
      if (fechaStr) {
        const fecha = new Date(fechaStr)
        fecha.setHours(0, 0, 0, 0)
        if (fecha < hoy) {
          toast.error(`La fecha para "${servicio.nombre}" no puede ser anterior a hoy`)
          return
        }
      }
    }

    setAgregando(true)
    try {
      // Ordenar las fechas según el orden de los servicios en el paquete
      const fechasOrdenadas = paquete.servicios.map((s) => {
        const fecha = fechas[s.id]
        if (!fecha) return null
        // Convertir a ISO string para enviar a la API
        return new Date(fecha).toISOString()
      }).filter((f): f is string => f !== null)

      const response = await fetch("/api/cliente/paquetes/comprar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paquete: paquete.id_paquete,
          fechas_inicio: fechasOrdenadas,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error agregando paquete al carrito")
      }

      toast.success("¡Paquete agregado al carrito!", {
        description: "El paquete ha sido agregado a tu carrito de compras",
      })

      // Disparar evento para actualizar el contador del carrito
      window.dispatchEvent(new Event("cart-updated"))

      // Cerrar diálogo
      setShowFechasDialog(false)
      setFechas({})
    } catch (error: any) {
      console.error("Error agregando paquete al carrito:", error)
      toast.error(error.message || "Error al agregar el paquete al carrito")
    } finally {
      setAgregando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#E91E63] mb-4" />
            <p className="text-muted-foreground">Cargando detalles del paquete...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!paquete) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Paquete no encontrado</p>
              <Button asChild className="mt-4 w-full">
                <Link href="/paquetes">Volver a Paquetes</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Imagen principal */}
            {paquete.imagen_principal && (
              <Card className="overflow-hidden">
                <img
                  src={paquete.imagen_principal}
                  alt={paquete.nombre_paquete}
                  className="w-full h-96 object-cover"
                />
              </Card>
            )}

            {/* Tabs con información */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="services">Servicios</TabsTrigger>
                <TabsTrigger value="restrictions">Restricciones</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre este paquete</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {paquete.descripcion_paquete}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Servicios Incluidos</CardTitle>
                    <CardDescription>
                      {paquete.servicios.length} servicio{paquete.servicios.length !== 1 ? "s" : ""} incluido{paquete.servicios.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {paquete.servicios.map((servicio) => (
                      <div key={servicio.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{servicio.nombre}</h4>
                            {servicio.lugar_nombre && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <MapPin className="h-4 w-4" />
                                {servicio.lugar_nombre}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline">{servicio.tipo_servicio}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{servicio.descripcion}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Precio: ${servicio.costo_servicio.toLocaleString()} {servicio.denominacion}
                          </span>
                          <span className="text-muted-foreground">
                            Millas: {servicio.millas_otorgadas.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="restrictions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Restricciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paquete.restricciones && paquete.restricciones.length > 0 ? (
                      <ul className="space-y-2">
                        {paquete.restricciones.map((restriccion, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                            <span className="text-sm">{restriccion}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No hay restricciones para este paquete.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar con precio y botón de compra */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{paquete.nombre_paquete}</CardTitle>
                <CardDescription>
                  <Badge variant="outline">{paquete.tipo_paquete}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">Desde</span>
                    <span className="text-3xl font-bold text-[#E91E63]">
                      ${paquete.precio_total.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    o {paquete.millas_totales.toLocaleString()} millas
                  </p>
                </div>

                <Separator />

                {paquete.destinos && paquete.destinos.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Destinos</h4>
                    <div className="flex flex-wrap gap-2">
                      {paquete.destinos.map((destino, idx) => (
                        <Badge key={idx} variant="secondary">
                          <MapPin className="h-3 w-3 mr-1" />
                          {destino}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Incluye</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{paquete.servicios.length} servicio{paquete.servicios.length !== 1 ? "s" : ""}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{paquete.millas_totales.toLocaleString()} millas de recompensa</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <Button
                  className="w-full bg-[#E91E63] hover:bg-[#E91E63]/90"
                  size="lg"
                  onClick={handleAgregarAlCarrito}
                  disabled={agregando}
                >
                  {agregando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Agregando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Agregar al Carrito
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/paquetes")}
                >
                  Ver Otros Paquetes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      {/* Dialog para seleccionar fechas */}
      <Dialog open={showFechasDialog} onOpenChange={setShowFechasDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seleccionar Fechas para los Servicios</DialogTitle>
            <DialogDescription>
              Selecciona la fecha de inicio para cada servicio del paquete. Todas las fechas deben ser futuras.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {paquete?.servicios.map((servicio) => (
              <div key={servicio.id} className="space-y-2 border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Label htmlFor={`fecha-${servicio.id}`} className="font-semibold">
                      {servicio.nombre}
                    </Label>
                    {servicio.lugar_nombre && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {servicio.lugar_nombre}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{servicio.descripcion}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {servicio.tipo_servicio}
                  </Badge>
                </div>
                <div>
                  <Label htmlFor={`fecha-${servicio.id}`} className="text-sm">
                    Fecha de Inicio *
                  </Label>
                  <Input
                    id={`fecha-${servicio.id}`}
                    type="date"
                    value={fechas[servicio.id] || ""}
                    onChange={(e) => setFechas({ ...fechas, [servicio.id]: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFechasDialog(false)
                setFechas({})
              }}
              disabled={agregando}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarFechas}
              disabled={agregando}
              className="bg-[#E91E63] hover:bg-[#C2185B]"
            >
              {agregando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Agregar al Carrito
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

