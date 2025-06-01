"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Chapter } from "@/lib/types"
import { generateId } from "@/lib/utils"

interface CreateChapterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateChapter: (chapter: Chapter) => void
  existingChapters?: Chapter[]
}

export function CreateChapterDialog({
  open,
  onOpenChange,
  onCreateChapter,
  existingChapters = [],
}: CreateChapterDialogProps) {
  const [title, setTitle] = useState("")
  const [number, setNumber] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Bölüm başlığı gereklidir.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const now = new Date().toISOString()

      // Eğer numara belirtilmemişse, mevcut en küçük numarayı bul
      let chapterNumber: number | undefined = number ? Number.parseInt(number) : undefined

      if (chapterNumber === undefined && existingChapters) {
        // Mevcut bölüm numaralarını al
        const existingNumbers = existingChapters
          .map((ch) => ch.number)
          .filter((num): num is number => num !== undefined)
          .sort((a, b) => a - b)

        // Boşluk bul (1, 2, 4 varsa 3'ü bul)
        let nextNumber = 1
        for (const num of existingNumbers) {
          if (num > nextNumber) {
            break
          }
          nextNumber = num + 1
        }

        chapterNumber = nextNumber
      }

      const newChapter: Chapter = {
        id: generateId(),
        title: title.trim(),
        number: chapterNumber,
        content: "",
        createdAt: now,
        updatedAt: now,
      }

      onCreateChapter(newChapter)

      // Reset form
      setTitle("")
      setNumber("")
    } catch (err) {
      console.error("Bölüm oluşturulurken hata oluştu:", err)
      setError("Bölüm oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Yeni Bölüm Ekle</DialogTitle>
            <DialogDescription>
              Kitabınıza yeni bir bölüm ekleyin. Daha sonra içeriğini yazabilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Bölüm Başlığı</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Yeni Başlangıçlar"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="number">Bölüm Numarası (Opsiyonel)</Label>
              <Input
                id="number"
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Örn: 1"
                min="1"
              />
            </div>

            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
