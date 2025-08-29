"use client"

import type React from "react"
import { useState } from "react"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProjects } from "@/hooks/use-projects"
import { goToProject } from "@/lib/utils/navigateTo"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ onOpenChange, open }: CreateProjectDialogProps) {
  const router = useRouter()
  const { createProject } = useProjects()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Proje adı gereklidir.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const project = await createProject({
        name: trimmedName,
        description: description.trim() || undefined
      })

      // Reset form
      setName("")
      setDescription("")
      setError(null)

      onOpenChange(false)

      // Navigate to project dashboard
      goToProject({ project: { slug: project.metadata.slug }, router })
    } catch (err) {
      console.error("Proje oluşturulurken hata oluştu:", err)
      setError("Proje oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Yeni Proje Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir kitap yazma projesi oluşturun. Projenize bir isim verin ve yazmaya başlayın.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Proje Adı</Label>
              <Input
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Fantastik Dünya Serisi"
                value={name}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Textarea
                id="description"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Projenizin kısa bir açıklaması"
                rows={3}
                value={description}
              />
            </div>

            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
          </div>

          <DialogFooter>
            <Button disabled={isSubmitting} onClick={() => onOpenChange(false)} type="button" variant="outline">
              İptal
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
