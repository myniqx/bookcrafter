"use client"
import React, { Usable, useEffect } from "react"

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
    <div className="flex min-h-screen">
      <div className="w-64 bg-muted/20 border-r">
        <div className="p-4">
          <h2 className="font-semibold">Navigation</h2>
          <p className="text-sm text-muted-foreground">Project: {slug}</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4">
            <h1 className="font-semibold">BookCraft - {slug}</h1>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
