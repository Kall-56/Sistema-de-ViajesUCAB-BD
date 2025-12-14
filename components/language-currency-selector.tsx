"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe, DollarSign, Check } from "lucide-react"

interface Language {
  code: string
  name: string
  flag: string
}

interface Currency {
  code: string
  name: string
  symbol: string
  rate: number
}

const languages: Language[] = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
]

const currencies: Currency[] = [
  { code: "USD", name: "Dólar Estadounidense", symbol: "$", rate: 1 },
  { code: "VES", name: "Bolívar Venezolano", symbol: "Bs.", rate: 36.5 },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0.92 },
  { code: "COP", name: "Peso Colombiano", symbol: "$", rate: 4200 },
  { code: "ARS", name: "Peso Argentino", symbol: "$", rate: 850 },
]

export function LanguageCurrencySelector() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0])
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0])

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language)
    // In production, this would update the app's locale and persist to localStorage/cookies
    localStorage.setItem("preferred-language", language.code)
  }

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency)
    // In production, this would update prices throughout the app and persist preference
    localStorage.setItem("preferred-currency", currency.code)
  }

  return (
    <div className="flex items-center gap-1 lg:gap-2 shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 lg:gap-2 shrink-0">
            <Globe className="h-4 w-4 shrink-0" />
            <span className="hidden lg:inline">{selectedLanguage.flag}</span>
            <span className="hidden xl:inline">{selectedLanguage.code.toUpperCase()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Idioma / Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language)}
              className="cursor-pointer"
            >
              <span className="mr-2">{language.flag}</span>
              <span className="flex-1">{language.name}</span>
              {selectedLanguage.code === language.code && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 lg:gap-2 shrink-0">
            <DollarSign className="h-4 w-4 shrink-0" />
            <span className="hidden lg:inline">{selectedCurrency.code}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Moneda / Currency</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {currencies.map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => handleCurrencyChange(currency)}
              className="cursor-pointer"
            >
              <div className="flex-1">
                <div className="font-medium">
                  {currency.symbol} {currency.code}
                </div>
                <div className="text-xs text-muted-foreground">{currency.name}</div>
              </div>
              {selectedCurrency.code === currency.code && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
