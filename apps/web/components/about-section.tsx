import { Shield, Award, Users, Zap } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">
              Quiénes <span className="text-[#E91E63]">Somos</span>
            </h2>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              Con una trayectoria de <strong className="text-foreground">17 años</strong>, ViajesUCAB se ha consolidado
              como un referente de excelencia en el sector turístico.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E91E63]/10">
                <Shield className="h-8 w-8 text-[#E91E63]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Confianza</h3>
              <p className="text-sm text-muted-foreground">17 años de experiencia respaldando cada viaje</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E91E63]/10">
                <Award className="h-8 w-8 text-[#E91E63]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Excelencia</h3>
              <p className="text-sm text-muted-foreground">Servicio de calidad insuperable en cada detalle</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E91E63]/10">
                <Users className="h-8 w-8 text-[#E91E63]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Profesionales</h3>
              <p className="text-sm text-muted-foreground">Equipo altamente capacitado y dedicado</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E91E63]/10">
                <Zap className="h-8 w-8 text-[#E91E63]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Tecnología</h3>
              <p className="text-sm text-muted-foreground">Plataforma de vanguardia para tu comodidad</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
