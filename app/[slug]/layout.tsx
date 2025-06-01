"use client"
import React, { Usable } from "react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { ProjectProvider } from "@/providers/project-provider"

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode,
    params: Usable<{ slug: string }>
}) {
  const { slug } = React.use(params)
  return (
    <ProjectProvider projectId={slug}>
      <div className="flex min-h-screen">
        <SidebarNavigation />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </ProjectProvider>
  )
}
