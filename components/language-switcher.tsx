"use client"

import { Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { type Language, useLanguage } from "@/contexts/language-context"

const languages: { code: Language; name: string; flag: string }[] = [
  { code: "tr", flag: "🇹🇷", name: "Türkçe" },
  { code: "en", flag: "🇺🇸", name: "English" },
]

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const currentLanguage = languages.find((lang) => lang.code === language)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2" size="sm" variant="outline">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          <span className="hidden md:inline">{currentLanguage?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            className={language === lang.code ? "bg-accent" : ""}
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
