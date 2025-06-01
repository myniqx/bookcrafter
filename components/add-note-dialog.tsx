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
import { Textarea } from "@/components/ui/textarea"
import type { Note } from "@/lib/types"
import { generateId } from "@/lib/utils"

interface AddNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddNote: (note: Note) => void
}

export function AddNoteDialog({ open, onOpenChange, onAddNote }: AddNoteDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Not başlığı gereklidir.")
      return
    }

    if (!content.trim()) {
      setError("Not içeriği gereklidir.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const newNote: Note = {
        id: generateId(),
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }

      onAddNote(newNote)

      // Reset form
      setTitle("")
      setContent("")
    } catch (err) {
      console.error("Not eklenirken hata oluştu:", err)
      setError("Not eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Not Ekle</DialogTitle>
            <DialogDescription>
              Öğeye yeni bir not ekleyin. Notlar, öğe hakkında hatırlamak istediğiniz bilgileri saklamanıza yardımcı
              olur.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Not Başlığı</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Karakter Motivasyonu"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Not İçeriği</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Notunuzun içeriği..."
                rows={5}
              />
            </div>

            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Ekleniyor..." : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
