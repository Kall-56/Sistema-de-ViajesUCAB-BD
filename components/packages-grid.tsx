"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Star, Filter, X, Loader2 } from "lucide-react"
import { WishlistButton } from "@/components/wishlist-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

type PaqueteAPI = {
  id_paquete: number;
  nombre_paquete: string;
  descripcion_paquete: string;
  tipo_paquete: string;
  ids_servicios: number[] | null;
  nombres_servicios: string[] | null;
  restricciones: string[] | null;
  precio_total: number;
  millas_totales: number;
  imagen_principal: string | null;
  destinos: string[] | null;
};

type PaqueteDisplay = {
  id: string;
  name: string;
  destination: string;
  description: string;
  duration: string;
  price: number;
  miles: number;
  rating: number;
  reviews: number;
  image: string | null;
  type: string;
  includes: string[];
};

const allPackages = [
  {
    id: "crucero-mediterraneo",
    name: "Crucero Mediterráneo",
    destination: "Italia, Grecia & Turquía",
    description: "Navega por las costas más hermosas del Mediterráneo con todo incluido",
    duration: "12 noches / 13 días",
    price: 2199,
    miles: 78000,
    rating: 4.7,
    reviews: 189,
    image: "/luxury-cruise-ship-mediterranean.jpg",
    type: "Crucero",
    includes: ["Crucero", "Todo Incluido", "Excursiones", "Entretenimiento"],
  },
  {
    id: "nueva-york-city",
    name: "Nueva York Completo",
    destination: "Nueva York, USA",
    description: "Explora la Gran Manzana con tours, Broadway y atracciones principales",
    duration: "5 noches / 6 días",
    price: 1599,
    miles: 56000,
    rating: 4.6,
    reviews: 234,
    image: "/nyc-skyline.png",
    type: "Ciudad",
    includes: ["Vuelo", "Hotel 4★", "Tours", "Broadway"],
  },
  {
    id: "patagonia-aventura",
    name: "Patagonia Aventura",
    destination: "Argentina & Chile",
    description: "Trekking, glaciares y naturaleza salvaje en el fin del mundo",
    duration: "9 noches / 10 días",
    price: 2799,
    miles: 99000,
    rating: 4.9,
    reviews: 156,
    image: "/patagonia-mountains-glacier.jpg",
    type: "Aventura",
    includes: ["Vuelo", "Hoteles", "Guías", "Equipamiento"],
  },
  {
    id: "tokio-kyoto",
    name: "Japón Tradicional",
    destination: "Tokio & Kyoto",
    description: "Sumérgete en la cultura japonesa entre templos y modernidad",
    duration: "8 noches / 9 días",
    price: 3299,
    miles: 115000,
    rating: 4.8,
    reviews: 198,
    image: "/kyoto-temple-japan.png",
    type: "Cultural",
    includes: ["Vuelo", "Hoteles", "JR Pass", "Tours"],
  },
  {
    id: "punta-cana-relax",
    name: "Punta Cana Relax",
    destination: "República Dominicana",
    description: "Desconéctate en playas paradisíacas con todo incluido",
    duration: "7 noches / 8 días",
    price: 1099,
    miles: 39000,
    rating: 4.5,
    reviews: 412,
    image: "/punta-cana-beach-resort.jpg",
    type: "Playa",
    includes: ["Vuelo", "Resort 5★", "Todo Incluido", "Spa"],
  },
  {
    id: "machu-picchu",
    name: "Machu Picchu Místico",
    destination: "Cusco & Valle Sagrado",
    description: "Descubre la maravilla del mundo con guías expertos",
    duration: "6 noches / 7 días",
    price: 1799,
    miles: 63000,
    rating: 5.0,
    reviews: 287,
    image: "/machu-picchu-peru.png",
    type: "Cultural",
    includes: ["Vuelo", "Hoteles", "Entradas", "Guías"],
  },
]

