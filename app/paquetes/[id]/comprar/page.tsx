"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, CalendarIcon, MapPin, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type ServicioPaquete = {
  id: number;
  nombre: string;
  descripcion: string;
  tipo_servicio: string;
  lugar_nombre: string | null;
};

type PaqueteComprar = {
  id_paquete: number;
  nombre_paquete: string;
  descripcion_paquete: string;
  tipo_paquete: string;
  servicios: ServicioPaquete[];
  precio_total: number;
  millas_totales: number;
};

export default function ComprarPaquetePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [comprando, setComprando] = useState(false)
  const [paquete, setPaquete] = useState<PaqueteComprar | null>(null)
  const [fechas, setFechas] = useState<{ [key: number]: Date | undefined }>({})

  useEffect(() => {
    async function fetchPaquete() {
      const id = params.id as string
      if (!id) {
        toast.error("ID de paquete no válido")
        router.push("/paquetes")
        return
      }

      try {
        // Verificar autenticación
        const authCheck = await fetch("/api/auth/check", { cache: "no-store" })
        if (!authCheck.ok) {
          toast.error("Debes iniciar sesión para comprar paquetes")
          router.push(`/login?next=/paquetes/${id}/comprar`)
          return
        }

        const authData = await authCheck.json()
        if (authData.rolId !== 1) {
          toast.error("Solo los clientes pueden comprar paquetes")
          router.push("/paquetes")
          return
        }

        // Obtener detalles del paquete
        const response = await fetch(`/api/paquetes/${id}`, { cache: "no-store" })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error cargando paquete")
        }

        const data = await response.json()
        setPaquete(data.paquete)
        
        // Inicializar fechas vacías
        const fechasIniciales: { [key: number]: Date | undefined } = {}
        data.paquete.servicios.forEach((s: ServicioPaquete) => {
          fechasIniciales[s.id] = undefined
        })
        setFechas(fechasIniciales)
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

  const handleComprar = async () => {
    if (!paquete) return

    // Validar que todas las fechas estén seleccionadas
    const fechasFaltantes = paquete.servicios.filter(s => !fechas[s.id])
    if (fechasFaltantes.length > 0) {
      toast.error(`Debes seleccionar fechas para todos los servicios. Faltan ${fechasFaltantes.length} servicio(s)`)
      return
    }

    // Validar que las fechas no sean pasadas
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    
    const fechasPasadas = paquete.servicios.filter(s => {
      const fecha = fechas[s.id]
      if (!fecha) return false
      const fechaComparar = new Date(fecha)
      fechaComparar.setHours(0, 0, 0, 0)
      return fechaComparar < hoy
    })

    if (fechasPasadas.length > 0) {
      toast.error("No puedes seleccionar fechas pasadas")
      return
    }

    setComprando(true)

    try {
      // Ordenar las fechas según el orden de los servicios en el paquete
      const fechasOrdenadas = paquete.servicios
        .map(s => {
          const fecha = fechas[s.id]
          if (!fecha) return null
          // Convertir a ISO string para enviar a la API
          return fecha.toISOString()
        })
        .filter((f): f is string => f !== null)

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
        throw new Error(data.error || "Error comprando paquete")
      }

      toast.success("¡Paquete comprado exitosamente!", {
        description: `Se creó la venta #${data.id_venta}. El paquete está en tu carrito.`,
      })

      // Disparar evento para actualizar el contador del carrito
      window.dispatchEvent(new Event("cart-updated"))

      // Redirigir al carrito para que el cliente pueda proceder con el pago
      router.push("/carrito")
    } catch (error: any) {
      console.error("Error comprando paquete:", error)
      toast.error(error.message || "Error al comprar el paquete")
    } finally {
      setComprando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#E91E63] mb-4" />
            <p className="text-muted-foreground">Cargando información del paquete...</p>
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
                <a href="/paquetes">Volver a Paquetes</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const todasFechasSeleccionadas = paquete.servicios.every(s => fechas[s.id] !== undefined)

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/paquetes/${paquete.id_paquete}`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Detalles
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comprar Paquete: {paquete.nombre_paquete}</CardTitle>
              <CardDescription>
                Selecciona las fechas de inicio para cada servicio incluido en el paquete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información del paquete */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Precio Total</span>
                  <span className="text-2xl font-bold text-[#E91E63]">
                    ${paquete.precio_total.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Millas Totales</span>
                  <span className="text-sm text-muted-foreground">
                    {paquete.millas_totales.toLocaleString()} millas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{paquete.tipo_paquete}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {paquete.servicios.length} servicio{paquete.servicios.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Selección de fechas por servicio */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Selecciona las fechas de inicio</h3>
                <p className="text-sm text-muted-foreground">
                  Debes seleccionar una fecha de inicio para cada servicio del paquete.
                </p>

                {paquete.servicios.map((servicio, index) => (
                  <Card key={servicio.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Servicio {index + 1} de {paquete.servicios.length}
                              </span>
                              <Badge variant="secondary">{servicio.tipo_servicio}</Badge>
                            </div>
                            <h4 className="font-semibold text-lg">{servicio.nombre}</h4>
                            {servicio.lugar_nombre && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <MapPin className="h-4 w-4" />
                                {servicio.lugar_nombre}
                              </div>
                            )}
                            {servicio.descripcion && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {servicio.descripcion}
                              </p>
                            )}
                          </div>
                          {fechas[servicio.id] && (
                            <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`fecha-${servicio.id}`}>
                            Fecha de Inicio <span className="text-red-500">*</span>
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                                id={`fecha-${servicio.id}`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {fechas[servicio.id] ? (
                                  format(fechas[servicio.id]!, "PPP", { locale: es })
                                ) : (
                                  <span className="text-muted-foreground">
                                    Selecciona una fecha
                                  </span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={fechas[servicio.id]}
                                onSelect={(date) => {
                                  setFechas((prev) => ({
                                    ...prev,
                                    [servicio.id]: date,
                                  }))
                                }}
                                disabled={(date) => {
                                  // Deshabilitar fechas pasadas
                                  const hoy = new Date()
                                  hoy.setHours(0, 0, 0, 0)
                                  return date < hoy
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              {/* Resumen y botón de compra */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-semibold">Resumen</p>
                    <p className="text-sm text-muted-foreground">
                      {paquete.servicios.filter(s => fechas[s.id]).length} de{" "}
                      {paquete.servicios.length} fechas seleccionadas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#E91E63]">
                      ${paquete.precio_total.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      o {paquete.millas_totales.toLocaleString()} millas
                    </p>
                  </div>
                </div>

                {!todasFechasSeleccionadas && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Debes seleccionar todas las fechas antes de comprar
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/paquetes/${paquete.id_paquete}`)}
                    disabled={comprando}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-[#E91E63] hover:bg-[#E91E63]/90"
                    onClick={handleComprar}
                    disabled={!todasFechasSeleccionadas || comprando}
                  >
                    {comprando ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Comprar Paquete"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

