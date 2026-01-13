"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardContent } from "@/components/dashboard-content"

export default function PerfilPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function checkAuth() {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" })
        if (!r.ok) {
          router.push("/login")
        }
      } catch (err) {
        router.push("/login")
      }
    }
    checkAuth()
  }, [router])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <DashboardContent />
      </main>
      <Footer />
    </div>
  )
}
