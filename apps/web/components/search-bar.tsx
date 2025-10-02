"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, MapPin, Calendar, Users } from "lucide-react"

export function SearchBar() {
  const [searchType, setSearchType] = useState<"flights" | "hotels" | "packages">("flights")

  return (
    <Card className="mx-auto max-w-5xl p-6 shadow-xl">
      <div className="mb-6 flex gap-2">
        <Button
          variant={searchType === "flights" ? "default" : "outline"}
          onClick={() => setSearchType("flights")}
          className="flex-1"
        >
          Vuelos
        </Button>
        <Button
          variant={searchType === "hotels" ? "default" : "outline"}
          onClick={() => setSearchType("hotels")}
          className="flex-1"
        >
          Hoteles
        </Button>
        <Button
          variant={searchType === "packages" ? "default" : "outline"}
          onClick={() => setSearchType("packages")}
          className="flex-1"
        >
          Paquetes
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative md:col-span-1">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Origen" className="pl-10" />
        </div>
        <div className="relative md:col-span-1">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Destino" className="pl-10" />
        </div>
        <div className="relative md:col-span-1">
          <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input type="date" placeholder="Fecha" className="pl-10" />
        </div>
        <div className="relative md:col-span-1">
          <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input type="number" placeholder="Pasajeros" className="pl-10" defaultValue="1" min="1" />
        </div>
      </div>

      <Button className="mt-6 w-full" size="lg">
        <Search className="mr-2 h-5 w-5" />
        Buscar {searchType === "flights" ? "Vuelos" : searchType === "hotels" ? "Hoteles" : "Paquetes"}
      </Button>
    </Card>
  )
}
