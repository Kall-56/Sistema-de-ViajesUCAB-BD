"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Plus, Trash2, Loader2, Package } from "lucide-react"
import { toast } from "sonner"

type Restriccion = {
  id_restriccion: number
  fk_paquete: number
  caracteristica: string
  operador: string
  valor_restriccion: string
  nombre_paquete?: string
}

type Paquete = {
  id: number
  nombre: string
}

export function RestriccionesManagement() {
  const [loading, setLoading] = useState(false)
  const [restricciones, setRestricciones] = useState<Restriccion[]>([])
  const [paquetes, setPaquetes] = useState<Paquete[]>([])
  const [selectedPaquete, setSelectedPaquete] = useState<number | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRestriccion, setSelectedRestriccion] = useState<Restriccion | null>(null)

  const [formCaracteristica, setFormCaracteristica] = useState<"edad" | "estado_civil">("edad")
  const [formOperador, setFormOperador] = useState<">" | "<" | "=" | "!=">(">")
  const [formValor, setFormValor] = useState("")
  const [formIdPaquete, setFormIdPaquete] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Resetear operador cuando cambia la característica
  useEffect(() => {
    if (formCaracteristica === "estado_civil") {
      // Para estado civil, solo permitir igualdad
      setFormOperador("=")
    } else if (formCaracteristica === "edad") {
      // Para edad, si el operador actual no es válido para edad, cambiarlo
      if (formOperador === "=" || formOperador === "!=") {
        setFormOperador(">")
      }
    }
  }, [formCaracteristica, formOperador])

  useEffect(() => {
    fetchRestricciones()
    fetchPaquetes()
  }, [])

  useEffect(() => {
    if (selectedPaquete) {
      fetchRestricciones(selectedPaquete)
    } else {
      fetchRestricciones()
    }
  }, [selectedPaquete])

  async function fetchRestricciones(idPaquete?: number) {
    setLoading(true)
    try {
      const url = idPaquete 
        ? `/api/admin/restricciones?id_paquete=${idPaquete}`
        : "/api/admin/restricciones"
      
      const r = await fetch(url, { cache: "no-store" })
      const data = await r.json()

      if (!r.ok) throw new Error(data?.error ?? "Error cargando restricciones")
      setRestricciones(Array.isArray(data?.restricciones) ? data.restricciones : [])
    } catch (err: any) {
      console.error("Error cargando restricciones:", err)
      toast.error("Error", {
        description: err.message ?? "No se pudieron cargar las restricciones",
      })
      setRestricciones([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchPaquetes() {
    try {
      const r = await fetch("/api/admin/paquetes", { cache: "no-store" })
      const data = await r.json()

      if (!r.ok) throw new Error("Error cargando paquetes")
      
      const paquetesList = Array.isArray(data?.paquetes) ? data.paquetes : []
      setPaquetes(paquetesList.map((p: any) => ({
        id: p.id_paquete,
        nombre: p.nombre_paquete,
      })))
    } catch (err: any) {
      console.error("Error cargando paquetes:", err)
    }
  }

  async function handleCreate() {
    if (!formIdPaquete || !formValor) {
      toast.error("Debes completar todos los campos")
      return
    }

    if (formCaracteristica === "edad" && isNaN(Number(formValor))) {
      toast.error("El valor para edad debe ser un número")
      return
    }

    setSubmitting(true)
    try {
      const r = await fetch("/api/admin/restricciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paquete: formIdPaquete,
          caracteristica: formCaracteristica,
          operador: formOperador,
          valor_restriccion: formValor,
        }),
      })

      const data = await r.json()

      if (!r.ok) throw new Error(data?.error ?? "Error creando restricción")

      toast.success("Restricción creada exitosamente")
      setCreateDialogOpen(false)
      setFormCaracteristica("edad")
      setFormOperador(">")
      setFormValor("")
      setFormIdPaquete(null)
      fetchRestricciones(selectedPaquete || undefined)
    } catch (err: any) {
      console.error("Error creando restricción:", err)
      toast.error("Error", {
        description: err.message ?? "No se pudo crear la restricción",
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!selectedRestriccion) return

    setSubmitting(true)
    try {
      const r = await fetch(`/api/admin/restricciones/${selectedRestriccion.id_restriccion}`, {
        method: "DELETE",
      })

      const data = await r.json()

      if (!r.ok) throw new Error(data?.error ?? "Error eliminando restricción")

      toast.success("Restricción eliminada exitosamente")
      setDeleteDialogOpen(false)
      setSelectedRestriccion(null)
      fetchRestricciones(selectedPaquete || undefined)
    } catch (err: any) {
      console.error("Error eliminando restricción:", err)
      toast.error("Error", {
        description: err.message ?? "No se pudo eliminar la restricción",
      })
    } finally {
      setSubmitting(false)
    }
  }

  function getCaracteristicaLabel(caracteristica: string) {
    return caracteristica === "edad" ? "Edad" : "Estado Civil"
  }

  function getOperadorLabel(operador: string) {
    const labels: { [key: string]: string } = {
      ">": "Mayor que",
      "<": "Menor que",
      "=": "Igual a",
      "!=": "Diferente de",
    }
    return labels[operador] || operador
  }

  const filteredRestricciones = selectedPaquete
    ? restricciones.filter((r) => r.fk_paquete === selectedPaquete)
    : restricciones

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Restricciones de Paquetes</CardTitle>
              <CardDescription>
                Crea y gestiona restricciones que se aplican automáticamente al comprar paquetes
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Restricción
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="filter-paquete">Filtrar por paquete:</Label>
            <Select
              value={selectedPaquete?.toString() || "all"}
              onValueChange={(value) => setSelectedPaquete(value === "all" ? null : Number(value))}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Todos los paquetes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los paquetes</SelectItem>
                {paquetes.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#E91E63]" />
            </div>
          ) : filteredRestricciones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay restricciones registradas</p>
              {selectedPaquete && <p className="text-sm mt-2">para este paquete</p>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paquete</TableHead>
                  <TableHead>Característica</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestricciones.map((restriccion) => (
                  <TableRow key={restriccion.id_restriccion}>
                    <TableCell className="font-medium">
                      {restriccion.nombre_paquete || `Paquete #${restriccion.fk_paquete}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getCaracteristicaLabel(restriccion.caracteristica)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getOperadorLabel(restriccion.operador)}</TableCell>
                    <TableCell>{restriccion.valor_restriccion}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRestriccion(restriccion)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Restricción</DialogTitle>
            <DialogDescription>
              Define una restricción que se validará automáticamente al comprar el paquete
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paquete">Paquete *</Label>
              <Select
                value={formIdPaquete?.toString() || ""}
                onValueChange={(value) => setFormIdPaquete(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un paquete" />
                </SelectTrigger>
                <SelectContent>
                  {paquetes.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caracteristica">Característica *</Label>
              <Select
                value={formCaracteristica}
                onValueChange={(value) => setFormCaracteristica(value as "edad" | "estado_civil")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="edad">Edad</SelectItem>
                  <SelectItem value="estado_civil">Estado Civil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operador">Operador *</Label>
              <Select
                value={formOperador}
                onValueChange={(value) => setFormOperador(value as ">" | "<" | "=" | "!=")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formCaracteristica === "edad" ? (
                    <>
                      <SelectItem value=">">Mayor que (&gt;)</SelectItem>
                      <SelectItem value="<">Menor que (&lt;)</SelectItem>
                      <SelectItem value="=">Igual a (=)</SelectItem>
                      <SelectItem value="!=">Diferente de (!=)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="=">Igual a (=)</SelectItem>
                      <SelectItem value="!=">Diferente de (!=)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {formCaracteristica === "estado_civil" && (
                <p className="text-xs text-muted-foreground">
                  Para estado civil solo se permiten operadores de igualdad (=) o desigualdad (!=)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">
                Valor *{" "}
                {formCaracteristica === "edad" && (
                  <span className="text-sm text-muted-foreground">(número)</span>
                )}
                {formCaracteristica === "estado_civil" && (
                  <span className="text-sm text-muted-foreground">(soltero, casado, divorciado, viudo)</span>
                )}
              </Label>
              {formCaracteristica === "estado_civil" ? (
                <Select value={formValor} onValueChange={setFormValor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soltero">Soltero</SelectItem>
                    <SelectItem value="casado">Casado</SelectItem>
                    <SelectItem value="divorciado">Divorciado</SelectItem>
                    <SelectItem value="viudo">Viudo</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="valor"
                  type="number"
                  value={formValor}
                  onChange={(e) => setFormValor(e.target.value)}
                  placeholder="Ej: 18"
                />
              )}
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium mb-1">Ejemplo de restricción:</p>
                  <p className="text-muted-foreground">
                    Si seleccionas "Edad", "Mayor que" y "18", el paquete solo podrá ser comprado
                    por clientes mayores de 18 años.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Restricción"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Restricción</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta restricción? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedRestriccion && (
            <div className="py-4">
              <div className="rounded-lg border p-4 space-y-2">
                <p>
                  <span className="font-medium">Paquete:</span>{" "}
                  {selectedRestriccion.nombre_paquete || `Paquete #${selectedRestriccion.fk_paquete}`}
                </p>
                <p>
                  <span className="font-medium">Restricción:</span>{" "}
                  {getCaracteristicaLabel(selectedRestriccion.caracteristica)}{" "}
                  {getOperadorLabel(selectedRestriccion.operador)} {selectedRestriccion.valor_restriccion}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
