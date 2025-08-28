"use client"

import { useState } from "react"

import { DialogClose } from "@radix-ui/react-dialog"
import { Archive, Book, Download, File, FileText } from "lucide-react"

import type { ExportFormat, ExportOptions } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { CompressedFileAdapter } from "@/lib/adapters/compressed-file-adapter"
import { ExportManager } from "@/lib/export/export-manager"
import { useCurrentProjectStore } from "@/lib/stores"


export function ExportDialog() {
  const project = useCurrentProjectStore(state => state.metadata)
  const [isOpen, onOpenChange] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<"document" | "project">("document")
  const [options, setOptions] = useState<ExportOptions>({
    chapterStartsOnRight: true,
    fontFamily: "Arial",
    fontSize: 11,
    format: "pdf",
    includeCover: true,
    includeImages: true,
    includeTableOfContents: true,
    margins: {
      bottom: 20,
      left: 20,
      right: 20,
      top: 20,
    },
    pageNumberAlignment: "center",
    pageSize: "A4",
  })
  const { toast } = useToast()

  const exportManager = new ExportManager()
  const compressedAdapter = new CompressedFileAdapter()

  const handleDocumentExport = async () => {
    setIsExporting(true)

    try {
      const result = await exportManager.export(project, options)

      if (result.success && result.data && result.filename) {
        // Download the file
        const url = URL.createObjectURL(result.data)
        const a = document.createElement("a")
        a.href = url
        a.download = result.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          description: `${project.name} başarıyla ${options.format.toUpperCase()} formatında export edildi.`,
          title: "Export başarılı",
        })

        onOpenChange(false)
      } else {
        toast({
          description: result.error || "Export işlemi sırasında bir hata oluştu.",
          title: "Export hatası",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        description: "Export işlemi sırasında beklenmeyen bir hata oluştu.",
        title: "Export hatası",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleProjectExport = async () => {
    setIsExporting(true)

    try {
      const success = await compressedAdapter.saveProject(project)

      if (success) {
        toast({
          description: `${project.name} başarıyla .bookcraft dosyası olarak export edildi.`,
          title: "Proje export edildi",
        })
        onOpenChange(false)
      } else {
        throw new Error("Proje export edilemedi")
      }
    } catch (error) {
      console.error("Project export error:", error)
      toast({
        description: "Proje export edilirken bir hata oluştu.",
        title: "Export hatası",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = () => {
    if (exportType === "document") {
      handleDocumentExport()
    } else {
      handleProjectExport()
    }
  }

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "docx":
        return <File className="h-4 w-4" />
      case "epub":
        return <Book className="h-4 w-4" />
      case "json":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getFormatDescription = (format: ExportFormat) => {
    switch (format) {
      case "pdf":
        return "Yazdırma ve paylaşım için ideal"
      case "docx":
        return "Microsoft Word ile düzenlenebilir"
      case "epub":
        return "E-kitap okuyucuları için"
      case "json":
        return "Veri yedekleme ve transfer için"
      default:
        return ""
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full"
          size="icon"
          title="Projeyi Export Et"
          variant="outline"
        >
          <Download className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Seçenekleri
          </DialogTitle>
          <DialogDescription>{project.name} projesini export edin</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Export Türü</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${exportType === "document" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                  }`}
                onClick={() => setExportType("document")}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Doküman Export</div>
                    <div className="text-xs text-muted-foreground">Kitabı PDF, DOCX veya EPUB formatında export et</div>
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${exportType === "project" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                  }`}
                onClick={() => setExportType("project")}
              >
                <div className="flex items-center space-x-2">
                  <Archive className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Proje Export</div>
                    <div className="text-xs text-muted-foreground">Tüm projeyi .bookcraft dosyası olarak export et</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {exportType === "document" && (
            <>
              <Separator />

              {/* Format Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Export Formatı</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exportManager.getSupportedFormats().map((format) => (
                    <div
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${options.format === format
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                        }`}
                      key={format}
                      onClick={() => setOptions({ ...options, format })}
                    >
                      <div className="flex items-center space-x-2">
                        {getFormatIcon(format)}
                        <div>
                          <div className="font-medium">{format.toUpperCase()}</div>
                          <div className="text-xs text-muted-foreground">{getFormatDescription(format)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* PDF/DOCX Specific Options */}
              {(options.format === "pdf" || options.format === "docx") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sayfa Ayarları</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pageSize">Sayfa Boyutu</Label>
                        <Select
                          onValueChange={(value) => setOptions({ ...options, pageSize: value as typeof options.pageSize })}
                          value={options.pageSize}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A4">A4</SelectItem>
                            <SelectItem value="A5">A5</SelectItem>
                            <SelectItem value="Letter">Letter</SelectItem>
                            <SelectItem value="Legal">Legal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="pageNumberAlignment">Sayfa Numarası Hizası</Label>
                        <Select
                          onValueChange={(value) => setOptions({ ...options, pageNumberAlignment: value as typeof options.pageNumberAlignment })}
                          value={options.pageNumberAlignment}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Sol</SelectItem>
                            <SelectItem value="center">Orta</SelectItem>
                            <SelectItem value="right">Sağ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fontSize">Font Boyutu</Label>
                        <Input
                          id="fontSize"
                          max="16"
                          min="8"
                          onChange={(e) => setOptions({ ...options, fontSize: Number.parseInt(e.target.value) || 11 })}
                          type="number"
                          value={options.fontSize}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fontFamily">Font Ailesi</Label>
                        <Select
                          onValueChange={(value) => setOptions({ ...options, fontFamily: value })}
                          value={options.fontFamily}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times">Times New Roman</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Courier">Courier</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={options.chapterStartsOnRight}
                          id="chapterStartsOnRight"
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, chapterStartsOnRight: checked as boolean })
                          }
                        />
                        <Label htmlFor="chapterStartsOnRight">Bölümler sağ sayfada başlasın</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Content Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">İçerik Seçenekleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={options.includeCover}
                      id="includeCover"
                      onCheckedChange={(checked) => setOptions({ ...options, includeCover: checked as boolean })}
                    />
                    <Label htmlFor="includeCover">Kapak resmini dahil et</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={options.includeTableOfContents}
                      id="includeTableOfContents"
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeTableOfContents: checked as boolean })
                      }
                    />
                    <Label htmlFor="includeTableOfContents">İçindekiler tablosu ekle</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={options.includeImages}
                      id="includeImages"
                      onCheckedChange={(checked) => setOptions({ ...options, includeImages: checked as boolean })}
                    />
                    <Label htmlFor="includeImages">Resimleri dahil et</Label>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isExporting} variant="outline">
              İptal
            </Button>
          </DialogClose>
          <Button disabled={isExporting} onClick={handleExport}>
            {isExporting ? "Export ediliyor..." : exportType === "document" ? "Doküman Export Et" : "Proje Export Et"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
