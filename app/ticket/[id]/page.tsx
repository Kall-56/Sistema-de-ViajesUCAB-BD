"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Ticket, Download, Printer, Calendar, MapPin } from "lucide-react"
import { toast } from "sonner"

export default function TicketPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [venta, setVenta] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      loadTicket()
    }
  }, [params.id])

  async function loadTicket() {
    setLoading(true)
    try {
      const r = await fetch(`/api/cliente/ventas/${params.id}`, { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setVenta(data)
      } else {
        throw new Error(data?.error ?? "Error cargando ticket")
      }
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudo cargar el ticket",
      })
      router.push("/mis-viajes")
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#E91E63]" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!venta) {
    return null
  }

  const items = venta.items || []

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Botones de acción - ocultos al imprimir */}
        <div className="mb-6 flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={() => router.push("/mis-viajes")}>
            Volver a mis viajes
          </Button>
        </div>

        {/* Ticket */}
        <Card className="print:shadow-none">
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              <Ticket className="h-16 w-16 mx-auto mb-4 text-[#E91E63]" />
              <h1 className="text-3xl font-bold mb-2">BOLETO DIGITAL</h1>
              <p className="text-muted-foreground">ViajesUCAB</p>
              <p className="text-sm text-muted-foreground mt-2">
                Reserva #{venta.venta?.id_venta}
              </p>
            </div>

            <div className="space-y-6">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{item.nombre_servicio}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {item.lugar_nombre && (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {item.lugar_nombre}
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(item.fecha_inicio).toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#E91E63]">
                        Bs. {item.costo_unitario_bs.toLocaleString("es-VE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold mb-2">Instrucciones:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Presenta este boleto al momento del check-in</li>
                  <li>Llega con al menos 2 horas de anticipación</li>
                  <li>Trae una identificación válida</li>
                  <li>Este boleto es válido solo para la fecha indicada</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Gracias por elegir ViajesUCAB</p>
              <p className="mt-1">¡Buen viaje!</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}

