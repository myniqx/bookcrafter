"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon, X, Eye } from "lucide-react"
import type { ProjectImage } from "@/lib/types"
import { generateId } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface ImageManagerProps {
  images: ProjectImage[]
  onAddImage: (image: ProjectImage) => void
  onRemoveImage: (imageId: string) => void
  onSetCoverImage?: (imageId: string) => void
  onSetBackgroundImage?: (imageId: string) => void
  coverImageId?: string
  backgroundImageId?: string
}

export function ImageManager({
  images,
  onAddImage,
  onRemoveImage,
  onSetCoverImage,
  onSetBackgroundImage,
  coverImageId,
  backgroundImageId,
}: ImageManagerProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageType, setImageType] = useState<ProjectImage["type"]>("cover")
  const [imageName, setImageName] = useState("")
  const [previewImage, setPreviewImage] = useState<ProjectImage | null>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Geçersiz dosya",
        description: "Lütfen bir resim dosyası seçin.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Dosya çok büyük",
        description: "Resim dosyası 5MB'dan küçük olmalıdır.",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    setImageName(file.name.replace(/\.[^/.]+$/, ""))
  }

  const handleUpload = async () => {
    if (!selectedFile || !imageName.trim()) return

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result as string

        const newImage: ProjectImage = {
          id: generateId(),
          name: imageName.trim(),
          type: imageType,
          data,
          mimeType: selectedFile.type,
          size: selectedFile.size,
          createdAt: new Date().toISOString(),
        }

        onAddImage(newImage)

        toast({
          title: "Resim eklendi",
          description: `${newImage.name} başarıyla eklendi.`,
          variant: "success",
        })

        // Reset form
        setSelectedFile(null)
        setImageName("")
        setIsUploadOpen(false)
      }

      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error("Resim yüklenirken hata:", error)
      toast({
        title: "Yükleme hatası",
        description: "Resim yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getImageTypeLabel = (type: ProjectImage["type"]) => {
    switch (type) {
      case "cover":
        return "Kapak"
      case "background":
        return "Arka Plan"
      case "chapter":
        return "Bölüm"
      case "entity":
        return "Varlık"
      default:
        return type
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Resim Yönetimi</h3>
        <Button onClick={() => setIsUploadOpen(true)} size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Resim Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm truncate">{image.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPreviewImage(image)}>
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => onRemoveImage(image.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img src={image.data || "/placeholder.svg"} alt={image.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="secondary">{getImageTypeLabel(image.type)}</Badge>
                <span>{formatFileSize(image.size)}</span>
              </div>
              {image.type === "cover" && onSetCoverImage && (
                <Button
                  variant={coverImageId === image.id ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => onSetCoverImage(image.id)}
                >
                  {coverImageId === image.id ? "Kapak Resmi" : "Kapak Yap"}
                </Button>
              )}
              {image.type === "background" && onSetBackgroundImage && (
                <Button
                  variant={backgroundImageId === image.id ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => onSetBackgroundImage(image.id)}
                >
                  {backgroundImageId === image.id ? "Arka Plan" : "Arka Plan Yap"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Henüz resim eklenmemiş</p>
          <p className="text-sm">Projenize resim eklemek için yukarıdaki butonu kullanın</p>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resim Ekle</DialogTitle>
            <DialogDescription>
              Projenize yeni bir resim ekleyin. Desteklenen formatlar: JPG, PNG, GIF, WebP
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Resim Dosyası</Label>
              <Input id="file" type="file" accept="image/*" onChange={handleFileSelect} className="mt-1" />
            </div>

            {selectedFile && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Resim Adı</Label>
                  <Input
                    id="name"
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    placeholder="Resim adını girin"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Resim Türü</Label>
                  <Select value={imageType} onValueChange={(value) => setImageType(value as ProjectImage["type"])}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Kapak Resmi</SelectItem>
                      <SelectItem value="background">Arka Plan Resmi</SelectItem>
                      <SelectItem value="chapter">Bölüm Resmi</SelectItem>
                      <SelectItem value="entity">Varlık Resmi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Dosya boyutu: {formatFileSize(selectedFile.size)}</p>
                  <p>Dosya türü: {selectedFile.type}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || !imageName.trim()}>
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.name}</DialogTitle>
            <DialogDescription>
              {previewImage && getImageTypeLabel(previewImage.type)} •{" "}
              {previewImage && formatFileSize(previewImage.size)}
            </DialogDescription>
          </DialogHeader>
          {previewImage && (
            <div className="max-h-[70vh] overflow-auto">
              <img src={previewImage.data || "/placeholder.svg"} alt={previewImage.name} className="w-full h-auto" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
