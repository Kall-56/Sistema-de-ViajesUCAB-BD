import { Header } from "@/components/header"
import { HeroCarousel } from "@/components/hero-carousel"
import { DestinationsSection } from "@/components/destinations-section"
import { PromotionsSection } from "@/components/promotions-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { AboutSection } from "@/components/about-section"
import { MissionVisionSection } from "@/components/mission-vision-section"
import { Footer } from "@/components/footer"
import { OnboardingProvider } from "@/components/onboarding-provider"

export default function HomePage() {
  return (
    <OnboardingProvider>
      <div className="min-h-screen overflow-x-hidden">
        <Header />
        <main className="overflow-x-hidden">
          <HeroCarousel />

          <DestinationsSection />

          <PromotionsSection />

          <TestimonialsSection />

          <AboutSection />
          <MissionVisionSection />
        </main>
        <Footer />
      </div>
    </OnboardingProvider>
  )
}
