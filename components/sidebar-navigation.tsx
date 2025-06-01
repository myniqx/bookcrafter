"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChevronDown, ChevronRight, Home, BookIcon, Save } from "lucide-react"
import type { Project, Book } from "@/lib/types"
import { useLanguage } from "@/contexts/language-context"
import { useProject } from "@/providers/project-provider"

// Hatayı düzeltmek için, project prop'unun undefined olabileceği durumları kontrol edelim
// ve null coalescing operatörü kullanarak güvenli erişim sağlayalım

// İlk olarak, SidebarNavigationProps arayüzünü güncelleyelim
interface SidebarNavigationProps {
  project?: Project // project prop'u opsiyonel olarak işaretleyelim
  unsavedPaths?: string[]
  onSave?: () => void
}

// Şimdi, bileşenin başlangıcında bir kontrol ekleyelim
export function SidebarNavigation({  unsavedPaths = [], onSave }: SidebarNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [openBooks, setOpenBooks] = useState(true)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const { project } = useProject()
  const { t } = useLanguage()

  // Eğer project undefined ise, yükleniyor durumunu gösterelim
  if (!project) {
    return (
      <div className="h-screen flex flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4 border-b">
          <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="p-4 space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
          <div className="h-8 bg-muted animate-pulse rounded"></div>
          <div className="h-px bg-border"></div>
          <div className="h-8 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    )
  }

  const hasUnsavedChanges = unsavedPaths.includes(pathname)

  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path)
      setShowUnsavedDialog(true)
    } else {
      router.push(path)
    }
  }

  const confirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation)
    }
    setShowUnsavedDialog(false)
    setPendingNavigation(null)
  }

  const cancelNavigation = () => {
    setShowUnsavedDialog(false)
    setPendingNavigation(null)
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  return (
    <>
      <div className="h-screen flex flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">{project.name}</h2>
          {hasUnsavedChanges && (
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              {t("save")}
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="space-y-1">
              <Button
                variant={pathname === "/" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleNavigation("/")}
              >
                <Home className="h-4 w-4 mr-2" />
                {t("home")}
              </Button>

              <Button
                variant={pathname === `/project/${project.id}` ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleNavigation(`/project/${project.id}`)}
              >
                <BookIcon className="h-4 w-4 mr-2" />
                {t("books")}
              </Button>
            </div>

            <Separator className="my-4" />

            <Collapsible open={openBooks} onOpenChange={setOpenBooks}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span className="flex items-center">
                    <BookIcon className="h-4 w-4 mr-2" />
                    {t("books")}
                  </span>
                  {openBooks ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-4 space-y-1 mt-1">
                  {project.books.map((book: Book) => (
                    <Button
                      key={book.id}
                      variant={pathname === `/project/${project.id}/book/${book.id}` ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => handleNavigation(`/project/${project.id}/book/${book.id}`)}
                    >
                      {book.title}
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </div>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("unsaved_changes")}</AlertDialogTitle>
            <AlertDialogDescription>{t("unsaved_changes_message")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelNavigation}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation}>{t("confirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
