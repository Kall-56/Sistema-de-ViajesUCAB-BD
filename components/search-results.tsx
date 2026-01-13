"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Heart,
  Plane,
  Ship,
  Car,
  CheckCircle2,
  Plus,
  ShoppingCart,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { WishlistButton } from "@/components/wishlist-button"

type SearchResult = {
  id: number | string;
  title: string;
  destination: string;
  price: number;
  price_bs?: number;
  denominacion?: string;
  duration: string;
  rating: number;
  reviews: number;
  image: string;
  includes: string[];
  type: string;
  ids_servicios?: number[] | null;
  id_paquete?: number;
}

export function SearchResults() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("recommended")
  const [compareList, setCompareList] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    async function loadResults() {
      setLoading(true)
      try {
        const [paquetesRes, serviciosRes] = await Promise.all([
          fetch("/api/paquetes", { cache: "no-store" }),
          fetch("/api/cliente/servicios", { cache: "no-store" })
        ])

        const paquetesData = paquetesRes.ok ? await paquetesRes.json() : { paquetes: [] }
        const serviciosData = serviciosRes.ok ? await serviciosRes.json() : { servicios: [] }

        const paquetesResults: SearchResult[] = (paquetesData.paquetes || []).map((p: any) => ({
          id: `paquete-${p.id_paquete}`,
          title: p.nombre_paquete,
          destination: p.destinos && p.destinos.length > 0 ? p.destinos.join(", ") : "Destino no especificado",
          price: p.precio_total || 0,
          price_bs: p.precio_total_bs || p.precio_total || 0,
          denominacion: p.denominacion || "USD",
          duration: "Duración variable",
          rating: 4.5,
          reviews: 0,
          image: p.imagen_principal || "/placeholder.svg",
          includes: p.nombres_servicios || [],
          type: p.tipo_paquete?.toLowerCase() || "paquete",
          ids_servicios: p.ids_servicios,
          id_paquete: p.id_paquete
        }))

        const serviciosResults: SearchResult[] = (serviciosData.servicios || []).map((s: any) => ({
          id: s.id,
          title: s.nombre,
          destination: s.lugar_nombre || "Destino no especificado",
          price: s.costo_servicio || 0,
          price_bs: s.costo_servicio_bs || s.costo_servicio || 0,
          denominacion: s.denominacion || "USD",
          duration: "Variable",
          rating: 4.5,
          reviews: 0,
          image: s.imagen_principal || "/placeholder.svg",
          includes: [s.tipo_servicio],
          type: s.tipo_servicio?.toLowerCase() || "servicio"
        }))

        setResults([...paquetesResults, ...serviciosResults])
      } catch (err) {
        console.error("Error cargando resultados:", err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    loadResults()
  }, [])

  const toggleCompare = (id: number | string) => {
    setCompareList((prev) => {
      const idNum = typeof id === "string" ? parseInt(id.replace("paquete-", "")) : id
      return prev.includes(idNum) ? prev.filter((item) => item !== idNum) : [...prev, idNum]
    })
  }

  const filteredResults = results.filter((result) => {
    const matchesPrice = result.price >= priceRange[0] && result.price <= priceRange[1]
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(result.type)
    const matchesSearch = !searchQuery || 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.destination.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesPrice && matchesType && matchesSearch
  })

  return (
    <div className="bg-muted/30 min-h-screen">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Encuentra tu próximo destino</h1>

          {/* Smart Search Bar */}
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder='Ej: "viajes a la playa en diciembre" o "destinos para familias"'
                  className="pl-10 h-12 text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="h-12 bg-[#E91E63] hover:bg-[#E91E63]/90 text-white px-8">Buscar</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-80 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <Label>Rango de precio</Label>
                  <Slider
                    min={0}
                    max={5000}
                    step={100}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <Label>Duración</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier duración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">1-3 días</SelectItem>
                      <SelectItem value="medium">4-7 días</SelectItem>
                      <SelectItem value="long">8-14 días</SelectItem>
                      <SelectItem value="extended">Más de 14 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Package Type */}
                <div className="space-y-3">
                  <Label>Tipo de paquete</Label>
                  <div className="space-y-2">
                    {[
                      { id: "beach", label: "Playa", icon: "🏖️" },
                      { id: "cultural", label: "Cultural", icon: "🏛️" },
                      { id: "adventure", label: "Aventura", icon: "🏔️" },
                      { id: "cruise", label: "Crucero", icon: "🚢" },
                      { id: "family", label: "Familiar", icon: "👨‍👩‍👧‍👦" },
                    ].map((type) => (
                      <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedTypes.includes(type.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, type.id])
                            } else {
                              setSelectedTypes(selectedTypes.filter((t) => t !== type.id))
                            }
                          }}
                        />
                        <span className="text-sm">
                          {type.icon} {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Transport Type */}
                <div className="space-y-3">
                  <Label>Tipo de transporte</Label>
                  <div className="space-y-2">
                    {[
                      { id: "flight", label: "Vuelo", icon: Plane },
                      { id: "cruise", label: "Crucero", icon: Ship },
                      { id: "car", label: "Terrestre", icon: Car },
                    ].map((transport) => (
                      <label key={transport.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox />
                        <transport.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{transport.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Results Section */}
          <div className="flex-1">
            {/* Mobile Filters & Sort */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden bg-transparent">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filtros de búsqueda</SheetTitle>
                      <SheetDescription>Personaliza tu búsqueda de viajes</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      {/* Same filters as desktop sidebar */}
                      <div className="space-y-3">
                        <Label>Rango de precio</Label>
                        <Slider min={0} max={5000} step={100} value={priceRange} onValueChange={setPriceRange} />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {loading ? (
                  <p className="text-sm text-muted-foreground">Cargando resultados...</p>
                ) : (
                  <p className="text-sm text-muted-foreground">{filteredResults.length} resultados encontrados</p>
                )}
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recomendados</SelectItem>
                  <SelectItem value="price-low">Precio: Menor a mayor</SelectItem>
                  <SelectItem value="price-high">Precio: Mayor a menor</SelectItem>
                  <SelectItem value="rating">Mejor valorados</SelectItem>
                  <SelectItem value="duration">Duración</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Compare Bar */}
            {compareList.length > 0 && (
              <Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{compareList.length} paquete(s) seleccionado(s) para comparar</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-[#E91E63] hover:bg-[#E91E63]/90">
                        Comparar ahora
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setCompareList([])}>
                        Limpiar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredResults.map((result) => (
                <Card key={result.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-[#E91E63]/20 to-[#C2185B]/20" />
                    <div className="absolute top-3 right-3">
                      <WishlistButton
                        itemId={result.id}
                        itemName={result.title}
                        itemType="servicio"
                        variant="icon"
                      />
                    </div>
                    <Badge className="absolute bottom-3 left-3 bg-white text-gray-900">{result.duration}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{result.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {result.destination}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#E91E63]">
                          {result.denominacion === "VEN" 
                            ? `Bs. ${result.price_bs?.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || result.price.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                            : result.denominacion === "USD"
                            ? `$${result.price.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                            : result.denominacion === "EUR"
                            ? `€${result.price.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                            : `${result.price.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${result.denominacion || "USD"}`
                          }
                        </p>
                        {result.denominacion && result.denominacion !== "VEN" && result.price_bs && (
                          <p className="text-xs text-muted-foreground">
                            Bs. {result.price_bs.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">por persona</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{result.rating}</span>
                      <span className="text-sm text-muted-foreground">({result.reviews} reseñas)</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.includes.map((item, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {item}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-[#E91E63] hover:bg-[#E91E63]/90"
                        onClick={() => {
                          if (typeof result.id === "string" && result.id.startsWith("paquete-")) {
                            const paqueteId = result.id.replace("paquete-", "")
                            router.push(`/paquetes/${paqueteId}`)
                          } else {
                            router.push(`/servicio/${result.id}`)
                          }
                        }}
                      >
                        Ver detalles
                      </Button>
                      <Button asChild variant="outline" size="icon" className="bg-transparent">
                        <Link href="/carrito">
                          <ShoppingCart className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="icon" className="bg-transparent">
                        <Link href="/itinerario">
                          <Plus className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleCompare(result.id)}
                        className={compareList.includes(result.id) ? "bg-blue-50" : "bg-transparent"}
                      >
                        <CheckCircle2 className={`h-4 w-4 ${compareList.includes(result.id) ? "text-blue-600" : ""}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
