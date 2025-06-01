"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import type { Project } from "@/lib/types"
import { EditableText } from "./editable-text"
import { useState } from "react"
import { ExportDialog } from "./export-dialog"
import { useProject } from "@/providers/project-provider"


export function ProjectHeader() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const { project, hasUnsavedChanges, updateProject } = useProject()

  if(!project) return null

  const onNameChange = (name: string) => {
    updateProject({ ...project, name })
  }

  const onDescriptionChange = (description: string) => {
    updateProject({ ...project, description })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Geri</span>
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
            <EditableText
              value={project.name}
              onChange={onNameChange}
              isTitle
              className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
            />
            {hasUnsavedChanges && <span className="text-red-500">*</span>}
          </h1>
          <div className="text-muted-foreground mt-1">
            <EditableText
              value={project.description || ""}
              onChange={onDescriptionChange}
              placeholder="Proje açıklaması ekleyin..."
              multiline
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsExportDialogOpen(true)}
          className="rounded-full"
          title="Projeyi Export Et"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <ExportDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen} project={project} />
    </div>
  )
}
