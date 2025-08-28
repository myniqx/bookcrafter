"use client"

import type React from "react"
import { useEffect, useState } from "react"

import type { Entity, EntityProperty, EntityType } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { generateId, slugify } from "@/lib/utils"
import { useEntitiesActions } from "@/hooks/use-entities-actions"
import { useCurrentProjectStore } from "@/lib/stores"

interface CreateEntityFormProps {
  entityType: EntityType
  onCancel: () => void
}

export function CreateEntityForm({ entityType, onCancel }: CreateEntityFormProps) {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { metadata: project } = useCurrentProjectStore()
  const { addEntity, isAdding } = useEntitiesActions(project.slug)
  const { t } = useLanguage()

  // Update slug when name changes
  useEffect(() => {
    setSlug(slugify(name))
  }, [name])

  const getEntityTypeTitle = () => t(entityType)

  const getDefaultProperties = (): EntityProperty[] => {
    const now = new Date().toISOString()

    switch (entityType) {
      case "character":
        return [
          {
            id: generateId(),
            isDefault: true,
            name: "fullname",
            value: name,
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
            isDefault: true,
            name: "name",
            value: name,
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
            isDefault: true,
            name: "name",
            value: name,
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
            isDefault: true,
            name: "name",
            value: name,
          },
          {
            id: generateId(),
            name: "date",
            value: "",
          },
        ]
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
        createdAt: now,
        description: description.trim() || undefined,
        name: name.trim(),
        notes: [],
        properties: getDefaultProperties(),
        slug: slug.trim(),
        type: entityType,
        updatedAt: now,
        usages: [],
      }

      await addEntity(newEntity)

      // Reset form
      setName("")
      setSlug("")
      setDescription("")
      onCancel()
    } catch (err) {
      console.error(`${getEntityTypeTitle()} oluşturulurken hata oluştu:`, err)
      setError(`${getEntityTypeTitle()} oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4 border rounded-md p-4" onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium">Yeni {getEntityTypeTitle()} Oluştur</h3>

      <div className="grid gap-2">
        <Label htmlFor="name">{getEntityTypeTitle()} Adı</Label>
        <Input
          id="name"
          onChange={(e) => setName(e.target.value)}
          placeholder={`Örn: ${entityType === "character"
              ? "Ayşe Yılmaz"
              : entityType === "location"
                ? "Büyük Kale"
                : entityType === "item"
                  ? "Sihirli Kılıç"
                  : "Büyük Savaş"
            }`}
          value={name}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="slug">Slug (Referans için)</Label>
        <div className="flex">
          <span className="flex items-center bg-muted px-3 rounded-l-md border border-r-0 border-input">@</span>
          <Input
            className="rounded-l-none"
            id="slug"
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ornek-slug"
            value={slug}
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
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`${getEntityTypeTitle()} hakkında kısa bir açıklama`}
          rows={3}
          value={description}
        />
      </div>

      {error && <div className="text-sm font-medium text-destructive">{error}</div>}

      <div className="flex justify-end gap-2">
        <Button disabled={isSubmitting || isAdding} onClick={onCancel} type="button" variant="outline">
          {t("cancel")}
        </Button>
        <Button disabled={isSubmitting || isAdding} type="submit">
          {isSubmitting || isAdding ? t("creating") : t("create")}
        </Button>
      </div>
    </form>
  )
}
