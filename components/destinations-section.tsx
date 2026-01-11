import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, TrendingUp } from "lucide-react"
import { WishlistButton } from "@/components/wishlist-button"

const destinations = [
  {
    name: "Punta Cana",
    country: "República Dominicana",
    trips: "2,450 viajes",
    image: "/punta-cana-beach-resort.jpg",
  },
  {
    name: "Miami",
    country: "Estados Unidos",
    trips: "3,120 viajes",
    image: "/miami-beach-skyline.png",
  },
  {
    name: "Madrid",
    country: "España",
    trips: "1,890 viajes",
    image: "/madrid-plaza-mayor-spain.jpg",
  },
  {
    name: "Buenos Aires",
    country: "Argentina",
    trips: "1,650 viajes",
    image: "/buenos-aires-obelisco-argentina.jpg",
  },
  {
    name: "Cartagena",
    country: "Colombia",
    trips: "2,230 viajes",
    image: "/cartagena-colombia-old-city.jpg",
  },
  {
    name: "Río de Janeiro",
    country: "Brasil",
    trips: "1,780 viajes",
    image: "/rio-christ-redeemer.png",
  },
]

export function DestinationsSection() {
  return (
    <section id="destinations" className="bg-muted/50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Más Solicitados</span>
          </div>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">Destinos Populares</h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Descubre los destinos favoritos de nuestros viajeros
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination, index) => (
            <Card key={index} className="group relative overflow-hidden">
              <div className="relative h-80 overflow-hidden">
                <img
                  src={destination.image || "/placeholder.svg"}
                  alt={destination.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Wishlist: requiere ID numérico de lugar (destinations-section usa nombres hardcodeados) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-2 flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span className="opacity-90">{destination.country}</span>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">{destination.name}</h3>
                  <p className="mb-4 text-sm opacity-75">{destination.trips} este año</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Explorar Destino
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
