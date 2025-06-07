"use client"

import type React from "react"
import { useState } from "react"

import type { EntityProperty } from "@/lib/types"

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
import { generateId } from "@/lib/utils"
import { useEntity } from "@/providers/entity-provider"
import { useToast } from "./ui/use-toast"
import { DialogClose } from "@radix-ui/react-dialog"
import { useLanguage } from "@/contexts/language-context"


export function AddPropertyDialog() {
  const [name, setName] = useState("")
  const [value, setValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, onOpenChange] = useState(false)
  const { entity, saveProject, updateEntity } = useEntity()
  const { toast } = useToast()
  const { t } = useLanguage()
  const properties = entity.properties || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Özellik adı gereklidir.")
      return
    }

    // Check if property name already exists
    if (properties.some((p) => p.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("Bu özellik adı zaten kullanılıyor.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const newProperty: EntityProperty = {
        id: generateId(),
        isDefault: properties.length === 0, // First property is default
        name: name.trim(),
        value: value.trim(),
      }

      updateEntity({
        properties: [...entity.properties, newProperty],
      })

      saveProject()

      toast({
        description: `"${newProperty.name}" özelliği başarıyla eklendi.`,
        title: "Özellik eklendi",
        variant: "success",
      })


      // Reset form
      setName("")
      setValue("")
    } catch (err) {
      console.error("Özellik eklenirken hata oluştu:", err)
      setError("Özellik eklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button >Özellik Ekle</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Özellik Ekle</DialogTitle>
            <DialogDescription>
              Öğeye yeni bir özellik ekleyin. Bu özelliği metin içinde @slug.özellikAdı şeklinde kullanabilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Özellik Adı</Label>
              <Input
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: age, height, color"
                value={name}
              />
              <p className="text-xs text-muted-foreground">
                Özellik adı yalnızca harf, rakam ve alt çizgi içerebilir. Boşluk kullanmayın.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="value">Değer</Label>
              <Input
                id="value"
                onChange={(e) => setValue(e.target.value)}
                placeholder="Özelliğin değeri"
                value={value}
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
