export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#E91E63]/5 via-background to-[#424242]/5">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Descubre el Mundo con <span className="text-[#E91E63]">ViajesUCAB</span>
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Con una trayectoria de diecisiete (17) años, ViajesUCAB se ha consolidado como un referente de excelencia en
            el sector turístico. Nuestro norte siempre ha sido claro: ofrecer un servicio de calidad insuperable,
            especializándose en brindar las más selectas alternativas de viaje a precios exclusivos.
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#E91E63]/5 blur-3xl" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#424242]/5 blur-3xl" />
    </section>
  )
}
