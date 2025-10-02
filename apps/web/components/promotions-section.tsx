import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Percent, ArrowRight } from "lucide-react"

const promotions = [
  {
    title: "Caribe Todo Incluido",
    description: "Paquete completo a Cancún con vuelo, hotel 5 estrellas y traslados",
    discount: "30% OFF",
    price: "Desde $899",
    image: "/cancun-beach-resort.png",
  },
  {
    title: "Europa Mágica",
    description: "Tour por París, Roma y Barcelona. 10 días inolvidables",
    discount: "25% OFF",
    price: "Desde $1,499",
    image: "/eiffel-tower-paris.png",
  },
  {
    title: "Crucero Mediterráneo",
    description: "Navega por las costas más hermosas del Mediterráneo",
    discount: "40% OFF",
    price: "Desde $1,299",
    image: "/luxury-cruise-ship-mediterranean.jpg",
  },
]

export function PromotionsSection() {
  return (
    <section id="promotions" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Percent className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">Ofertas Especiales</span>
            </div>
            <h2 className="text-balance text-3xl font-bold md:text-4xl">Promociones Destacadas</h2>
          </div>
          <Button variant="outline" className="hidden md:inline-flex bg-transparent">
            Ver Todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo, index) => (
            <Card key={index} className="group overflow-hidden">
              <div className="relative overflow-hidden">
                <img
                  src={promo.image || "/placeholder.svg"}
                  alt={promo.title}
                  className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground">{promo.discount}</Badge>
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold">{promo.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{promo.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{promo.price}</span>
                  <Button size="sm">
                    Reservar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="w-full bg-transparent">
            Ver Todas las Promociones
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
