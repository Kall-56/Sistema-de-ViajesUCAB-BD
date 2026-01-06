"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, Download, Printer } from "lucide-react"
import { toast } from "sonner"

export default function FacturaPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [venta, setVenta] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      loadFactura()
    }
  }, [params.id])

  async function loadFactura() {
    setLoading(true)
    try {
      const r = await fetch(`/api/cliente/ventas/${params.id}`, { cache: "no-store" })
      const data = await r.json()
      if (r.ok) {
        setVenta(data)
      } else {
        throw new Error(data?.error ?? "Error cargando factura")
      }
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message ?? "No se pudo cargar la factura",
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

  const total = venta.venta?.monto_total || 0
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

        {/* Factura */}
        <Card className="print:shadow-none">
          <CardContent className="p-8">
            <div className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-[#E91E63] mb-2">FACTURA</h1>
                  <p className="text-muted-foreground">ViajesUCAB</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Número de factura</p>
                  <p className="font-semibold">#{venta.venta?.id_venta}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Fecha: {new Date().toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="font-semibold mb-2">Detalle de servicios</h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Servicio</th>
                      <th className="text-right p-3">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{item.nombre_servicio}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.fecha_inicio).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">
                          Bs. {item.costo_unitario_bs.toLocaleString("es-VE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted font-semibold">
                    <tr>
                      <td className="p-3 text-right">Total:</td>
                      <td className="p-3 text-right">
                        Bs. {total.toLocaleString("es-VE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>Nota:</strong> Esta es una factura preliminar. La factura fiscal oficial
                será emitida una vez confirmado el pago.
              </p>
              <p>Gracias por tu compra.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}

