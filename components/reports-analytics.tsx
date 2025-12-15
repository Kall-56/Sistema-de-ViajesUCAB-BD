"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FileBarChart,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  MapPin,
  Plane,
  Tag,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Plus,
  Play,
  Save,
  Mail,
  Filter,
  Search,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Definición de los 5 reportes basados en stored procedures
interface ReporteDef {
  id: number;
  name: string;
  category: string;
  description: string;
  spName: string; // Nombre del stored procedure
  icon: any;
  parametros?: {
    fechaInicio?: boolean;
    fechaFin?: boolean;
    limit?: boolean;
  };
}

// Funciones helper para formatear datos
const formatDate = (value: any): string => {
  if (!value) return "-"
  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) return String(value)
    return date.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  } catch {
    return String(value)
  }
}

const formatNumber = (value: any, decimals: number = 0): string => {
  if (value === null || value === undefined) return "-"
  const num = typeof value === "number" ? value : parseFloat(String(value))
  if (isNaN(num)) return String(value)
  return num.toLocaleString("es-VE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

const formatCurrency = (value: any, denominacion?: string): string => {
  if (value === null || value === undefined) return "-"
  const num = typeof value === "number" ? value : parseFloat(String(value))
  if (isNaN(num)) return String(value)
  
  // Limitar a 2 decimales máximo, eliminar ceros innecesarios
  const formatted = num.toLocaleString("es-VE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
  
  // Determinar símbolo de moneda basado en denominación
  let currencySymbol = ""
  if (denominacion) {
    const denomUpper = denominacion.toUpperCase()
    if (denomUpper === "VEN" || denomUpper === "BS" || denomUpper === "BOLIVARES") {
      currencySymbol = "Bs."
    } else if (denomUpper === "USD" || denomUpper === "DOLARES") {
      currencySymbol = "$"
    } else if (denomUpper === "EUR" || denomUpper === "EUROS") {
      currencySymbol = "€"
    } else {
      currencySymbol = denominacion
    }
  }
  
  return currencySymbol ? `${currencySymbol} ${formatted}` : formatted
}

const formatCellValue = (key: string, value: any, row: any): string => {
  // Si es el campo denominacion, mostrarlo como "Bs." siempre (porque todos los montos están en Bs)
  if (key.toLowerCase() === "denominacion") {
    return "Bs."  // Todos los reportes ahora convierten a Bs
  }
  
  // Detectar campos de fecha
  if (key.toLowerCase().includes("fecha") || 
      key.toLowerCase().includes("date") ||
      key.toLowerCase().includes("reserva")) {
    return formatDate(value)
  }
  
  // Detectar campos de moneda/monto (pero no cantidad_vendida, veces_vendido, etc.)
  const isCurrencyField = (key.toLowerCase().includes("monto") ||
      key.toLowerCase().includes("ingresos") ||
      key.toLowerCase().includes("gastado") ||
      (key.toLowerCase().includes("total") && !key.toLowerCase().includes("reservas")) ||
      key.toLowerCase().includes("promedio") ||
      key.toLowerCase().includes("precio")) &&
      !key.toLowerCase().includes("cantidad") &&
      !key.toLowerCase().includes("veces")
  
  if (isCurrencyField) {
    // Todos los montos están en Bs ahora, así que siempre mostrar "Bs."
    return formatCurrency(value, "VEN")
  }
  
  // Detectar campos numéricos (cantidades, IDs, etc.)
  if (typeof value === "number" || (!isNaN(parseFloat(String(value))) && String(value).trim() !== "")) {
    // Si es un número entero, no mostrar decimales
    const num = typeof value === "number" ? value : parseFloat(String(value))
    if (Number.isInteger(num)) {
      return formatNumber(value, 0)
    }
    // Si tiene decimales, mostrar máximo 2
    return formatNumber(value, 2)
  }
  
  // Valores por defecto
  if (value === null || value === undefined) return "-"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState("catalog")
  const [showBuilder, setShowBuilder] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [generandoReporte, setGenerandoReporte] = useState<number | null>(null)
  const [reporteData, setReporteData] = useState<any>(null)
  const [reporteActivo, setReporteActivo] = useState<string | null>(null)

  // Los 5 reportes principales basados en stored procedures de la BD
  const reportCatalog: ReporteDef[] = [
    {
      id: 1,
      name: "Top Destinos Vendidos",
      category: "Destinos",
      description: "Top 10 destinos más vendidos con ingresos en bolívares",
      spName: "rep_top_destinos_vendidos",
      icon: MapPin,
      parametros: {}, // Sin parámetros
    },
    {
      id: 2,
      name: "Órdenes por Período",
      category: "Ventas",
      description: "Análisis completo de órdenes en un período determinado",
      spName: "rep_ventas_periodo",
      icon: DollarSign,
      parametros: {
        fechaInicio: true,
        fechaFin: true,
      },
    },
    {
      id: 3,
      name: "Clientes Más Activos",
      category: "Clientes",
      description: "Ranking de clientes con mayor número de reservas y gastos",
      spName: "rep_clientes_activos",
      icon: Users,
      parametros: {
        fechaInicio: true,
        fechaFin: true,
        limit: true,
      },
    },
    {
      id: 4,
      name: "Servicios Más Populares",
      category: "Operaciones",
      description: "Servicios más vendidos con estadísticas de demanda",
      spName: "rep_servicios_populares",
      icon: Plane,
      parametros: {
        fechaInicio: true,
        fechaFin: true,
        limit: true,
      },
    },
    {
      id: 5,
      name: "Proveedores Más Vendidos",
      category: "Proveedores",
      description: "Ranking de proveedores con más servicios vendidos e ingresos generados",
      spName: "rep_proveedores_mas_vendidos",
      icon: BarChart3,
      parametros: {
        fechaInicio: true,
        fechaFin: true,
        limit: true,
      },
    },
  ]

  // Estado para el modal de parámetros
  const [showParametrosDialog, setShowParametrosDialog] = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteDef | null>(null)
  const [parametrosForm, setParametrosForm] = useState({
    fechaInicio: "",
    fechaFin: "",
    limit: "",
  })

  const generarReporte = async (reporte: ReporteDef, fechaInicio?: string, fechaFin?: string, limit?: number) => {
    setGenerandoReporte(reporte.id)
    setReporteActivo(reporte.spName)
    
    try {
      // Construir URL con parámetros
      const params = new URLSearchParams()
      if (fechaInicio) params.append("fechaInicio", fechaInicio)
      if (fechaFin) params.append("fechaFin", fechaFin)
      if (limit) params.append("limit", limit.toString())

      const url = `/api/reportes/${reporte.spName}?${params.toString()}`
      
      const response = await fetch(url, {
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al generar el reporte")
      }

      const data = await response.json()
      setReporteData(data)
      toast.success(`Reporte "${reporte.name}" generado exitosamente`)
    } catch (error: any) {
      console.error("Error generando reporte:", error)
      toast.error(error.message || "Error al generar el reporte")
      setReporteData(null)
    } finally {
      setGenerandoReporte(null)
    }
  }

  const descargarReporte = async (formato: "json" | "csv" | "pdf" = "json") => {
    if (!reporteData) {
      toast.error("No hay datos para descargar. Genere el reporte primero.")
      return
    }

    try {
      if (formato === "json") {
        const blob = new Blob([JSON.stringify(reporteData, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `reporte-${reporteActivo}-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Reporte descargado en formato JSON")
      } else if (formato === "csv") {
        // Convertir a CSV
        if (!reporteData.datos || reporteData.datos.length === 0) {
          toast.error("No hay datos para convertir a CSV")
          return
        }

        const headers = Object.keys(reporteData.datos[0])
        const csvRows = [
          headers.join(","),
          ...reporteData.datos.map((row: any) =>
            headers.map(header => {
              const value = row[header]
              const formatted = formatCellValue(header, value, row)
              return typeof formatted === "string" ? `"${formatted.replace(/"/g, '""')}"` : formatted
            }).join(",")
          ),
        ]

        const csv = csvRows.join("\n")
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `reporte-${reporteActivo}-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Reporte descargado en formato CSV")
      } else if (formato === "pdf") {
        // Convertir a PDF
        if (!reporteData.datos || reporteData.datos.length === 0) {
          toast.error("No hay datos para convertir a PDF")
          return
        }

        const doc = new jsPDF()
        const reporteNombre = reportCatalog.find(r => r.spName === reporteActivo)?.name || "Reporte"
        
        // Encabezado
        doc.setFontSize(18)
        doc.setTextColor(233, 30, 99) // Color #E91E63
        doc.text(reporteNombre, 14, 20)
        
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        const fechaGen = new Date(reporteData.fechaGeneracion).toLocaleString("es-VE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
        doc.text(`Generado el: ${fechaGen}`, 14, 28)
        doc.text(`Total de registros: ${formatNumber(reporteData.totalRegistros)}`, 14, 34)
        
        // Parámetros si existen
        if (reporteData.parametros && (reporteData.parametros.fechaInicio || reporteData.parametros.fechaFin || reporteData.parametros.limit)) {
          let paramsText = "Parámetros: "
          if (reporteData.parametros.fechaInicio) paramsText += `Desde ${formatDate(reporteData.parametros.fechaInicio)} `
          if (reporteData.parametros.fechaFin) paramsText += `Hasta ${formatDate(reporteData.parametros.fechaFin)} `
          if (reporteData.parametros.limit) paramsText += `Límite: ${reporteData.parametros.limit}`
          doc.text(paramsText, 14, 40)
        }

        // Preparar datos para la tabla con formato
        const headers = Object.keys(reporteData.datos[0]).map(h => 
          h.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
        )
        const rows = reporteData.datos.map((row: any) => 
          Object.entries(row).map(([key, val]) => {
            return formatCellValue(key, val, row)
          })
        )

        // Agregar tabla
        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: reporteData.parametros && (reporteData.parametros.fechaInicio || reporteData.parametros.fechaFin) ? 46 : 40,
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
        doc.save(`reporte-${reporteActivo}-${new Date().toISOString().split("T")[0]}.pdf`)
        toast.success("Reporte descargado en formato PDF")
      }
    } catch (error: any) {
      toast.error(error.message || "Error al descargar el reporte")
    }
  }

  const scheduledReports = [
    {
      id: 1,
      name: "Reporte Ejecutivo Semanal",
      schedule: "Lunes 8:00 AM",
      recipients: "admin@viajesucab.com, gerencia@viajesucab.com",
      format: "PDF",
      status: "active",
    },
    {
      id: 2,
      name: "Análisis de Ventas Mensual",
      schedule: "Primer día del mes 9:00 AM",
      recipients: "ventas@viajesucab.com",
      format: "Excel",
      status: "active",
    },
    {
      id: 3,
      name: "Reporte de Inventario",
      schedule: "Diario 7:00 AM",
      recipients: "operaciones@viajesucab.com",
      format: "CSV",
      status: "paused",
    },
  ]

  const savedReports = [
    {
      id: 1,
      name: "Análisis Q4 2024",
      createdBy: "Admin Principal",
      createdAt: "2025-01-15",
      type: "Ventas por Destino",
    },
    {
      id: 2,
      name: "Campaña Black Friday - Resultados",
      createdBy: "Marketing Manager",
      createdAt: "2024-12-05",
      type: "Marketing",
    },
    {
      id: 3,
      name: "Clientes VIP - Comportamiento",
      createdBy: "Admin Principal",
      createdAt: "2025-01-20",
      type: "Clientes",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reportes y Analytics</h2>
          <p className="text-sm text-muted-foreground">Catálogo de reportes y constructor ad-hoc</p>
        </div>
        <Button onClick={() => setShowBuilder(!showBuilder)} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Reporte Personalizado
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
          <TabsTrigger value="builder">Constructor</TabsTrigger>
          <TabsTrigger value="scheduled">Programados</TabsTrigger>
          <TabsTrigger value="saved">Guardados</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileBarChart className="h-5 w-5 text-[#E91E63]" />
                    Catálogo de Reportes
                  </CardTitle>
                  <CardDescription>Reportes predefinidos listos para ejecutar</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar reportes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-[250px]"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reportCatalog.map((report) => {
                  const Icon = report.icon
                  return (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E91E63]/10">
                            <Icon className="h-5 w-5 text-[#E91E63]" />
                          </div>
                          <Badge variant="outline">{report.category}</Badge>
                        </div>
                        <CardTitle className="text-base">{report.name}</CardTitle>
                        <CardDescription className="text-sm">{report.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            <span className="font-medium">SP:</span> {report.spName}
                          </p>
                          {reporteData && reporteActivo === report.spName && (
                            <p className="text-green-600 font-medium">
                              {reporteData.totalRegistros} registros generados
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 gap-2 bg-transparent"
                            onClick={() => {
                              // Si el reporte no tiene parámetros, ejecutar directamente
                              if (!report.parametros || Object.keys(report.parametros).length === 0) {
                                generarReporte(report)
                              } else {
                                setReporteSeleccionado(report)
                                setParametrosForm({
                                  fechaInicio: "",
                                  fechaFin: "",
                                  limit: "",
                                })
                                setShowParametrosDialog(true)
                              }
                            }}
                            disabled={generandoReporte === report.id}
                          >
                            {generandoReporte === report.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                            {generandoReporte === report.id ? "Generando..." : "Ejecutar"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 bg-transparent"
                            onClick={() => descargarReporte("pdf")}
                            disabled={!reporteData || reporteActivo !== report.spName}
                            title="Descargar PDF"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader className="bg-slate-900 text-white">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Constructor de Reportes Ad-Hoc
              </CardTitle>
              <CardDescription className="text-slate-300">
                Crea reportes personalizados con los datos que necesites
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="report-name">Nombre del Reporte</Label>
                <Input id="report-name" placeholder="Ej: Análisis de Ventas Q1 2025" />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Fuente de Datos</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox id="data-bookings" />
                    <label htmlFor="data-bookings" className="text-sm font-medium cursor-pointer">
                      Reservas
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox id="data-customers" />
                    <label htmlFor="data-customers" className="text-sm font-medium cursor-pointer">
                      Clientes
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox id="data-services" />
                    <label htmlFor="data-services" className="text-sm font-medium cursor-pointer">
                      Servicios
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox id="data-promotions" />
                    <label htmlFor="data-promotions" className="text-sm font-medium cursor-pointer">
                      Promociones
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox id="data-payments" />
                    <label htmlFor="data-payments" className="text-sm font-medium cursor-pointer">
                      Pagos
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox id="data-cancellations" />
                    <label htmlFor="data-cancellations" className="text-sm font-medium cursor-pointer">
                      Cancelaciones
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Métricas a Incluir</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox id="metric-count" defaultChecked />
                    <label htmlFor="metric-count" className="text-sm font-medium cursor-pointer">
                      Cantidad
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox id="metric-revenue" defaultChecked />
                    <label htmlFor="metric-revenue" className="text-sm font-medium cursor-pointer">
                      Ingresos
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox id="metric-avg" />
                    <label htmlFor="metric-avg" className="text-sm font-medium cursor-pointer">
                      Promedio
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox id="metric-growth" />
                    <label htmlFor="metric-growth" className="text-sm font-medium cursor-pointer">
                      Crecimiento %
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox id="metric-conversion" />
                    <label htmlFor="metric-conversion" className="text-sm font-medium cursor-pointer">
                      Tasa Conversión
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox id="metric-roi" />
                    <label htmlFor="metric-roi" className="text-sm font-medium cursor-pointer">
                      ROI
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date-from">Fecha Desde</Label>
                  <Input id="date-from" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Fecha Hasta</Label>
                  <Input id="date-to" type="date" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Filtros</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="filter-destination">Destino</Label>
                    <Select>
                      <SelectTrigger id="filter-destination">
                        <SelectValue placeholder="Todos los destinos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los destinos</SelectItem>
                        <SelectItem value="punta-cana">Punta Cana</SelectItem>
                        <SelectItem value="cancun">Cancún</SelectItem>
                        <SelectItem value="madrid">Madrid</SelectItem>
                        <SelectItem value="buenos-aires">Buenos Aires</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-service">Tipo de Servicio</Label>
                    <Select>
                      <SelectTrigger id="filter-service">
                        <SelectValue placeholder="Todos los servicios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los servicios</SelectItem>
                        <SelectItem value="flights">Vuelos</SelectItem>
                        <SelectItem value="hotels">Hoteles</SelectItem>
                        <SelectItem value="packages">Paquetes</SelectItem>
                        <SelectItem value="cruises">Cruceros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-payment">Método de Pago</Label>
                    <Select>
                      <SelectTrigger id="filter-payment">
                        <SelectValue placeholder="Todos los métodos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los métodos</SelectItem>
                        <SelectItem value="credit-card">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="bank-transfer">Transferencia</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="crypto">Criptomonedas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-status">Estado</Label>
                    <Select>
                      <SelectTrigger id="filter-status">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="confirmed">Confirmadas</SelectItem>
                        <SelectItem value="pending">Pendientes</SelectItem>
                        <SelectItem value="cancelled">Canceladas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Agrupación</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar agrupación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Por Día</SelectItem>
                    <SelectItem value="week">Por Semana</SelectItem>
                    <SelectItem value="month">Por Mes</SelectItem>
                    <SelectItem value="destination">Por Destino</SelectItem>
                    <SelectItem value="service">Por Tipo de Servicio</SelectItem>
                    <SelectItem value="customer">Por Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Tipo de Visualización</Label>
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <BarChart3 className="h-5 w-5 text-[#E91E63]" />
                    <label className="text-sm font-medium cursor-pointer">Barras</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <LineChart className="h-5 w-5 text-[#E91E63]" />
                    <label className="text-sm font-medium cursor-pointer">Líneas</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <PieChart className="h-5 w-5 text-[#E91E63]" />
                    <label className="text-sm font-medium cursor-pointer">Circular</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <FileBarChart className="h-5 w-5 text-[#E91E63]" />
                    <label className="text-sm font-medium cursor-pointer">Tabla</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1 bg-slate-900 hover:bg-slate-800 gap-2">
                  <Play className="h-4 w-4" />
                  Generar Reporte
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Save className="h-4 w-4" />
                  Guardar Configuración
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#E91E63]" />
                    Vista Previa del Reporte
                  </CardTitle>
                  <CardDescription>
                    {reporteData 
                      ? `Reporte: ${reporteData.reporte} - ${reporteData.totalRegistros} registros`
                      : "Los datos se actualizarán al generar el reporte"}
                  </CardDescription>
                </div>
                {reporteData && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => descargarReporte("pdf")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => descargarReporte("csv")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => descargarReporte("json")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {reporteData && reporteData.datos && reporteData.datos.length > 0 ? (
                <div className="space-y-4">
                  {/* Resumen */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Registros</p>
                      <p className="text-2xl font-bold">{reporteData.totalRegistros}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha Generación</p>
                      <p className="text-sm font-medium">
                        {new Date(reporteData.fechaGeneracion).toLocaleString("es-VE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Parámetros</p>
                      <p className="text-xs">
                        {reporteData.parametros.fechaInicio && `Desde: ${formatDate(reporteData.parametros.fechaInicio)}`}
                        {reporteData.parametros.fechaFin && ` Hasta: ${formatDate(reporteData.parametros.fechaFin)}`}
                        {reporteData.parametros.limit && ` Límite: ${reporteData.parametros.limit}`}
                      </p>
                    </div>
                  </div>

                  {/* Tabla de datos */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                          <tr>
                            {Object.keys(reporteData.datos[0]).map((key) => {
                              // Traducir nombres de columnas comunes
                              const columnNames: Record<string, string> = {
                                id_venta: "ID Orden",
                                fecha_venta: "Fecha Orden",
                                cliente_nombre: "Cliente",
                                cliente_ci: "Cédula",
                                monto_total: "Monto Total",
                                cantidad_items: "Items",
                                estado: "Estado",
                                denominacion: "Moneda",
                                id_cliente: "ID Cliente",
                                nombre_completo: "Nombre Completo",
                                ci: "Cédula",
                                total_reservas: "Total Reservas",
                                monto_total_gastado: "Monto Total Gastado",
                                ultima_reserva: "Última Reserva",
                                primera_reserva: "Primera Reserva",
                                nombre_destino: "Destino",
                                cantidad_vendida: "Cantidad Vendida",
                                ingresos_en_bs: "Ingresos",
                                id_servicio: "ID Servicio",
                                nombre_servicio: "Servicio",
                                tipo_servicio: "Tipo",
                                nombre_proveedor: "Proveedor",
                                lugar_destino: "Destino",
                                veces_vendido: "Veces Vendido",
                                ingresos_totales: "Ingresos Totales",
                                precio_promedio: "Precio Promedio",
                                id_proveedor: "ID Proveedor",
                                tipo_proveedor: "Tipo Proveedor",
                                cantidad_servicios_vendidos: "Servicios Vendidos",
                                promedio_por_servicio: "Promedio por Servicio",
                              }
                              
                              const displayName = columnNames[key] || key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
                              
                              return (
                                <th key={key} className="px-4 py-2 text-left font-semibold text-xs uppercase">
                                  {displayName}
                                </th>
                              )
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {reporteData.datos.map((row: any, idx: number) => (
                            <tr key={idx} className="border-t hover:bg-slate-50 dark:hover:bg-slate-900">
                              {Object.entries(row).map(([key, value]: [string, any], colIdx: number) => (
                                <td key={colIdx} className="px-4 py-2 text-xs">
                                  {formatCellValue(key, value, row)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      {generandoReporte ? "Generando reporte..." : "Ejecute un reporte para ver los resultados"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#E91E63]" />
                    Reportes Programados
                  </CardTitle>
                  <CardDescription>Reportes que se generan y envían automáticamente</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Programar Reporte
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{report.name}</h4>
                        <Badge className={report.status === "active" ? "bg-green-500" : "bg-amber-500"}>
                          {report.status === "active" ? "Activo" : "Pausado"}
                        </Badge>
                        <Badge variant="outline">{report.format}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {report.schedule}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {report.recipients}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Play className="h-3 w-3" />
                      Ejecutar Ahora
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      Editar
                    </Button>
                    {report.status === "active" ? (
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        Pausar
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        Activar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5 text-[#E91E63]" />
                Reportes Guardados
              </CardTitle>
              <CardDescription>Reportes personalizados que has creado anteriormente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold">{report.name}</h4>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Creado por {report.createdBy} el {report.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Play className="h-3 w-3" />
                        Ejecutar
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Download className="h-3 w-3" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para parámetros del reporte */}
      <Dialog open={showParametrosDialog} onOpenChange={setShowParametrosDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reporteSeleccionado && (
                <>
                  <reporteSeleccionado.icon className="h-5 w-5 text-[#E91E63]" />
                  Configurar {reporteSeleccionado.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {reporteSeleccionado?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {reporteSeleccionado?.parametros?.fechaInicio && (
              <div className="space-y-2">
                <Label htmlFor="fecha-inicio">
                  Fecha Inicio <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Input
                  id="fecha-inicio"
                  type="date"
                  value={parametrosForm.fechaInicio}
                  onChange={(e) => setParametrosForm({ ...parametrosForm, fechaInicio: e.target.value })}
                  placeholder="YYYY-MM-DD"
                />
                <p className="text-xs text-muted-foreground">
                  Dejar vacío para incluir todos los registros desde el inicio
                </p>
              </div>
            )}

            {reporteSeleccionado?.parametros?.fechaFin && (
              <div className="space-y-2">
                <Label htmlFor="fecha-fin">
                  Fecha Fin <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Input
                  id="fecha-fin"
                  type="date"
                  value={parametrosForm.fechaFin}
                  onChange={(e) => setParametrosForm({ ...parametrosForm, fechaFin: e.target.value })}
                  placeholder="YYYY-MM-DD"
                  min={parametrosForm.fechaInicio || undefined}
                />
                <p className="text-xs text-muted-foreground">
                  Dejar vacío para incluir todos los registros hasta el final
                </p>
              </div>
            )}

            {reporteSeleccionado?.parametros?.limit && (
              <div className="space-y-2">
                <Label htmlFor="limit">
                  Límite de Resultados <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  value={parametrosForm.limit}
                  onChange={(e) => setParametrosForm({ ...parametrosForm, limit: e.target.value })}
                  placeholder="Ej: 10, 20, 50..."
                />
                <p className="text-xs text-muted-foreground">
                  Número máximo de registros a mostrar. Dejar vacío para mostrar todos.
                </p>
              </div>
            )}

            {(!reporteSeleccionado?.parametros?.fechaInicio && 
              !reporteSeleccionado?.parametros?.fechaFin && 
              !reporteSeleccionado?.parametros?.limit) && (
              <div className="text-sm text-muted-foreground text-center py-4">
                Este reporte no requiere parámetros adicionales.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowParametrosDialog(false)
                setParametrosForm({ fechaInicio: "", fechaFin: "", limit: "" })
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!reporteSeleccionado) return
                
                const fechaInicio = parametrosForm.fechaInicio || undefined
                const fechaFin = parametrosForm.fechaFin || undefined
                const limit = parametrosForm.limit ? parseInt(parametrosForm.limit, 10) : undefined
                
                setShowParametrosDialog(false)
                generarReporte(reporteSeleccionado, fechaInicio, fechaFin, limit)
                setParametrosForm({ fechaInicio: "", fechaFin: "", limit: "" })
              }}
              className="bg-[#E91E63] hover:bg-[#E91E63]/90"
            >
              <Play className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
