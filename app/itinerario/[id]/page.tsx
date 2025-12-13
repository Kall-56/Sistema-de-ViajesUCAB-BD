import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ItineraryBuilder } from "@/components/itinerary-builder"

export default function ItineraryDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ItineraryBuilder ventaId={Number(params.id)} />
      </main>
      <Footer />
    </div>
  )
}

