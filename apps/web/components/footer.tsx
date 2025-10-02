import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="border-t bg-[#424242] text-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 inline-block">
              <div className="rounded-lg bg-white p-2">
                <Image
                  src="/images/viajesucab-logo.png"
                  alt="ViajesUCAB"
                  width={160}
                  height={70}
                  className="h-10 w-auto"
                />
              </div>
            </Link>
            <p className="mb-4 text-sm text-white/80">
              17 años conectando personas con sus destinos soñados. Tecnología, experiencia y pasión por los viajes.
            </p>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="hover:bg-white/10 hover:text-white">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:bg-white/10 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:bg-white/10 hover:text-white">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:bg-white/10 hover:text-white">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faqs" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Preguntas Frecuentes (FAQs)
                </Link>
              </li>
              <li>
                <Link href="/politicas-cancelacion" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Políticas de Cancelación
                </Link>
              </li>
              <li>
                <Link href="/soporte" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Soporte al Cliente
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Nuestros Servicios</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/vuelos" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Reserva de Vuelos
                </Link>
              </li>
              <li>
                <Link href="/hoteles" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Hoteles y Hospedaje
                </Link>
              </li>
              <li>
                <Link href="/paquetes" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Paquetes Turísticos
                </Link>
              </li>
              <li>
                <Link href="/cruceros" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Cruceros
                </Link>
              </li>
              <li>
                <Link href="/traslados" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Traslados y Transporte
                </Link>
              </li>
              <li>
                <Link href="/tours" className="text-white/70 transition-colors hover:text-[#E91E63]">
                  Tours y Excursiones
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#E91E63]" />
                <div>
                  <p className="text-white/90">+58 212 555-0123</p>
                  <p className="text-white/70">Lun - Vie: 8am - 6pm</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#E91E63]" />
                <a href="mailto:info@viajesucab.com" className="text-white/90 hover:text-[#E91E63]">
                  info@viajesucab.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E91E63]" />
                <span className="text-white/90">Caracas, Venezuela</span>
              </li>
            </ul>
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-white">Suscríbete a nuestro Newsletter</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Tu email"
                  type="email"
                  className="h-9 border-white/20 bg-white/10 text-white placeholder:text-white/50"
                />
                <Button size="sm" className="bg-[#E91E63] hover:bg-[#E91E63]/90">
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/70">
          <p>&copy; {new Date().getFullYear()} ViajesUCAB. Todos los derechos reservados.</p>
          <p className="mt-2">RIF: J-12345678-9 | Licencia de Turismo: LT-2024-001</p>
        </div>
      </div>
    </footer>
  )
}
