"use client"

import type React from "react"
import { useState } from "react"

import { useRouter } from "next/navigation"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { goToProject } from "@/lib/utils/navigateTo"

interface LoadProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoadProjectDialog({ onOpenChange, open }: LoadProjectDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      const content = await readFileAsText(file)
      const project = JSON.parse(content)

      if (!project.id || !project.name) {
        throw new Error("Geçersiz proje dosyası.")
      }

      // Store in localStorage for easier access later
      const localStorageKey = `project_${project.id}`
      localStorage.setItem(localStorageKey, content)

      // Update projects list
      const projectsListKey = "projects_list"
      const projectsListJson = localStorage.getItem(projectsListKey)
      const projectsList = projectsListJson ? JSON.parse(projectsListJson) : []

      // Check if project already exists in the list
      const existingIndex = projectsList.findIndex((p: any) => p.id === project.id)

      if (existingIndex >= 0) {
        projectsList[existingIndex] = project
      } else {
        projectsList.push(project)
      }

      localStorage.setItem(projectsListKey, JSON.stringify(projectsList))

      onOpenChange(false)
      goToProject({ projectSlug: project.slug, router })
    } catch (err) {
      console.error("Proje yüklenirken hata oluştu:", err)
      setError("Geçersiz proje dosyası. Lütfen doğru JSON formatında bir dosya seçin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Proje Yükle</DialogTitle>
          <DialogDescription>Daha önce oluşturduğunuz bir projeyi JSON dosyasından yükleyin.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-file">Proje Dosyası</Label>
            <Input accept=".json" disabled={isLoading} id="project-file" onChange={handleFileUpload} type="file" />
            <p className="text-xs text-muted-foreground mt-1">
              Yalnızca bu uygulama tarafından oluşturulan JSON dosyaları desteklenir.
            </p>
          </div>

          {error && <div className="text-sm font-medium text-destructive">{error}</div>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to read file content
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = (e) => reject(e)
    reader.readAsText(file)
  })
}

// Input component for file upload
function Input({ accept, disabled, id, onChange, type }: any) {
  return (
    <div className="relative">
      <input
        accept={accept}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        disabled={disabled}
        id={id}
        onChange={onChange}
        type={type}
      />
    </div>
  )
}
