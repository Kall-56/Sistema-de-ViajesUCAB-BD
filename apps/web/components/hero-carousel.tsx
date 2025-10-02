"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Tag } from "lucide-react"

const promotions = [
  {
    id: 1,
    title: "Cancún Todo Incluido",
    description: "7 noches en resort 5 estrellas con vuelo incluido",
    discount: "30% OFF",
    validUntil: "15 de Octubre",
    price: "Desde $1,299",
    image: "/cancun-beach-resort.png",
    cta: "Reservar Ahora",
  },
  {
    id: 2,
    title: "Europa Mágica",
    description: "París, Roma y Barcelona - 12 días inolvidables",
    discount: "25% OFF",
    validUntil: "30 de Octubre",
    price: "Desde $2,499",
    image: "/eiffel-tower-paris.png",
    cta: "Ver Itinerario",
  },
  {
    id: 3,
    title: "Crucero por el Caribe",
    description: "5 destinos paradisíacos en 8 días",
    discount: "40% OFF",
    validUntil: "20 de Octubre",
    price: "Desde $899",
    image: "/luxury-cruise-ship-mediterranean.jpg",
    cta: "Comprar Ahora",
  },
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promotions.length) % promotions.length)
  }

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-[#424242]">
      {promotions.map((promo, index) => (
        <div
          key={promo.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={promo.image || "/placeholder.svg"}
            alt={promo.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

          <div className="container relative mx-auto h-full px-4">
            <div className="flex h-full max-w-2xl flex-col justify-center">
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E91E63] px-3 py-1 text-sm font-bold text-white">
                  <Tag className="h-3 w-3" />
                  {promo.discount}
                </span>
                <span className="text-sm text-white/90">Válido hasta {promo.validUntil}</span>
              </div>

              <h2 className="mb-4 text-balance text-4xl font-bold text-white md:text-5xl lg:text-6xl">{promo.title}</h2>

              <p className="mb-6 text-pretty text-lg text-white/90 md:text-xl">{promo.description}</p>

              <div className="mb-6">
                <p className="text-3xl font-bold text-white md:text-4xl">{promo.price}</p>
                <p className="text-sm text-white/80">por persona</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="bg-[#E91E63] hover:bg-[#E91E63]/90 text-white">
                  {promo.cta}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#424242] bg-transparent"
                >
                  Cotizar
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#424242] bg-transparent"
                >
                  Más Información
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
        aria-label="Siguiente"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {promotions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"}`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
