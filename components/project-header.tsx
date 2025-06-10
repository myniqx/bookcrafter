"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useProject } from "@/providers/project-provider"

import { EditableText } from "./editable-text"


export function ProjectHeader() {
  const { hasUnsavedChanges, project, updateProjectMetadata } = useProject()

  if (!project) return null
  const onNameChange = (name: string) => {
    updateProjectMetadata({ name })
  }

  const onDescriptionChange = (description: string) => {
    updateProjectMetadata({ description })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button className="rounded-full" size="icon" variant="ghost">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Geri</span>
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
            <EditableText
              className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
              isTitle
              onChange={onNameChange}
              value={project.name}
            />
            {hasUnsavedChanges && <span className="text-red-500">*</span>}
          </h1>
          <div className="text-muted-foreground mt-1">
            <EditableText
              multiline
              onChange={onDescriptionChange}
              placeholder="Proje açıklaması ekleyin..."
              value={project.description || ""}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
