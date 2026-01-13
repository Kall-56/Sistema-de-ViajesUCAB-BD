"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  TrendingUp,
  MapPin,
  Settings,
  LogOut,
  Calendar,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Tag,
  RefreshCw,
  FileText,
  UserCog,
  Megaphone,
  Package,
  Plane,
  Utensils,
  Leaf,
  HeadphonesIcon,
  Plug,
  FileBarChart,
  Download,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserRoleManagement } from "@/components/user-role-management"
import { PromotionManagement } from "@/components/promotion-management"
import { ExchangeRateManagement } from "@/components/exchange-rate-management"
import { MarketingCampaigns } from "@/components/marketing-campaigns"
import { PackagesManagement } from "@/components/packages-management"
import { ServicesManagement } from "@/components/services-management"
import { RestriccionesManagement } from "@/components/restricciones-management"
import { RestaurantsManagement } from "@/components/restaurants-management"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SustainabilityManagement } from "@/components/sustainability-management"
import { PostsaleManagement } from "@/components/postsale-management"
import { IntegrationsManagement } from "@/components/integrations-management"
import { ReportsAnalytics } from "@/components/reports-analytics"
import { ItinerariesManagement } from "@/components/itineraries-management"

type UserInfo = {
  id: number;
  email: string;
  rolId: number;
  rolNombre: string;
  nombre: string;
  tipoUsuario: string;
};

