"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface WishlistButtonProps {
  itemId: number // ID numérico del servicio o lugar
  itemName: string
  itemType: "lugar" | "servicio" // Tipo de item
  variant?: "default" | "icon"
  className?: string
  onToggle?: (itemId: number, isInWishlist: boolean) => void
}

export function WishlistButton({ itemId, itemName, itemType, variant = "default", className, onToggle }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  // Verificar estado inicial
  useEffect(() => {
    async function checkWishlistStatus() {
      setIsLoading(true)
      try {
        const r = await fetch("/api/cliente/deseos", { cache: "no-store" })
        const data = await r.json()
        
        if (r.ok && data.deseos) {
          // Verificar si este item está en la lista
          if (itemType === "servicio") {
            setIsInWishlist(data.deseos.fk_servicio === itemId)
          } else if (itemType === "lugar") {
            setIsInWishlist(data.deseos.fk_lugar === itemId)
          }
        } else {
          setIsInWishlist(false)
        }
      } catch (err) {
        console.error("Error verificando lista de deseos:", err)
        setIsInWishlist(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkWishlistStatus()
  }, [itemId, itemType])

  const handleToggle = async () => {
    if (isToggling || isLoading) return

    setIsToggling(true)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    try {
      if (isInWishlist) {
        // Eliminar de lista de deseos
        const r = await fetch("/api/cliente/deseos", {
          method: "DELETE",
        })

        const data = await r.json()

        if (r.ok) {
          setIsInWishlist(false)
          toast.success("Eliminado de lista de deseos")
          onToggle?.(itemId, false)
        } else {
          throw new Error(data?.error ?? "Error eliminando de lista de deseos")
        }
      } else {
        // Agregar a lista de deseos
        const body = itemType === "servicio" 
          ? { fk_servicio: itemId, fk_lugar: null }
          : { fk_lugar: itemId, fk_servicio: null }

        const r = await fetch("/api/cliente/deseos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

        const data = await r.json()

        if (r.ok) {
          setIsInWishlist(true)
          toast.success("Agregado a lista de deseos")
          onToggle?.(itemId, true)
        } else {
          throw new Error(data?.error ?? "Error agregando a lista de deseos")
        }
      }
    } catch (err: any) {
      console.error("Error en toggle de lista de deseos:", err)
      toast.error("Error", {
        description: err.message ?? "No se pudo actualizar la lista de deseos",
      })
    } finally {
      setIsToggling(false)
    }
  }

  if (isLoading) {
    if (variant === "icon") {
      return (
        <Button
          size="icon"
          variant="secondary"
          className={cn("h-9 w-9 bg-white/90 hover:bg-white", className)}
          disabled
        >
          <Loader2 className="h-5 w-5 animate-spin" />
        </Button>
      )
    }
    return (
      <Button variant="outline" className={cn("bg-transparent", className)} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando...
      </Button>
    )
  }

  if (variant === "icon") {
    return (
      <Button
        size="icon"
        variant="secondary"
        className={cn("h-9 w-9 bg-white/90 hover:bg-white", className)}
        onClick={handleToggle}
        disabled={isToggling}
        aria-label={isInWishlist ? "Quitar de lista de deseos" : "Agregar a lista de deseos"}
      >
        {isToggling ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Heart
            className={cn(
              "h-5 w-5 transition-all",
              isAnimating && "scale-125",
              isInWishlist && "fill-[#E91E63] text-[#E91E63]",
            )}
          />
        )}
      </Button>
    )
  }

  return (
    <Button 
      variant="outline" 
      className={cn("bg-transparent", className)} 
      onClick={handleToggle}
      disabled={isToggling}
    >
      {isToggling ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <Heart
            className={cn(
              "mr-2 h-4 w-4 transition-all",
              isAnimating && "scale-125",
              isInWishlist && "fill-[#E91E63] text-[#E91E63]",
            )}
          />
          {isInWishlist ? "En Lista de Deseos" : "Agregar a Deseos"}
        </>
      )}
    </Button>
  )
}
