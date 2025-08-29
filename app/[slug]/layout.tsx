"use client"
import React, { Usable, useEffect } from "react"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { useCurrentProjectStore } from "@/lib/stores"

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: Usable<{ slug: string }>
}) {
  const { slug } = React.use(params)
  const setMetadata = useCurrentProjectStore(state => state.setMetadata)

  // Initialize project metadata based on slug
  useEffect(() => {
    if (slug) {
      // Mock project loading - in real app would fetch from storage
      setMetadata({
        adapterType: 'localStorage',
        createdAt: new Date().toISOString(),
        description: `Project description for ${slug}`,
        name: `Project ${slug}`,
        slug,
        updatedAt: new Date().toISOString()
      })
    }
  }, [slug, setMetadata])

  return (
    <SidebarProvider>
      <SidebarNavigation />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
        </header>
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
