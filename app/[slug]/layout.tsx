"use client"
import type React from "react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { ProjectProvider } from "@/providers/project-provider"

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: { slug: string }
}) {
  const { slug } = params
  return (
    <ProjectProvider projectId={slug}>
      <div className="flex min-h-screen">
        <SidebarNavigation />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </ProjectProvider>
  )
}
