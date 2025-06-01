"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Separator } from "@/components/ui/separator"
import { Download, FileText, File, Book, Archive } from "lucide-react"
import type { Project, ExportOptions, ExportFormat } from "@/lib/types"
import { ExportManager } from "@/lib/export/export-manager"
import { CompressedFileAdapter } from "@/lib/adapters/compressed-file-adapter"
import { useToast } from "@/components/ui/use-toast"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
}

export function ExportDialog({ open, onOpenChange, project }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<"document" | "project">("document")
  const [options, setOptions] = useState<ExportOptions>({
    format: "pdf",
    pageSize: "A4",
    chapterStartsOnRight: true,
    pageNumberAlignment: "center",
    includeImages: true,
    includeCover: true,
    includeTableOfContents: true,
    fontSize: 11,
    fontFamily: "Arial",
    margins: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    },
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
          title: "Export başarılı",
          description: `${project.name} başarıyla ${options.format.toUpperCase()} formatında export edildi.`,
        })

        onOpenChange(false)
      } else {
        toast({
          title: "Export hatası",
          description: result.error || "Export işlemi sırasında bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export hatası",
        description: "Export işlemi sırasında beklenmeyen bir hata oluştu.",
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
          title: "Proje export edildi",
          description: `${project.name} başarıyla .bookcraft dosyası olarak export edildi.`,
        })
        onOpenChange(false)
      } else {
        throw new Error("Proje export edilemedi")
      }
    } catch (error) {
      console.error("Project export error:", error)
      toast({
        title: "Export hatası",
        description: "Proje export edilirken bir hata oluştu.",
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  exportType === "document" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
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
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  exportType === "project" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
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
                      key={format}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        options.format === format
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
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
                          value={options.pageSize}
                          onValueChange={(value) => setOptions({ ...options, pageSize: value as any })}
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
                          value={options.pageNumberAlignment}
                          onValueChange={(value) => setOptions({ ...options, pageNumberAlignment: value as any })}
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
                          type="number"
                          min="8"
                          max="16"
                          value={options.fontSize}
                          onChange={(e) => setOptions({ ...options, fontSize: Number.parseInt(e.target.value) || 11 })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fontFamily">Font Ailesi</Label>
                        <Select
                          value={options.fontFamily}
                          onValueChange={(value) => setOptions({ ...options, fontFamily: value })}
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
                          id="chapterStartsOnRight"
                          checked={options.chapterStartsOnRight}
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
                      id="includeCover"
                      checked={options.includeCover}
                      onCheckedChange={(checked) => setOptions({ ...options, includeCover: checked as boolean })}
                    />
                    <Label htmlFor="includeCover">Kapak resmini dahil et</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeTableOfContents"
                      checked={options.includeTableOfContents}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeTableOfContents: checked as boolean })
                      }
                    />
                    <Label htmlFor="includeTableOfContents">İçindekiler tablosu ekle</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeImages"
                      checked={options.includeImages}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            İptal
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Export ediliyor..." : exportType === "document" ? "Doküman Export Et" : "Proje Export Et"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
