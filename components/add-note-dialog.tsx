"use client"

import type React from "react"
import { useState } from "react"

import type { Note } from "@/lib/types"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { generateId } from "@/lib/utils"
import { DialogClose } from "@radix-ui/react-dialog"
import { useLanguage } from "@/contexts/language-context"
import { useEntitiesStore } from "@/lib/stores"
import { useParams } from "next/navigation"
import { useToast } from "./ui/use-toast"


export function AddNoteDialog() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [open, onOpenChange] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()
  const { entitySlug } = useParams()
  const { getEntity, updateEntity: updateEntityInStore } = useEntitiesStore()
  
  const entity = getEntity(entitySlug as string)
  const saveProject = () => console.warn('Save project not implemented')
  const updateEntity = (updates: any) => updateEntityInStore(entitySlug as string, updates)
  const { toast } = useToast()

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
        content: content.trim(),
        createdAt: new Date().toISOString(),
        id: generateId(),
        title: title.trim(),
      }

      updateEntity({
        notes: [...(entity.notes || []), newNote]
      })

      saveProject()

      toast({
        description: `"${newNote.title}" notu başarıyla eklendi.`,
        title: "Not eklendi",
        variant: "success",
      })

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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button >Not Ekle</Button>
      </DialogTrigger>
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
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Karakter Motivasyonu"
                value={title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Not İçeriği</Label>
              <Textarea
                id="content"
                onChange={(e) => setContent(e.target.value)}
                placeholder="Notunuzun içeriği..."
                rows={5}
                value={content}
              />
            </div>

            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isSubmitting} type="button" variant="outline">
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Ekleniyor..." : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
