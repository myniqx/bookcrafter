import type React from "react"

import type { Metadata } from "next"

import { Inter } from "next/font/google"

import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/contexts/language-context"
import { ApplicationProvider } from "@/providers/application-provider"
import { QueryProvider } from "@/providers/query-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  description: "Kitap yazma ve dünya inşa etme uygulaması",
  generator: 'v0.dev',
    title: "BookCraft - Kitap Yazma ve Dünya İnşa Etme"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ApplicationProvider>
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
              <LanguageProvider>
                {children}
                <Toaster />
              </LanguageProvider>
            </ThemeProvider>
          </QueryProvider>
        </ApplicationProvider>
      </body>
    </html>
  )
}
