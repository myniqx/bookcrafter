"use client"

import type React from "react"
import { useState } from "react"

import { DialogClose, DialogTrigger } from "@radix-ui/react-dialog"
import { Plus } from "lucide-react"

import type { Book } from "@/lib/types"

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
import { useLanguage } from "@/contexts/language-context"
import { generateId, slugify } from "@/lib/utils"
import { useProject } from "@/providers/project-provider"

export function CreateBookDialog() {
  const { project, updateProject } = useProject()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  const bookExist = project.books.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError("Kitap başlığı gereklidir.")
      return
    }

    const slug = slugify(trimmedTitle)

    if (project?.books.some((book) => book.slug === slug)) {
      setError("Bu kitap zaten mevcut.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const now = new Date().toISOString()

      const newBook: Book = {
        chapters: [],
        createdAt: now,
        description: description.trim() || undefined,
        slug,
        title: trimmedTitle,
        updatedAt: now,
      }

      updateProject({
        ...project,
        books: [...project?.books, newBook],
      })

      // Reset form
      setTitle("")
      setDescription("")
    } catch (err) {
      console.error("Kitap oluşturulurken hata oluştu:", err)
      setError("Kitap oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {bookExist ? t("create_new_book") : t("create_first_book")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Yeni Kitap Oluştur</DialogTitle>
            <DialogDescription>
              Projenize yeni bir kitap ekleyin. Her kitap birden fazla bölüm içerebilir.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-8 py-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Kitap Başlığı</Label>
              <Input
                id="title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Karanlık Ormanın Sırları"
                value={title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Textarea
                id="description"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kitabınızın kısa bir açıklaması"
                rows={3}
                value={description}
              />
            </div>

            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isSubmitting} type="button" variant="outline">
                İptal
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Oluşturuluyor..." : "Oluştur"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
