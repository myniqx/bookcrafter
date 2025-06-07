"use client"

import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useProject } from "@/hooks/use-project"

interface ExportButtonProps {
  projectId: string
  hasUnsavedChanges: boolean
  onSave: () => void
}

export function ExportButton({ hasUnsavedChanges, onSave, projectId }: ExportButtonProps) {
  const { project } = useProject(projectId)
  const { toast } = useToast()

  const handleExport = async () => {
    if (!project) return

    // If there are unsaved changes, save first
    if (hasUnsavedChanges) {
      onSave()
    }

    try {
      const jsonString = JSON.stringify(project, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${project.name.replace(/\s+/g, "_")}_${project.id}.json`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        description: `${project.name} başarıyla JSON dosyası olarak dışa aktarıldı.`,
        title: "Proje dışa aktarıldı",
        variant: "success",
      })
    } catch (error) {
      console.error("Proje dışa aktarılırken hata:", error)
      toast({
        description: "Proje dışa aktarılırken bir hata oluştu.",
        title: "Dışa aktarma hatası",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      className="rounded-full bg-background/80 backdrop-blur-xs border-muted"
      onClick={handleExport}
      size="icon"
      title="Projeyi Dışa Aktar"
      variant="outline"
    >
      <Download className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Projeyi Dışa Aktar</span>
    </Button>
  )
}
