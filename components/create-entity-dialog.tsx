"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import type { Entity, EntityProperty, EntityType } from "@/lib/types"
import { generateId, slugify } from "@/lib/utils"

interface CreateEntityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: EntityType
  onCreateEntity: (entity: Entity) => void
}

export function CreateEntityDialog({ open, onOpenChange, entityType, onCreateEntity }: CreateEntityDialogProps) {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update slug when name changes
  useEffect(() => {
    setSlug(slugify(name))
  }, [name])

  const getEntityTypeTitle = () => {
    switch (entityType) {
      case "character":
        return "Karakter"
      case "location":
        return "Mekan"
      case "item":
        return "Eşya"
      case "event":
        return "Olay"
    }
  }

  const getDefaultProperties = (): EntityProperty[] => {
    const now = new Date().toISOString()

    switch (entityType) {
      case "character":
        return [
          {
            id: generateId(),
            name: "fullname",
            value: name,
            isDefault: true,
          },
          {
            id: generateId(),
            name: "age",
            value: "",
          },
        ]
      case "location":
        return [
          {
            id: generateId(),
            name: "name",
            value: name,
            isDefault: true,
          },
          {
            id: generateId(),
            name: "type",
            value: "",
          },
        ]
      case "item":
        return [
          {
            id: generateId(),
            name: "name",
            value: name,
            isDefault: true,
          },
          {
            id: generateId(),
            name: "type",
            value: "",
          },
        ]
      case "event":
        return [
          {
            id: generateId(),
            name: "name",
            value: name,
            isDefault: true,
          },
          {
            id: generateId(),
            name: "date",
            value: "",
          },
        ]
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError(`${getEntityTypeTitle()} adı gereklidir.`)
      return
    }

    if (!slug.trim()) {
      setError("Slug gereklidir.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const now = new Date().toISOString()

      const newEntity: Entity = {
        id: generateId(),
        name: name.trim(),
        slug: slug.trim(),
        type: entityType,
        description: description.trim() || undefined,
        createdAt: now,
        updatedAt: now,
        properties: getDefaultProperties(),
        notes: [],
        usages: [],
      }

      onCreateEntity(newEntity)

      // Reset form
      setName("")
      setSlug("")
      setDescription("")
    } catch (err) {
      console.error(`${getEntityTypeTitle()} oluşturulurken hata oluştu:`, err)
      setError(`${getEntityTypeTitle()} oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Yeni {getEntityTypeTitle()} Oluştur</DialogTitle>
            <DialogDescription>
              Projenize yeni bir {getEntityTypeTitle().toLowerCase()} ekleyin. Daha sonra özellikler ve notlar
              ekleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{getEntityTypeTitle()} Adı</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Örn: ${
                  entityType === "character"
                    ? "Ayşe Yılmaz"
                    : entityType === "location"
                      ? "Büyük Kale"
                      : entityType === "item"
                        ? "Sihirli Kılıç"
                        : "Büyük Savaş"
                }`}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug (Referans için)</Label>
              <div className="flex">
                <span className="flex items-center bg-muted px-3 rounded-l-md border border-r-0 border-input">@</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ornek-slug"
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Bu, metin içinde öğeye referans vermek için kullanılacak benzersiz tanımlayıcıdır.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`${getEntityTypeTitle()} hakkında kısa bir açıklama`}
                rows={3}
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
