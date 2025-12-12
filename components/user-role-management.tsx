"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCog,
  Search,
  Plus,
  Ban,
  CheckCircle2,
  Shield,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Rol = { id: number; nombre: string };
type Cliente = { id: number; nombre: string };
type Proveedor = { id: number; nombre: string };
type Permiso = { id: number; descripcion: string };

type UsuarioRow = {
  id: number;
  email: string;
  fk_rol: number;
  fk_cliente: number | null;
  fk_proveedor: number | null;
  activo: boolean;
};

export function UserRoleManagement() {
  // --- Users section state ---
  const [searchTerm, setSearchTerm] = useState("");

  const [roles, setRoles] = useState<Rol[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);

  // form state (Modo 1)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState<string>("");
  const [clienteId, setClienteId] = useState<string>("");
  const [proveedorId, setProveedorId] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const rolesById = useMemo(
    () => new Map(roles.map((r) => [r.id, r.nombre])),
    [roles]
  );

  // --- Roles section state ---
  const [permisos, setPermisos] = useState<Permiso[]>([]);

  // Create role
  const [newRoleNombre, setNewRoleNombre] = useState("");
  const [newRolePermisos, setNewRolePermisos] = useState<number[]>([]);

  // Edit role
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [roleNombre, setRoleNombre] = useState("");
  const [rolePermisos, setRolePermisos] = useState<number[]>([]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [rRoles, rUsuarios, rClientes, rProveedores, rPermisos] =
        await Promise.all([
          fetch("/api/admin/roles"),
          fetch("/api/admin/usuarios"),
          fetch("/api/admin/clientes"),
          fetch("/api/admin/proveedores"),
          fetch("/api/admin/permisos"),
        ]);

      const dRoles = await rRoles.json();
      const dUsuarios = await rUsuarios.json();
      const dClientes = await rClientes.json();
      const dProveedores = await rProveedores.json();
      const dPermisos = await rPermisos.json();

      setRoles(dRoles.roles ?? []);
      setUsuarios(dUsuarios.usuarios ?? []);
      setClientes(dClientes.clientes ?? []);
      setProveedores(dProveedores.proveedores ?? []);
      setPermisos(dPermisos.permisos ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredUsuarios = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return usuarios;
    return usuarios.filter((u) => u.email.toLowerCase().includes(t));
  }, [usuarios, searchTerm]);

  const resetUserForm = () => {
    setEmail("");
    setPassword("");
    setRolId("");
    setClienteId("");
    setProveedorId("");
  };

  const handleCreateUser = async () => {
    // Validaciones Modo 1 (respetan el CHECK de tu tabla usuario)
    if (!email || !password || !rolId) {
      alert("Email, contraseña y rol son obligatorios.");
      return;
    }
    const both = clienteId && proveedorId;
    if (both) {
      alert("Selecciona solo Cliente o solo Proveedor (no ambos).");
      return;
    }

    // Reglas por rol (recomendación):
    // rol cliente => clienteId requerido
    // rol proveedor => proveedorId requerido
    // rol admin => ambos null
    const rId = Number(rolId);
    if (rId === 1 && !clienteId) {
      alert("Para rol Cliente debes seleccionar un cliente existente.");
      return;
    }
    if (rId === 2 && !proveedorId) {
      alert("Para rol Proveedor debes seleccionar un proveedor existente.");
      return;
    }
    if (rId === 3 && (clienteId || proveedorId)) {
      alert("Para rol Admin no debes asociar cliente/proveedor.");
      return;
    }

    const payload = {
      email,
      contraseña: password,
      rolId: rId,
      clienteId: clienteId ? Number(clienteId) : null,
      proveedorId: proveedorId ? Number(proveedorId) : null,
    };

    const res = await fetch("/api/admin/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Error creando usuario");
      return;
    }

    resetUserForm();
    await loadAll();
    alert(`Usuario creado (id: ${data.id})`);
  };

  const toggleActivo = async (id: number, activo: boolean) => {
    const res = await fetch(`/api/admin/usuarios/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Error actualizando estatus");
      return;
    }
    await loadAll();
  };

  // --- Roles section helpers ---
  const togglePerm = (arr: number[], permId: number) =>
    arr.includes(permId) ? arr.filter((x) => x !== permId) : [...arr, permId];

  const loadRoleDetail = async (id: number) => {
    const res = await fetch(`/api/admin/roles/${id}`, { method: "GET" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Error cargando rol");
      return;
    }

    // obtener_rol_permisos: nombre_rol, ids_permisos
    setRoleNombre(data.rol.nombre_rol ?? "");
    setRolePermisos(data.rol.ids_permisos ?? []);
  };

  const onSelectRole = async (value: string) => {
    setSelectedRoleId(value);
    if (!value) {
      setRoleNombre("");
      setRolePermisos([]);
      return;
    }
    await loadRoleDetail(Number(value));
  };

  const handleCreateRole = async () => {
    if (!newRoleNombre.trim() || newRolePermisos.length === 0) {
      alert("Nombre y al menos 1 permiso son obligatorios.");
      return;
    }

    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: newRoleNombre.trim(),
        idsPermisos: newRolePermisos,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Error creando rol");
      return;
    }

    setNewRoleNombre("");
    setNewRolePermisos([]);
    await loadAll();
    alert("Rol creado");
  };

  const handleSaveRole = async () => {
    if (!selectedRoleId) return;

    const res = await fetch(`/api/admin/roles/${Number(selectedRoleId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: roleNombre.trim(),
        idsPermisos: rolePermisos,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Error actualizando rol");
      return;
    }

    await loadAll();
    alert("Rol actualizado");
  };

  const handleDeleteRole = async () => {
    if (!selectedRoleId) return;

    const res = await fetch(`/api/admin/roles/${Number(selectedRoleId)}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "No se pudo eliminar el rol");
      return;
    }

    setSelectedRoleId("");
    setRoleNombre("");
    setRolePermisos([]);
    await loadAll();
    alert("Rol eliminado");
  };

  return (
    <div className="space-y-6">
      {/* Create User */}
      <Card>
        <CardHeader className="bg-slate-900 text-white">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Crear Nuevo Usuario (Modo 1)
          </CardTitle>
          <CardDescription className="text-slate-300">
            Se crea la cuenta y se asocia a un Cliente o Proveedor existente (no
            se crean aquí).
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-password">Contraseña Temporal</Label>
              <Input
                id="user-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-role">Rol (desde BD)</Label>
              <Select
                value={rolId}
                onValueChange={(v) => {
                  setRolId(v);
                  setClienteId("");
                  setProveedorId("");
                }}
              >
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.nombre} (id {r.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Asociación Modo 1 */}
            <div className="space-y-2">
              <Label>Asociación (Cliente / Proveedor)</Label>

              {/* Si rol cliente -> cliente */}
              {Number(rolId) === 1 && (
                <Select
                  value={clienteId}
                  onValueChange={(v) => setClienteId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente existente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nombre} (id {c.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Si rol proveedor -> proveedor */}
              {Number(rolId) === 2 && (
                <Select
                  value={proveedorId}
                  onValueChange={(v) => setProveedorId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor existente" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre} (id {p.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Si rol admin -> nada */}
              {Number(rolId) === 3 && (
                <p className="text-sm text-muted-foreground">
                  Admin no requiere cliente/proveedor asociado.
                </p>
              )}

              {!rolId && (
                <p className="text-sm text-muted-foreground">
                  Selecciona un rol para habilitar la asociación.
                </p>
              )}
            </div>
          </div>

          <Button
            className="w-full bg-slate-900 hover:bg-slate-800"
            onClick={handleCreateUser}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Usuario
          </Button>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-[#E91E63]" />
            Gestión de Usuarios
          </CardTitle>
          <CardDescription>
            Administrar cuentas y estado (activo/suspendido)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3">
            {filteredUsuarios.map((u) => {
              const rolName = rolesById.get(u.fk_rol) ?? `rol ${u.fk_rol}`;
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold">Usuario #{u.id}</p>

                      <Badge
                        variant={
                          rolName.toLowerCase() === "admin"
                            ? "default"
                            : "outline"
                        }
                      >
                        {rolName}
                      </Badge>

                      {u.activo ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <Ban className="h-3 w-3 mr-1" />
                          Suspendido
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{u.email}</p>

                    <p className="text-xs text-muted-foreground mt-1">
                      fk_cliente: {u.fk_cliente ?? "null"} | fk_proveedor:{" "}
                      {u.fk_proveedor ?? "null"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {u.activo ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive bg-transparent"
                        onClick={() => toggleActivo(u.id, false)}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Suspender
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActivo(u.id, true)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Reactivar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Roles section (debajo) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#E91E63]" />
            Gestión de Roles
          </CardTitle>
          <CardDescription>
            Crear, editar y eliminar roles y sus permisos.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Crear rol */}
          <div className="space-y-3 border rounded-lg p-4">
            <p className="font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear rol
            </p>

            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={newRoleNombre}
                onChange={(e) => setNewRoleNombre(e.target.value)}
                placeholder="Ej: soporte"
              />
            </div>

            <div className="space-y-2">
              <Label>Permisos</Label>
              <div className="flex flex-wrap gap-2">
                {permisos.map((p) => {
                  const active = newRolePermisos.includes(p.id);
                  return (
                    <Button
                      key={p.id}
                      type="button"
                      variant={active ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setNewRolePermisos((prev) => togglePerm(prev, p.id))
                      }
                    >
                      {p.descripcion}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button onClick={handleCreateRole} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Crear rol
            </Button>
          </div>

          {/* Editar rol */}
          <div className="space-y-3 border rounded-lg p-4">
            <p className="font-semibold flex items-center gap-2">
              <Save className="h-4 w-4" />
              Editar rol
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Seleccionar rol</Label>
                <Select value={selectedRoleId} onValueChange={onSelectRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.nombre} (id {r.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={roleNombre}
                  onChange={(e) => setRoleNombre(e.target.value)}
                  disabled={!selectedRoleId}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Permisos</Label>
              <div className="flex flex-wrap gap-2">
                {permisos.map((p) => {
                  const active = rolePermisos.includes(p.id);
                  return (
                    <Button
                      key={p.id}
                      type="button"
                      variant={active ? "default" : "outline"}
                      size="sm"
                      disabled={!selectedRoleId}
                      onClick={() =>
                        setRolePermisos((prev) => togglePerm(prev, p.id))
                      }
                    >
                      {p.descripcion}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveRole}
                disabled={!selectedRoleId || loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </Button>

              <Button
                variant="destructive"
                onClick={handleDeleteRole}
                disabled={!selectedRoleId || loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar rol
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Nota: si el rol tiene usuarios asignados, el backend debe
              responder 409 y no se eliminará.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