export function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState("30")
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    async function loadUserInfo() {
      setLoadingUser(true)
      try {
        const r = await fetch("/api/auth/user-info", { cache: "no-store" })
        const data = await r.json()
        if (r.ok && data?.user) {
          setUserInfo(data.user)
        }
      } catch (err) {
        console.error("Error cargando información del usuario:", err)
      } finally {
        setLoadingUser(false)
      }
    }
    loadUserInfo()
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("Error cerrando sesión:", err)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Panel de Administrador</h1>
                <p className="text-sm text-slate-400">ViajesUCAB - Sistema de Gestión</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {loadingUser ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  <span className="text-sm text-slate-400">Cargando...</span>
                </div>
              ) : userInfo ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <p className="text-sm font-medium">{userInfo.nombre}</p>
                      <Badge className="bg-[#E91E63] text-white border-0">
                        {userInfo.rolNombre || "Admin"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{userInfo.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-slate-800"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    title="Cerrar Sesión"
                  >
                    {loggingOut ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <LogOut className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-700 text-white">Admin</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-slate-800"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    title="Cerrar Sesión"
                  >
                    {loggingOut ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <LogOut className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button
                    variant={activeTab === "overview" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("overview")}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </Button>

                  <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Gestión de Contenido
                    </p>
                  </div>

                  <Button
                    variant={activeTab === "packages" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("packages")}
                  >
                    <Package className="h-4 w-4" />
                    Paquetes Turísticos
                  </Button>

                  <Button
                    variant={activeTab === "restricciones" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("restricciones")}
                  >
                    <AlertCircle className="h-4 w-4" />
                    Restricciones
                  </Button>

                  <Button
                    variant={activeTab === "services" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("services")}
                  >
                    <Plane className="h-4 w-4" />
                    Servicios
                  </Button>

                  <Button
                    variant={activeTab === "itineraries" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("itineraries")}
                  >
                    <Calendar className="h-4 w-4" />
                    Itinerarios
                  </Button>

                  <Button
                    variant={activeTab === "restaurants" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("restaurants")}
                  >
                    <Utensils className="h-4 w-4" />
                    Restaurantes
                  </Button>

                  <Button
                    variant={activeTab === "sustainability" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("sustainability")}
                  >
                    <Leaf className="h-4 w-4" />
                    Sostenibilidad
                  </Button>

                  <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Configuración
                    </p>
                  </div>

                  <Button
                    variant={activeTab === "promotions" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("promotions")}
                  >
                    <Tag className="h-4 w-4" />
                    Promociones
                  </Button>

                  <Button
                    variant={activeTab === "exchange" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("exchange")}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Tasas de Cambio
                  </Button>

                  <Button
                    variant={activeTab === "integrations" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("integrations")}
                  >
                    <Plug className="h-4 w-4" />
                    Integraciones
                  </Button>

                  <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Gestión de Usuarios
                    </p>
                  </div>

                  <Button
                    variant={activeTab === "users" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("users")}
                  >
                    <UserCog className="h-4 w-4" />
                    Usuarios y Roles
                  </Button>

                  <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Postventa
                    </p>
                  </div>

                  <Button
                    variant={activeTab === "postsale" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("postsale")}
                  >
                    <HeadphonesIcon className="h-4 w-4" />
                    Gestión Postventa
                  </Button>

                  <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Marketing y Reportes
                    </p>
                  </div>

                  <Button
                    variant={activeTab === "marketing" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("marketing")}
                  >
                    <Megaphone className="h-4 w-4" />
                    Marketing
                  </Button>

                  <Button
                    variant={activeTab === "reports" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("reports")}
                  >
                    <FileBarChart className="h-4 w-4" />
                    Reportes
                  </Button>

                  <Button
                    variant={activeTab === "audit" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("audit")}
                  >
                    <FileText className="h-4 w-4" />
                    Auditoría
                  </Button>

                  <div className="my-4 border-t" />
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Dashboard Ejecutivo</h2>
                    <p className="text-sm text-muted-foreground">Métricas clave y rendimiento del negocio</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Últimos 7 días</SelectItem>
                        <SelectItem value="30">Últimos 30 días</SelectItem>
                        <SelectItem value="90">Últimos 90 días</SelectItem>
                        <SelectItem value="365">Último año</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Reservas Hoy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">24</div>
                      <p className="text-xs text-green-600 mt-1">+12% vs ayer</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos del Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">$145,890</div>
                      <p className="text-xs text-green-600 mt-1">+8% vs mes anterior</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Usuarios Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">1,248</div>
                      <p className="text-xs text-blue-600 mt-1">+156 esta semana</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Tasa Conversión</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">68%</div>
                      <p className="text-xs text-green-600 mt-1">+5% vs promedio</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Cancelaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-amber-600 mt-1">3.2% del total</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Millas Emitidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">45,230</div>
                      <p className="text-xs text-blue-600 mt-1">+18% vs mes anterior</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Millas Canjeadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12,450</div>
                      <p className="text-xs text-green-600 mt-1">27.5% de uso</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#E91E63]" />
                      Mix de Métodos de Pago
                    </CardTitle>
                    <CardDescription>Distribución de pagos - Últimos 30 días</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { method: "Tarjeta de Crédito", percentage: 45, amount: "$65,650", color: "bg-blue-500" },
                        { method: "Transferencia Bancaria", percentage: 28, amount: "$40,850", color: "bg-green-500" },
                        { method: "PayPal", percentage: 15, amount: "$21,880", color: "bg-purple-500" },
                        { method: "Criptomonedas (USDT)", percentage: 8, amount: "$11,670", color: "bg-amber-500" },
                        {
                          method: "Combinado (Tarjeta + Millas)",
                          percentage: 4,
                          amount: "$5,840",
                          color: "bg-pink-500",
                        },
                      ].map((payment, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{payment.method}</span>
                            <span className="text-muted-foreground">
                              {payment.amount} ({payment.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${payment.color}`} style={{ width: `${payment.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Destinations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#E91E63]" />
                      Destinos Más Vendidos
                    </CardTitle>
                    <CardDescription>Últimos 30 días</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Punta Cana, República Dominicana", sales: 145, revenue: "$42,350" },
                        { name: "Cancún, México", sales: 128, revenue: "$38,240" },
                        { name: "Madrid, España", sales: 96, revenue: "$52,800" },
                        { name: "Buenos Aires, Argentina", sales: 84, revenue: "$28,560" },
                      ].map((dest, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold">{dest.name}</p>
                            <p className="text-sm text-muted-foreground">{dest.sales} reservas</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#E91E63]">{dest.revenue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-[#E91E63]" />
                      Rendimiento de Promociones
                    </CardTitle>
                    <CardDescription>Promociones activas y su impacto</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "50% OFF Europa", bookings: 89, revenue: "$42,350", status: "Activa" },
                        { name: "3x2 Caribe", bookings: 67, revenue: "$28,240", status: "Activa" },
                        { name: "Early Bird Verano", bookings: 45, revenue: "$19,800", status: "Activa" },
                      ].map((promo, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{promo.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {promo.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{promo.bookings} reservas generadas</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#E91E63]">{promo.revenue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#E91E63]" />
                      Actividad Reciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          action: "Nueva reserva confirmada",
                          user: "Juan Pérez",
                          time: "Hace 5 min",
                          status: "success",
                        },
                        {
                          action: "Promoción activada: 50% OFF Europa",
                          user: "Admin Principal",
                          time: "Hace 1 hora",
                          status: "info",
                        },
                        {
                          action: "Cancelación procesada",
                          user: "María González",
                          time: "Hace 2 horas",
                          status: "warning",
                        },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          {activity.status === "success" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          ) : activity.status === "warning" ? (
                            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.user} • {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Packages and Services CRUD modules */}
            {activeTab === "packages" && <PackagesManagement />}
            {activeTab === "restricciones" && <RestriccionesManagement />}
            {activeTab === "services" && <ServicesManagement />}
            {activeTab === "itineraries" && <ItinerariesManagement />}

            {/* Restaurants Management */}
            {activeTab === "restaurants" && <RestaurantsManagement />}

            {/* Sustainability Management */}
            {activeTab === "sustainability" && <SustainabilityManagement />}

            {/* Exchange Rates Tab */}
            {activeTab === "exchange" && <ExchangeRateManagement />}

            {/* Integrations Management */}
            {activeTab === "integrations" && <IntegrationsManagement />}

            {/* Postsale Management */}
            {activeTab === "postsale" && <PostsaleManagement />}

            {/* Promotions Tab */}
            {activeTab === "promotions" && <PromotionManagement />}

            {/* Marketing Tab */}
            {activeTab === "marketing" && <MarketingCampaigns />}

            {/* Audit Tab */}
            {activeTab === "audit" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#E91E63]" />
                    Registro de Auditoría
                  </CardTitle>
                  <CardDescription>Historial de acciones en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        user: "admin@viajesucab.com",
                        action: "Actualizó tasa de cambio USD",
                        timestamp: "2025-02-10 14:30:25",
                        ip: "192.168.1.100",
                      },
                      {
                        user: "agente01@viajesucab.com",
                        action: "Creó nueva promoción: 50% OFF Europa",
                        timestamp: "2025-02-10 13:15:10",
                        ip: "192.168.1.105",
                      },
                      {
                        user: "admin@viajesucab.com",
                        action: "Suspendió cuenta de usuario: user123",
                        timestamp: "2025-02-10 11:45:00",
                        ip: "192.168.1.100",
                      },
                    ].map((log, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{log.action}</p>
                          <Badge variant="outline">{log.user}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {log.timestamp} • IP: {log.ip}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && <ReportsAnalytics />}

            {/* Users and Roles Tab */}
            {activeTab === "users" && <UserRoleManagement />}
          </div>
        </div>
      </div>
    </div>
  )
}
