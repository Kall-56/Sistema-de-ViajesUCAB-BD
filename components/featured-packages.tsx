"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Star, ArrowRight } from "lucide-react"
import { WishlistButton } from "@/components/wishlist-button"

const featuredPackages = [
  {
    id: "caribe-premium",
    name: "Caribe Premium",
    destination: "Cancún & Riviera Maya",
    description: "Todo incluido en resort 5 estrellas con acceso a playas privadas",
    duration: "7 noches / 8 días",
    price: 1299,
    originalPrice: 1899,
    miles: 45000,
    rating: 4.9,
    reviews: 328,
    image: "/cancun-beach-resort.png",
    tag: "Más Popular",
    includes: ["Vuelo", "Hotel 5★", "Todo Incluido", "Traslados"],
  },
  {
    id: "europa-magica",
    name: "Europa Mágica",
    destination: "París, Roma & Barcelona",
    description: "Tour guiado por las capitales más emblemáticas de Europa",
    duration: "10 noches / 11 días",
    price: 2499,
    originalPrice: 3299,
    miles: 89000,
    rating: 4.8,
    reviews: 256,
    image: "/eiffel-tower-paris.png",
    tag: "Mejor Valorado",
    includes: ["Vuelo", "Hoteles 4★", "Tours", "Desayunos"],
  },
  {
    id: "disney-orlando",
    name: "Disney Orlando Familiar",
    destination: "Orlando, Florida",
    description: "Paquete familiar con entradas a todos los parques Disney",
    duration: "6 noches / 7 días",
    price: 1899,
    originalPrice: 2599,
    miles: 67000,
    rating: 5.0,
    reviews: 412,
    image: "/disney-castle-orlando.jpg",
    tag: "Ideal Familias",
    includes: ["Vuelo", "Hotel", "Entradas Parques", "Traslados"],
  },
]

export function FeaturedPackages() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="mb-2 flex items-center gap-2">
            <Star className="h-6 w-6 text-[#E91E63] fill-[#E91E63]" />
            <span className="text-sm font-semibold uppercase tracking-wider text-[#E91E63]">Lo Más Destacado</span>
          </div>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">Paquetes Más Populares</h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Los favoritos de nuestros viajeros con las mejores valoraciones
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredPackages.map((pkg) => (
            <Card key={pkg.id} className="group overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative overflow-hidden">
                <img
                  src={pkg.image || "/placeholder.svg"}
                  alt={pkg.name}
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <Badge className="absolute left-4 top-4 bg-[#E91E63] text-white border-0">{pkg.tag}</Badge>
                <div className="absolute right-4 top-4">
                  <WishlistButton itemId={pkg.id} itemName={pkg.name} variant="icon" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="p-6">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{pkg.destination}</span>
                </div>

                <h3 className="mb-2 text-xl font-bold">{pkg.name}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">{pkg.description}</p>

                <div className="mb-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{pkg.rating}</span>
                    <span className="text-muted-foreground">({pkg.reviews})</span>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {pkg.includes.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>

                <div className="mb-4 border-t pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      ${pkg.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-2xl font-bold text-[#E91E63]">${pkg.price.toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">o {pkg.miles.toLocaleString()} millas</p>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#E91E63] hover:bg-[#E91E63]/90">
                    Ver Detalles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
