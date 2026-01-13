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
import { Loader2, ArrowLeft, MapPin, Star, ShoppingCart, Plus, Heart } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { WishlistButton } from "@/components/wishlist-button"

type ServicioDetalle = {
  id: number
  nombre: string
  descripcion: string
  costo_servicio: number
  millas_otorgadas: number
  tipo_servicio: string
  denominacion: string
  lugar_id: number | null
  lugar_nombre: string | null
  nombre_proveedor: string | null
  imagenes: string[] | null
}

export default function ServicioDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [servicio, setServicio] = useState<ServicioDetalle | null>(null)
  const [agregando, setAgregando] = useState(false)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    async function loadSession() {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" })
        if (r.ok) {
          const data = await r.json()
          setSession(data.user)
        }
      } catch (err) {
        console.error("Error cargando sesión:", err)
      }
    }
    loadSession()
  }, [])

  useEffect(() => {
    async function fetchServicio() {
      const id = params.id as string
      if (!id) {
        toast.error("ID de servicio no válido")
        router.push("/buscar")
        return
      }

      try {
        const response = await fetch(`/api/servicios/${id}`, { cache: "no-store" })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error cargando servicio")
        }

        const data = await response.json()
        setServicio(data.servicio)
      } catch (error: any) {
        console.error("Error cargando servicio:", error)
        toast.error(error.message || "Error cargando detalles del servicio")
        router.push("/buscar")
      } finally {
        setLoading(false)
      }
    }

    fetchServicio()
  }, [params.id, router])

  const handleAgregarAlCarrito = async () => {
    if (!servicio) return

    if (!session) {
      toast.error("Debes iniciar sesión para agregar servicios al carrito")
      router.push(`/login?next=/servicio/${servicio.id}`)
      return
    }

    if (session.rolId !== 1) {
      toast.error("Solo los clientes pueden agregar servicios al carrito")
      return
    }

    setAgregando(true)
    try {
      const ventaRes = await fetch("/api/cliente/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      if (!ventaRes.ok) {
        const errorData = await ventaRes.json()
        throw new Error(errorData.error || "Error creando venta")
      }

      const ventaData = await ventaRes.json()
      const idVenta = ventaData.id_venta

      if (!idVenta) {
        throw new Error("No se recibió el ID de venta")
      }

      const fechaInicio = new Date()
      fechaInicio.setDate(fechaInicio.getDate() + 30)

      const agregarRes = await fetch("/api/cliente/itinerarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_venta: idVenta,
          id_servicio: servicio.id,
          fecha_inicio: fechaInicio.toISOString().split('T')[0],
          aplicar_descuento: false,
        }),
      })

      if (!agregarRes.ok) {
        const errorData = await agregarRes.json()
        const errorMessage = errorData.error || "Error agregando al carrito"
        console.error("Error del servidor:", errorData)
        throw new Error(errorMessage)
      }

      const agregarData = await agregarRes.json()
      console.log("Servicio agregado exitosamente:", agregarData)

      toast.success("Servicio agregado al carrito", {
        description: "Redirigiendo al carrito...",
      })

      window.dispatchEvent(new Event("cart-updated"))
      
      // Redirigir al carrito después de un breve delay
      setTimeout(() => {
        router.push("/carrito")
      }, 1000)
    } catch (error: any) {
      console.error("Error agregando al carrito:", error)
      const errorMessage = error.message || "Error al agregar el servicio al carrito"
      toast.error("Error", {
        description: errorMessage,
        duration: 5000,
      })
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
            <p className="text-muted-foreground">Cargando detalles del servicio...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!servicio) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Servicio no encontrado</p>
              <Button asChild className="mt-4 w-full">
                <Link href="/buscar">Volver a Búsqueda</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const imagenes = servicio.imagenes && servicio.imagenes.length > 0 
    ? servicio.imagenes 
    : ["/placeholder.svg"]

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
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="relative h-96 bg-gradient-to-br from-[#E91E63]/20 to-[#C2185B]/20 flex items-center justify-center">
                {imagenes[0] && imagenes[0] !== "/placeholder.svg" ? (
                  <img
                    src={imagenes[0]}
                    alt={servicio.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground">Imagen del servicio</span>
                )}
                {session && (
                  <div className="absolute top-4 right-4">
                    <WishlistButton
                      itemId={servicio.id}
                      itemName={servicio.nombre}
                      itemType="servicio"
                      variant="icon"
                    />
                  </div>
                )}
              </div>
            </Card>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre este servicio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {servicio.descripcion || "No hay descripción disponible."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Servicio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tipo de servicio</span>
                      <Badge variant="outline">{servicio.tipo_servicio}</Badge>
                    </div>
                    {servicio.lugar_nombre && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Ubicación</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{servicio.lugar_nombre}</span>
                        </div>
                      </div>
                    )}
                    {servicio.nombre_proveedor && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Proveedor</span>
                        <span>{servicio.nombre_proveedor}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Millas de recompensa</span>
                      <span className="font-semibold">{servicio.millas_otorgadas.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{servicio.nombre}</CardTitle>
                <CardDescription>
                  <Badge variant="outline">{servicio.tipo_servicio}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">Precio</span>
                    <span className="text-3xl font-bold text-[#E91E63]">
                      {servicio.denominacion === "VEN" 
                        ? `Bs. ${servicio.costo_servicio.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : `$${servicio.costo_servicio.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${servicio.denominacion}`
                      }
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    o {servicio.millas_otorgadas.toLocaleString()} millas
                  </p>
                </div>

                <Separator />

                {servicio.lugar_nombre && (
                  <div>
                    <h4 className="font-semibold mb-2">Ubicación</h4>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{servicio.lugar_nombre}</span>
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Incluye</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-[#E91E63]" />
                      <span>{servicio.millas_otorgadas.toLocaleString()} millas de recompensa</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-2">
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
                  
                  {session && (
                    <WishlistButton
                      itemId={servicio.id}
                      itemName={servicio.nombre}
                      itemType="servicio"
                      variant="default"
                      className="w-full"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
