"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plane,
  Calendar,
  MapPin,
  Clock,
  Download,
  Heart,
  Bell,
  Award,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Package,
  TrendingUp,
  XCircle,
  Leaf,
  MessageSquare,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ProfileManagement } from "@/components/profile-management"
import { CancellationsRefunds } from "@/components/cancellations-refunds"
import { Wishlist } from "@/components/wishlist"
import { SustainabilityHistory } from "@/components/sustainability-history"
import { MisViajesList } from "@/components/mis-viajes-list"
import { ClaimsSurveys } from "@/components/claims-surveys"

export function DashboardContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["overview", "trips", "miles", "wishlist", "sustainability", "notifications", "profile", "cancellations", "reclamos"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="bg-muted/30 min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Perfil Viajero 360°</h1>
              <p className="text-white/90 text-lg">Tu centro de control de viajes personalizado</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-white/80">Bienvenido</p>
                <p className="font-semibold text-lg">Juan Pérez</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button
                    variant={activeTab === "overview" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("overview")}
                  >
                    <Plane className="h-4 w-4" />
                    Resumen
                  </Button>
                  <Button
                    variant={activeTab === "trips" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("trips")}
                  >
                    <Calendar className="h-4 w-4" />
                    Mis Viajes
                  </Button>
                  <Button
                    variant={activeTab === "history" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("history")}
                  >
                    <Clock className="h-4 w-4" />
                    Historial
                  </Button>
                  <Button
                    variant={activeTab === "miles" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("miles")}
                  >
                    <Award className="h-4 w-4" />
                    Millas
                  </Button>
                  <Button
                    variant={activeTab === "wishlist" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("wishlist")}
                  >
                    <Heart className="h-4 w-4" />
                    Lista de Deseos
                  </Button>
                  <Button
                    variant={activeTab === "sustainability" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("sustainability")}
                  >
                    <Leaf className="h-4 w-4" />
                    Sostenibilidad
                  </Button>
                  <Button
                    variant={activeTab === "notifications" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="h-4 w-4" />
                    Notificaciones
                    <Badge variant="destructive" className="ml-auto">
                      3
                    </Badge>
                  </Button>
                  <Button
                    variant={activeTab === "profile" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="h-4 w-4" />
                    Gestión de Perfil
                  </Button>
                  <Button
                    variant={activeTab === "cancellations" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("cancellations")}
                  >
                    <XCircle className="h-4 w-4" />
                    Cancelaciones
                  </Button>
                  <Button
                    variant={activeTab === "reclamos" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("reclamos")}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Reclamos
                  </Button>
                  <div className="my-4 border-t" />
                  <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                    <a href="/preferencias">
                      <Settings className="h-4 w-4" />
                      Configuración
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Mobile Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="lg:hidden mb-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="trips">Viajes</TabsTrigger>
                <TabsTrigger value="wishlist">Deseos</TabsTrigger>
                <TabsTrigger value="profile">Perfil</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Viajes Próximos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">2</div>
                      <p className="text-xs text-muted-foreground mt-1">Próximos 3 meses</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Millas Acumuladas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#E91E63]">12,450</div>
                      <p className="text-xs text-muted-foreground mt-1">+850 este mes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Destinos Visitados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground mt-1">En 2025</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Upcoming Trips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5 text-[#E91E63]" />
                      Viajes Próximos
                    </CardTitle>
                    <CardDescription>Tus próximas aventuras confirmadas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">Punta Cana, República Dominicana</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              Resort Todo Incluido - 7 noches
                            </p>
                          </div>
                          <Badge className="bg-green-500">Confirmado</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            15 - 22 Marzo 2025
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />2 adultos
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" className="bg-[#E91E63] hover:bg-[#E91E63]/90">
                          Ver Detalles
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Voucher
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">Madrid, España</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              City Tour + Hotel 4 estrellas
                            </p>
                          </div>
                          <Badge variant="secondary">Pendiente Pago</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            10 - 17 Junio 2025
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />2 adultos, 1 niño
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" className="bg-[#E91E63] hover:bg-[#E91E63]/90">
                          Completar Pago
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                        <Button size="sm" variant="outline">
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-[#E91E63]" />
                      Notificaciones Recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nueva promoción disponible</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          50% descuento en paquetes a Europa - Válido hasta el 31 de marzo
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Recordatorio de documentos</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Verifica tu pasaporte para el viaje a Punta Cana
                        </p>
                      </div>
                    </div>
                    <Button variant="link" className="w-full text-[#E91E63]">
                      Ver todas las notificaciones
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Trips Tab */}
            {activeTab === "trips" && <MisViajesList />}

            {/* History Tab */}
            {activeTab === "history" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#E91E63]" />
                    Historial de Reservas
                  </CardTitle>
                  <CardDescription>Tus viajes anteriores y facturas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { destination: "Cancún, México", date: "Enero 2025", cost: "$2,450", status: "Completado" },
                      {
                        destination: "Buenos Aires, Argentina",
                        date: "Diciembre 2024",
                        cost: "$1,890",
                        status: "Completado",
                      },
                      { destination: "Barcelona, España", date: "Octubre 2024", cost: "$3,200", status: "Completado" },
                    ].map((trip, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{trip.destination}</h4>
                          <p className="text-sm text-muted-foreground">{trip.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{trip.cost}</p>
                          <Badge variant="outline" className="mt-1">
                            {trip.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="ghost" className="ml-4">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Miles Tab */}
            {activeTab === "miles" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#E91E63]" />
                    Millas Acumuladas
                  </CardTitle>
                  <CardDescription>Canjea tus millas por descuentos y beneficios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-6xl font-bold text-[#E91E63] mb-2">12,450</div>
                    <p className="text-muted-foreground mb-6">Millas disponibles</p>
                    <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
                      <Card className="border-2">
                        <CardContent className="pt-6">
                          <Package className="h-8 w-8 text-[#E91E63] mx-auto mb-3" />
                          <h4 className="font-semibold mb-2">Descuento $100</h4>
                          <p className="text-sm text-muted-foreground mb-4">5,000 millas</p>
                          <Button size="sm" variant="outline" className="w-full bg-transparent">
                            Canjear
                          </Button>
                        </CardContent>
                      </Card>
                      <Card className="border-2">
                        <CardContent className="pt-6">
                          <Plane className="h-8 w-8 text-[#E91E63] mx-auto mb-3" />
                          <h4 className="font-semibold mb-2">Upgrade de Clase</h4>
                          <p className="text-sm text-muted-foreground mb-4">10,000 millas</p>
                          <Button size="sm" variant="outline" className="w-full bg-transparent">
                            Canjear
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && <Wishlist />}

            {/* Sustainability Tab */}
            {activeTab === "sustainability" && <SustainabilityHistory />}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[#E91E63]" />
                    Notificaciones
                  </CardTitle>
                  <CardDescription>Mantente al día con tus viajes y promociones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nueva promoción disponible</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        50% descuento en paquetes a Europa - Válido hasta el 31 de marzo
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Recordatorio de documentos</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Verifica tu pasaporte para el viaje a Punta Cana (15 de marzo)
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Hace 1 día</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 border rounded-lg">
                    <Plane className="h-5 w-5 text-[#E91E63] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Confirmación de vuelo</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tu vuelo a Punta Cana ha sido confirmado. Código: VU2025
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Hace 3 días</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Management Tab */}
            {activeTab === "profile" && <ProfileManagement />}

            {/* Cancellations Tab */}
            {activeTab === "cancellations" && <CancellationsRefunds />}

            {/* Reclamos Tab */}
            {activeTab === "reclamos" && <ClaimsSurveys />}
          </div>
        </div>
      </div>
    </div>
  )
}
