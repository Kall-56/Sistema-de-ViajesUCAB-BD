import { Card } from "@/components/ui/card"
import { Target, Eye } from "lucide-react"

export function MissionVisionSection() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="border-none p-8 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E91E63]/10">
                <Target className="h-6 w-6 text-[#E91E63]" />
              </div>
              <h2 className="mb-3 text-2xl font-bold">Nuestra Misión</h2>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Superar las expectativas de viaje de cada uno de nuestros clientes mediante un equipo de profesionales
                altamente capacitado, una estrategia comercial dinámica con promociones innovadoras de alto valor, y una
                infraestructura tecnológica de avanzada que garantiza seguridad y eficiencia.
              </p>
            </Card>

            <Card className="border-none p-8 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E91E63]/10">
                <Eye className="h-6 w-6 text-[#E91E63]" />
              </div>
              <h2 className="mb-3 text-2xl font-bold">Nuestra Visión</h2>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Consolidarnos como la plataforma líder en servicios turísticos, donde la experiencia del cliente sea la
                protagonista. Crear un ecosistema digital donde cada viajero tenga el poder de diseñar su aventura a
                medida, combinando tecnología de vanguardia con el toque humano que nos caracteriza.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
