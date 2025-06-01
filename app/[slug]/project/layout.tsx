"use client"
import { ProjectHeader } from "@/components/project-header";



export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <ProjectHeader />
      </div>

      {children}
    </div>
  )
}