export function PackagesGrid() {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000])
  const [selectedDuration, setSelectedDuration] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [paquetes, setPaquetes] = useState<PaqueteDisplay[]>([])

  // Cargar paquetes desde API
  useEffect(() => {
    async function fetchPaquetes() {
      setLoading(true)
      try {
        const r = await fetch("/api/paquetes", { cache: "no-store" })
        if (!r.ok) throw new Error("Error cargando paquetes")
        const data = await r.json()
        
        const paquetesAPI: PaqueteAPI[] = Array.isArray(data?.paquetes) ? data.paquetes : []
        
        // Mapear datos de API al formato del componente
        const mapped = paquetesAPI.map((p): PaqueteDisplay => {
          const destinos = p.destinos && p.destinos.length > 0 
            ? p.destinos.join(", ") 
            : "Destino no especificado"
          
          return {
            id: `paquete-${p.id_paquete}`,
            name: p.nombre_paquete,
            destination: destinos,
            description: p.descripcion_paquete || "Sin descripción",
            duration: "Duración variable", // No tenemos duración en BD
            price: p.precio_total || 0,
            miles: p.millas_totales || 0,
            rating: 4.5, // Placeholder
            reviews: 0, // Placeholder
            image: p.imagen_principal,
            type: p.tipo_paquete,
            includes: p.nombres_servicios || []
          };
        });
        
        setPaquetes(mapped)
      } catch (err) {
        console.error("Error cargando paquetes:", err)
        setPaquetes([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchPaquetes()
  }, [])

  const filteredPackages = useMemo(() => {
    return paquetes.filter((pkg) => {
      const matchesDestination = selectedDestination === "all" || pkg.destination.toLowerCase().includes(selectedDestination.toLowerCase())
      const matchesType = selectedType === "all" || pkg.type.toLowerCase().includes(selectedType.toLowerCase())
      const matchesPrice = pkg.price >= priceRange[0] && pkg.price <= priceRange[1]
      return matchesDestination && matchesType && matchesPrice
    })
  }, [paquetes, selectedDestination, selectedType, priceRange])

  const clearFilters = () => {
    setSelectedDestination("all")
    setSelectedType("all")
    setPriceRange([0, 5000])
    setSelectedDuration("all")
  }

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Todos los Paquetes</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {loading ? "Cargando..." : `${filteredPackages.length} paquetes disponibles`}
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        {showFilters && (
          <Card className="mb-8 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Filtrar Paquetes</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Destino</Label>
                <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los destinos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los destinos</SelectItem>
                    <SelectItem value="Europa">Europa</SelectItem>
                    <SelectItem value="América">América</SelectItem>
                    <SelectItem value="Asia">Asia</SelectItem>
                    <SelectItem value="Caribe">Caribe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Paquete</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="Playa">Playa</SelectItem>
                    <SelectItem value="Ciudad">Ciudad</SelectItem>
                    <SelectItem value="Crucero">Crucero</SelectItem>
                    <SelectItem value="Aventura">Aventura</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duración</Label>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier duración" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquier duración</SelectItem>
                    <SelectItem value="short">1-5 días</SelectItem>
                    <SelectItem value="medium">6-10 días</SelectItem>
                    <SelectItem value="long">11+ días</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Rango de Precio: ${priceRange[0]} - ${priceRange[1]}
                </Label>
                <Slider
                  min={0}
                  max={5000}
                  step={100}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#E91E63]" />
            <p className="text-muted-foreground">Cargando paquetes...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No hay paquetes disponibles en este momento</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative overflow-hidden">
                <img
                  src={pkg.image || "/placeholder.svg"}
                  alt={pkg.name}
                  className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <Badge className="absolute left-4 top-4 bg-primary text-primary-foreground">{pkg.type}</Badge>
                <div className="absolute right-4 top-4">
                  <WishlistButton itemId={pkg.id} itemName={pkg.name} variant="icon" />
                </div>
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{pkg.destination}</span>
                </div>

                <h3 className="mb-2 text-lg font-bold">{pkg.name}</h3>
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">{pkg.description}</p>

                <div className="mb-3 flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{pkg.rating}</span>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {pkg.includes.slice(0, 3).map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>

                <div className="mb-4 border-t pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground">Desde</span>
                    <span className="text-xl font-bold text-[#E91E63]">${pkg.price.toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">o {pkg.miles.toLocaleString()} millas</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-[#E91E63] hover:bg-[#E91E63]/90" 
                    size="sm"
                    onClick={() => {
                      // Extraer el ID del paquete del formato "paquete-{id}"
                      const paqueteId = pkg.id.replace("paquete-", "")
                      router.push(`/paquetes/${paqueteId}`)
                    }}
                  >
                    Ver Detalles
                  </Button>
                  <Button variant="outline" size="sm">
                    Agregar
                  </Button>
                </div>
              </div>
            </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
