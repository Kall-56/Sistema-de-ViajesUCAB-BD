import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "María González",
    location: "Caracas, Venezuela",
    rating: 5,
    comment:
      "Excelente servicio. Organizaron mi luna de miel a Punta Cana y todo fue perfecto. El equipo de ViajesUCAB es muy profesional.",
    trip: "Luna de Miel - Punta Cana",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    location: "Valencia, Venezuela",
    rating: 5,
    comment:
      "La mejor agencia de viajes. Viajé con mi familia a Disney y nos ayudaron con cada detalle. Totalmente recomendados.",
    trip: "Viaje Familiar - Orlando",
  },
  {
    id: 3,
    name: "Ana Martínez",
    location: "Maracaibo, Venezuela",
    rating: 5,
    comment:
      "Increíble experiencia en Europa. El itinerario fue perfecto y los precios muy competitivos. Volveré a viajar con ellos.",
    trip: "Tour Europa - 15 días",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">
            Lo Que Dicen Nuestros <span className="text-[#E91E63]">Viajeros</span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Miles de clientes satisfechos han confiado en nosotros para hacer realidad sus sueños de viaje
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-[#E91E63] text-[#E91E63]" />
                  ))}
                </div>

                <p className="mb-4 text-pretty leading-relaxed">"{testimonial.comment}"</p>

                <div className="border-t pt-4">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  <p className="mt-1 text-xs font-medium text-[#E91E63]">{testimonial.trip}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
