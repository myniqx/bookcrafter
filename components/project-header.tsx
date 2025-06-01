"use client"

import { Button } from "@/components/ui/button"
import { useProject } from "@/providers/project-provider"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { EditableText } from "./editable-text"


export function ProjectHeader() {
  const { project, hasUnsavedChanges, updateProject, saveProject } = useProject()

  if (!project) return null
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
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
            <EditableText
              value={project.name}
              onChange={onNameChange}
              isTitle
              className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
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

      </div>
    </div>
  )
}
