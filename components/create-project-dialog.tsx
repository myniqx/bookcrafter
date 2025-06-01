"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useProjects } from "@/hooks/use-projects"
import type { AdapterType } from "@/lib/types"
import { generateId, slugify } from "@/lib/utils"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const router = useRouter()
  const { createProject } = useProjects()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [adapterType, setAdapterType] = useState<AdapterType>("localStorage")
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
      const now = new Date().toISOString()
      const slug = slugify(trimmedName)


      await createProject({
        slug,
        name: trimmedName,
        description: description.trim() || undefined,
        createdAt: now,
        updatedAt: now,
        adapterType,
        books: [],
        entities: [],
        images: []
      })

      onOpenChange(false)
      router.push(`/project/${slug}`)
    } catch (err) {
      console.error("Proje oluşturulurken hata oluştu:", err)
      setError("Proje oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Yeni Proje Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir kitap yazma projesi oluşturun. Projenize bir isim verin ve veri saklama yöntemini seçin.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Proje Adı</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Fantastik Dünya Serisi"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Projenizin kısa bir açıklaması"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Veri Saklama Yöntemi</Label>
              <RadioGroup value={adapterType} onValueChange={(value) => setAdapterType(value as AdapterType)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="localStorage" id="localStorage" />
                  <Label htmlFor="localStorage">Tarayıcı Depolama (LocalStorage)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jsonFile" id="jsonFile" />
                  <Label htmlFor="jsonFile">JSON Dosyası (İndir/Yükle)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compressedFile" id="compressedFile" />
                  <Label htmlFor="compressedFile">Sıkıştırılmış Dosya (.bookcraft)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="directorySync" id="directorySync" />
                  <Label htmlFor="directorySync">Klasör Senkronizasyonu</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground mt-1">
                {adapterType === "localStorage" &&
                  "Veriler tarayıcınızda saklanır. Tarayıcı geçmişini temizlerseniz verileriniz kaybolabilir."}
                {adapterType === "jsonFile" &&
                  "Veriler JSON dosyası olarak bilgisayarınıza indirilir. Projeyi açmak için dosyayı manuel olarak yüklemeniz gerekir."}
                {adapterType === "compressedFile" &&
                  "Veriler resimlerle birlikte sıkıştırılmış .bookcraft dosyası olarak indirilir. Daha organize ve kompakt saklama."}
                {adapterType === "directorySync" &&
                  "Veriler seçtiğiniz klasöre otomatik olarak senkronize edilir. Modern tarayıcılarda desteklenir."}
              </p>
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
