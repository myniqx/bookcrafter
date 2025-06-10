"use client"

import type React from "react"
import { useState } from "react"

import { DialogClose, DialogTrigger } from "@radix-ui/react-dialog"
import { Plus } from "lucide-react"

import type { Chapter } from "@/lib/types"

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
import { useLanguage } from "@/contexts/language-context"
import { slugify } from "@/lib/utils"
import { useBook } from "@/providers/book-provider"


export function CreateChapterDialog() {
  const { t } = useLanguage()
  const [title, setTitle] = useState("")
  const [open, onOpenChange] = useState(false)
  const [number, setNumber] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addChapter, chapters } = useBook()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError("Bölüm başlığı gereklidir.")
      return
    }

    const slug = slugify(trimmedTitle)

    if (chapters?.some((chapter) => chapter.slug === slug)) {
      setError("Bu bölüm zaten mevcut.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const now = new Date().toISOString()

      // Eğer numara belirtilmemişse, mevcut en küçük numarayı bul
      let chapterNumber: number | undefined = number ? Number.parseInt(number) : undefined

      if (chapterNumber === undefined && chapters) {
        // Mevcut bölüm numaralarını al
        const existingNumbers = chapters
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
        content: "",
        createdAt: now,
        number: chapterNumber,
        slug,
        title: title.trim(),
        updatedAt: now,
      }

      addChapter(newChapter)

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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {chapters ? t("add_new_chapter") : t("create_first_chapter")}
        </Button>
      </DialogTrigger>
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
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Yeni Başlangıçlar"
                value={title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="number">Bölüm Numarası (Opsiyonel)</Label>
              <Input
                id="number"
                min="1"
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Örn: 1"
                type="number"
                value={number}
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
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
