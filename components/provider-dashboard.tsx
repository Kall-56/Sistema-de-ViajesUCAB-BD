"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Plane,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Info,
  PlaneIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Este dashboard asume:
 * - Proveedor logueado (rolId=2) con cookie viajesucab_session
 * - API:
 *   - GET/POST:  /api/proveedor/aerolineas        (list/create SOLO proveedor)
 *   - GET/PUT/DELETE: /api/aerolineas/[id]       (detalle/editar/eliminar con ownership check en API)
 *   - (Opcional) GET: /api/proveedor/me          (para mostrar nombre del proveedor)
 */

type Lugar = {
  id: number;
  nombre: string;
};

type AerolineaRow = {
  id: number;
  nombre: string;
  descripcion: string;
  costo_servicio?: number;
  denominacion?: string;
  millas_otorgadas?: number;
  clasificacion?: number | null;
  fk_lugar?: number;
  fk_proveedor?: number;
  lugar_nombre?: string;
};

type AerolineaDetalle = {
  nombre: string;
  descripcion: string;
  costo_servicio: number;
  costo_compensacion: number;
  denominacion: string;
  millas_otorgadas: number;
  id_lugar: number;
  id_proveedor: number;
  tipo_avion: string;
  cupo: number;
  nombre_terminal: string;
  lugar_terminal: number;
  links_imagenes: string[];
};

function parseLinks(text: string): string[] {
  // Permite pegar enlaces separados por coma o saltos de línea
  return text
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "services" | "availability" | "pricing"
  >("services");

  // Header (nombre proveedor)
  const [proveedorNombre, setProveedorNombre] = useState<string | null>(null);

  // Listado
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aerolineas, setAerolineas] = useState<AerolineaRow[]>([]);

  // Lugares para selects
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loadingLugares, setLoadingLugares] = useState(false);

  // Crear
  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [c_nombre, setCNombre] = useState("");
  const [c_descripcion, setCDescripcion] = useState("");
  const [c_costoServicio, setCCostoServicio] = useState<number | "">("");
  const [c_costoCompensacion, setCCostoCompensacion] = useState<number | "">(
    ""
  );
  const [c_denominacion, setCDenominacion] = useState("USD");
  const [c_millas, setCMillas] = useState<number | "">("");
  const [c_idLugar, setCIdLugar] = useState<string>("");
  const [c_tipoAvion, setCTipoAvion] = useState("");
  const [c_cupo, setCCupo] = useState<number | "">("");
  const [c_nombreTerminal, setCNombreTerminal] = useState("");
  const [c_lugarTerminal, setCLugarTerminal] = useState<string>("");
  const [c_linksTxt, setCLinksTxt] = useState("");

  // Editar
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [e, setE] = useState<AerolineaDetalle | null>(null);
  const [e_linksTxt, setELinksTxt] = useState("");

  const stats = useMemo(() => {
    // Stats simples basadas en cantidad
    const total = aerolineas.length;
    return {
      totalServicios: total,
      // placeholders: ajustas luego si quieres
      reservasActivas: 0,
      ingresosMes: 0,
      ocupacion: 0,
    };
  }, [aerolineas]);

  async function fetchLugares() {
    setLoadingLugares(true);
    try {
      const r = await fetch("/api/lugares", { cache: "no-store" });
      if (!r.ok) throw new Error("Error cargando lugares");
      const data = await r.json();
      setLugares(Array.isArray(data?.lugares) ? data.lugares : []);
    } catch (err: any) {
      setError(err?.message ?? "Error cargando lugares");
    } finally {
      setLoadingLugares(false);
    }
  }

  async function fetchProveedorNombre() {
    // Si tienes /api/proveedor/me, úsalo para badge en header
    try {
      const r = await fetch("/api/proveedor/me", { cache: "no-store" });
      if (!r.ok) return;
      const data = await r.json();
      if (data?.nombre_proveedor)
        setProveedorNombre(String(data.nombre_proveedor));
      else if (data?.nombreProveedor)
        setProveedorNombre(String(data.nombreProveedor));
    } catch {
      // silencioso
    }
  }

  async function fetchAerolineas() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/proveedor/aerolineas", { cache: "no-store" });
      const data = await r.json();

      if (!r.ok) throw new Error(data?.error ?? "Error listando aerolíneas");
      setAerolineas(Array.isArray(data?.aerolineas) ? data.aerolineas : []);
    } catch (err: any) {
      setError(err?.message ?? "Error");
      setAerolineas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProveedorNombre();
    fetchAerolineas();
    fetchLugares();
  }, []);

  function resetCreateForm() {
    setCNombre("");
    setCDescripcion("");
    setCCostoServicio("");
    setCCostoCompensacion("");
    setCDenominacion("USD");
    setCMillas("");
    setCIdLugar("");
    setCTipoAvion("");
    setCCupo("");
    setCNombreTerminal("");
    setCLugarTerminal("");
    setCLinksTxt("");
  }

  async function onCreate() {
    setCreateSubmitting(true);
    setError(null);
    try {
      const idLugarNum = Number(c_idLugar);
      const lugarTerminalNum = Number(c_lugarTerminal);

      const payload = {
        nombre: c_nombre,
        descripcion: c_descripcion,
        costoServicio: Number(c_costoServicio),
        costoCompensacion: Number(c_costoCompensacion),
        denominacion: c_denominacion,
        millasOtorgadas: Number(c_millas),
        idLugar: idLugarNum,
        tipoAvion: c_tipoAvion,
        cupo: Number(c_cupo),
        nombreTerminal: c_nombreTerminal,
        lugarTerminal: lugarTerminalNum,
        linksImagenes: parseLinks(c_linksTxt),
      };

      // Validación mínima para evitar "unknown/empty"
      if (
        !payload.nombre ||
        !payload.descripcion ||
        !Number.isFinite(payload.costoServicio) ||
        !Number.isFinite(payload.costoCompensacion) ||
        !payload.denominacion ||
        !Number.isFinite(payload.millasOtorgadas) ||
        !Number.isInteger(idLugarNum) ||
        !payload.tipoAvion ||
        !Number.isInteger(payload.cupo) ||
        !payload.nombreTerminal ||
        !Number.isInteger(lugarTerminalNum)
      ) {
        throw new Error(
          "Completa todos los campos requeridos."
        );
      }

      const r = await fetch("/api/proveedor/aerolineas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Error creando aerolínea");

      setCreateOpen(false);
      resetCreateForm();
      await fetchAerolineas();
    } catch (err: any) {
      setError(err?.message ?? "Error");
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function openEdit(id: number) {
    setError(null);
    setEditId(id);
    setEditOpen(true);
    setEditSubmitting(false);
    setE(null);
    setELinksTxt("");

    try {
      const r = await fetch(`/api/aerolineas/${id}`, { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Error cargando aerolínea");

      const detalle = data?.aerolinea as AerolineaDetalle;
      if (!detalle) throw new Error("Respuesta inválida de detalle");

      setE(detalle);
      setELinksTxt(
        Array.isArray(detalle.links_imagenes)
          ? detalle.links_imagenes.join("\n")
          : ""
      );
    } catch (err: any) {
      setError(err?.message ?? "Error");
    }
  }

  async function onUpdate() {
    if (!editId || !e) return;
    setEditSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...e,
        links_imagenes: parseLinks(e_linksTxt),
      };

      // Validación mínima
      if (
        !payload.nombre ||
        !payload.descripcion ||
        payload.costo_servicio == null ||
        payload.costo_compensacion == null ||
        !payload.denominacion ||
        payload.millas_otorgadas == null ||
        !payload.id_lugar ||
        !payload.tipo_avion ||
        payload.cupo == null ||
        !payload.nombre_terminal ||
        !payload.lugar_terminal
      ) {
        throw new Error(
          "Completa todos los campos requeridos antes de actualizar."
        );
      }

      const r = await fetch(`/api/aerolineas/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Error actualizando aerolínea");

      setEditOpen(false);
      setEditId(null);
      setE(null);
      await fetchAerolineas();
    } catch (err: any) {
      setError(err?.message ?? "Error");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function onDelete(id: number) {
    const ok = confirm("¿Seguro que deseas eliminar esta aerolínea?");
    if (!ok) return;

    setError(null);
    try {
      const r = await fetch(`/api/aerolineas/${id}`, { method: "DELETE" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Error eliminando aerolínea");
      await fetchAerolineas();
    } catch (err: any) {
      setError(err?.message ?? "Error");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-blue-900 text-white border-b border-blue-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Portal de Proveedores</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-blue-200">
                    {proveedorNombre ?? "Proveedor"}
                  </p>
                  {proveedorNombre && (
                    <Badge className="bg-white/15 text-white">Proveedor</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-800"
                title="Configuración"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-800"
                title="Salir"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-100">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
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
                    <TrendingUp className="h-4 w-4" />
                    Resumen
                  </Button>
                  <Button
                    variant={activeTab === "services" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("services")}
                  >
                    <Plane className="h-4 w-4" />
                    Aerolíneas (Servicios Aéreos)
                  </Button>
                  <Button
                    variant={
                      activeTab === "availability" ? "secondary" : "ghost"
                    }
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("availability")}
                  >
                    <Calendar className="h-4 w-4" />
                    Disponibilidad
                  </Button>
                  <Button
                    variant={activeTab === "pricing" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab("pricing")}
                  >
                    <DollarSign className="h-4 w-4" />
                    Tarifas
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main */}
          <div className="lg:col-span-9">
            {/* Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Servicios Aéreos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {stats.totalServicios}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Registrados
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Reservas Activas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {stats.reservasActivas}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Placeholder
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Ingresos del Mes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        ${stats.ingresosMes}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Placeholder
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Ocupación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {stats.ocupacion}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Placeholder
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      Estado del CRUD
                    </CardTitle>
                    <CardDescription>
                      Si puedes crear, editar y eliminar aquí, entonces el CRUD
                      de aerolíneas está OK.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Usa la pestaña “Aerolíneas (Servicios Aéreos)” para probar.
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Services */}
            {activeTab === "services" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="bg-blue-900 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Plane className="h-5 w-5" />
                          Aerolíneas (Servicios Aéreos)
                        </CardTitle>
                        <CardDescription className="text-blue-200">
                          CRUD completo desde proveedor usando tus funciones.
                        </CardDescription>
                      </div>

                      <Button
                        className="bg-white text-blue-900 hover:bg-blue-50"
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-muted-foreground">
                        {loading
                          ? "Cargando..."
                          : `Total: ${aerolineas.length}`}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchAerolineas}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Refrescar"
                        )}
                      </Button>
                    </div>

                    {loading ? (
                      <div className="py-10 text-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Cargando aerolíneas...
                      </div>
                    ) : aerolineas.length === 0 ? (
                      <div className="py-10 text-center text-muted-foreground">
                        No hay aerolíneas registradas todavía.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {aerolineas.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between gap-3 p-4 border rounded-lg bg-white dark:bg-slate-950"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">{s.nombre}</p>
                                <Badge className="bg-green-500">Activo</Badge>
                              </div>

                              <p className="text-sm text-muted-foreground">
                                ID #{s.id}
                                {" • "}
                                Costo: {s.costo_servicio ?? "-"}{" "}
                                {s.denominacion ?? ""}
                                {" • "}
                                Millas: {s.millas_otorgadas ?? "-"}
                                {" • "}
                                Destino: {s.lugar_nombre ?? `Lugar #${s.fk_lugar ?? "-"}`}
                              </p>

                              {s.descripcion && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {s.descripcion}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEdit(s.id)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDelete(s.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Availability */}
            {activeTab === "availability" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Gestión de Disponibilidad
                  </CardTitle>
                  <CardDescription>
                    Lo conectamos después (no bloquea el CRUD).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Pendiente…</p>
                </CardContent>
              </Card>
            )}

            {/* Pricing */}
            {activeTab === "pricing" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    Gestión de Tarifas
                  </CardTitle>
                  <CardDescription>
                    Lo conectamos después (no bloquea el CRUD).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Pendiente…</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog
        open={createOpen}
        onOpenChange={(v) => {
          setCreateOpen(v);
          if (!v) resetCreateForm();
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Crear Servicio Aéreo
            </DialogTitle>
            <DialogDescription>
              Complete la información del servicio de vuelo. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basico">Información Básica</TabsTrigger>
              <TabsTrigger value="vuelo">Detalles del Vuelo</TabsTrigger>
              <TabsTrigger value="adicional">Información Adicional</TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="c_nombre">
                  Nombre del Servicio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="c_nombre"
                  value={c_nombre}
                  onChange={(ev) => setCNombre(ev.target.value)}
                  placeholder="Ej: Vuelo Caracas - Madrid"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="c_descripcion">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="c_descripcion"
                  value={c_descripcion}
                  onChange={(ev) => setCDescripcion(ev.target.value)}
                  rows={4}
                  placeholder="Descripción detallada del servicio..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c_destino">
                    Destino <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={c_idLugar}
                    onValueChange={setCIdLugar}
                    disabled={loadingLugares}
                  >
                    <SelectTrigger id="c_destino">
                      <SelectValue placeholder="Seleccione el destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {lugares.map((lugar) => (
                        <SelectItem key={lugar.id} value={String(lugar.id)}>
                          {lugar.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="c_denominacion">
                    Moneda <span className="text-red-500">*</span>
                  </Label>
                  <Select value={c_denominacion} onValueChange={setCDenominacion}>
                    <SelectTrigger id="c_denominacion">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - Dólar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="VES">VES - Bolívar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vuelo" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c_costoServicio">
                    Costo del Servicio <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="c_costoServicio"
                    type="number"
                    value={c_costoServicio}
                    onChange={(ev) =>
                      setCCostoServicio(
                        ev.target.value === "" ? "" : Number(ev.target.value)
                      )
                    }
                    placeholder="850"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="c_costoCompensacion">
                    Costo de Compensación <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="c_costoCompensacion"
                    type="number"
                    value={c_costoCompensacion}
                    onChange={(ev) =>
                      setCCostoCompensacion(
                        ev.target.value === "" ? "" : Number(ev.target.value)
                      )
                    }
                    placeholder="50"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="c_millas">
                    Millas Otorgadas <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="c_millas"
                    type="number"
                    value={c_millas}
                    onChange={(ev) =>
                      setCMillas(
                        ev.target.value === "" ? "" : Number(ev.target.value)
                      )
                    }
                    placeholder="1200"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="c_cupo">
                    Capacidad (Cupos) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="c_cupo"
                    type="number"
                    value={c_cupo}
                    onChange={(ev) =>
                      setCCupo(
                        ev.target.value === "" ? "" : Number(ev.target.value)
                      )
                    }
                    placeholder="180"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="c_tipoAvion">
                  Tipo de Aeronave <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="c_tipoAvion"
                  value={c_tipoAvion}
                  onChange={(ev) => setCTipoAvion(ev.target.value)}
                  placeholder="Ej: Boeing 737, Airbus A320"
                />
              </div>
            </TabsContent>

            <TabsContent value="adicional" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="c_nombreTerminal">
                  Nombre de la Terminal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="c_nombreTerminal"
                  value={c_nombreTerminal}
                  onChange={(ev) => setCNombreTerminal(ev.target.value)}
                  placeholder="Ej: Terminal A, Terminal Internacional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="c_lugarTerminal">
                  Ubicación de la Terminal <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={c_lugarTerminal}
                  onValueChange={setCLugarTerminal}
                  disabled={loadingLugares}
                >
                  <SelectTrigger id="c_lugarTerminal">
                    <SelectValue placeholder="Seleccione la ubicación de la terminal" />
                  </SelectTrigger>
                  <SelectContent>
                    {lugares.map((lugar) => (
                      <SelectItem key={lugar.id} value={String(lugar.id)}>
                        {lugar.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="c_linksTxt">
                  Enlaces de Imágenes
                </Label>
                <Textarea
                  id="c_linksTxt"
                  value={c_linksTxt}
                  onChange={(ev) => setCLinksTxt(ev.target.value)}
                  rows={4}
                  placeholder="Pegue los enlaces separados por coma o línea nueva&#10;https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Puede ingresar múltiples URLs separadas por coma o línea nueva
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createSubmitting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-blue-900 hover:bg-blue-800"
              onClick={onCreate}
              disabled={createSubmitting}
            >
              {createSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Crear Servicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) {
            setEditId(null);
            setE(null);
            setELinksTxt("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Servicio Aéreo
            </DialogTitle>
            <DialogDescription>
              Modifique la información del servicio de vuelo. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>

          {!e ? (
            <div className="py-10 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Cargando detalle...
            </div>
          ) : (
            <Tabs defaultValue="basico" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basico">Información Básica</TabsTrigger>
                <TabsTrigger value="vuelo">Detalles del Vuelo</TabsTrigger>
                <TabsTrigger value="adicional">Información Adicional</TabsTrigger>
              </TabsList>

              <TabsContent value="basico" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="e_nombre">
                    Nombre del Servicio <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="e_nombre"
                    value={e.nombre}
                    onChange={(ev) => setE({ ...e, nombre: ev.target.value })}
                    placeholder="Ej: Vuelo Caracas - Madrid"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="e_descripcion">
                    Descripción <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="e_descripcion"
                    value={e.descripcion}
                    onChange={(ev) =>
                      setE({ ...e, descripcion: ev.target.value })
                    }
                    rows={4}
                    placeholder="Descripción detallada del servicio..."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="e_destino">
                      Destino <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={String(e.id_lugar)}
                      onValueChange={(val) =>
                        setE({ ...e, id_lugar: Number(val) })
                      }
                      disabled={loadingLugares}
                    >
                      <SelectTrigger id="e_destino">
                        <SelectValue placeholder="Seleccione el destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {lugares.map((lugar) => (
                          <SelectItem key={lugar.id} value={String(lugar.id)}>
                            {lugar.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="e_denominacion">
                      Moneda <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={e.denominacion}
                      onValueChange={(val) =>
                        setE({ ...e, denominacion: val })
                      }
                    >
                      <SelectTrigger id="e_denominacion">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - Dólar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="VES">VES - Bolívar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vuelo" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="e_costoServicio">
                      Costo del Servicio <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="e_costoServicio"
                      type="number"
                      value={e.costo_servicio}
                      onChange={(ev) =>
                        setE({ ...e, costo_servicio: Number(ev.target.value) })
                      }
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="e_costoCompensacion">
                      Costo de Compensación <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="e_costoCompensacion"
                      type="number"
                      value={e.costo_compensacion}
                      onChange={(ev) =>
                        setE({
                          ...e,
                          costo_compensacion: Number(ev.target.value),
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="e_millas">
                      Millas Otorgadas <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="e_millas"
                      type="number"
                      value={e.millas_otorgadas}
                      onChange={(ev) =>
                        setE({
                          ...e,
                          millas_otorgadas: Number(ev.target.value),
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="e_cupo">
                      Capacidad (Cupos) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="e_cupo"
                      type="number"
                      value={e.cupo}
                      onChange={(ev) =>
                        setE({ ...e, cupo: Number(ev.target.value) })
                      }
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="e_tipoAvion">
                    Tipo de Aeronave <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="e_tipoAvion"
                    value={e.tipo_avion}
                    onChange={(ev) =>
                      setE({ ...e, tipo_avion: ev.target.value })
                    }
                    placeholder="Ej: Boeing 737, Airbus A320"
                  />
                </div>
              </TabsContent>

              <TabsContent value="adicional" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="e_nombreTerminal">
                    Nombre de la Terminal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="e_nombreTerminal"
                    value={e.nombre_terminal}
                    onChange={(ev) =>
                      setE({ ...e, nombre_terminal: ev.target.value })
                    }
                    placeholder="Ej: Terminal A, Terminal Internacional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="e_lugarTerminal">
                    Ubicación de la Terminal <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={String(e.lugar_terminal)}
                    onValueChange={(val) =>
                      setE({ ...e, lugar_terminal: Number(val) })
                    }
                    disabled={loadingLugares}
                  >
                    <SelectTrigger id="e_lugarTerminal">
                      <SelectValue placeholder="Seleccione la ubicación de la terminal" />
                    </SelectTrigger>
                    <SelectContent>
                      {lugares.map((lugar) => (
                        <SelectItem key={lugar.id} value={String(lugar.id)}>
                          {lugar.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="e_linksTxt">
                    Enlaces de Imágenes
                  </Label>
                  <Textarea
                    id="e_linksTxt"
                    value={e_linksTxt}
                    onChange={(ev) => setELinksTxt(ev.target.value)}
                    rows={4}
                    placeholder="Pegue los enlaces separados por coma o línea nueva&#10;https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Puede ingresar múltiples URLs separadas por coma o línea nueva
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={editSubmitting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-blue-900 hover:bg-blue-800"
              onClick={onUpdate}
              disabled={!e || editSubmitting}
            >
              {editSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
