"use client"

import { useState } from "react"

import { BookIcon, ChevronDown, ChevronRight, Home, Save, Workflow } from "lucide-react"
import { useParams, usePathname, useRouter } from "next/navigation"

import type { Book } from "@/lib/types"

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
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language-context"
import { useProject } from "@/providers/project-provider"
import { goToBook, goToProject } from "@/lib/utils/navigateTo"
export function SidebarNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [openBooks, setOpenBooks] = useState(true)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const { hasUnsavedChanges, project, saveProject } = useProject()
  const { bookSlug, chapterSlug, slug } = useParams()
  const { t } = useLanguage()


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
    saveProject()
  }

  return (
    <>
      <div className="h-screen w-96 flex flex-col border-r bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
        <div className="p-3 border-b flex justify-between items-center h-15">
          <h2 className="text-lg font-semibold ">{project.name}</h2>
          {hasUnsavedChanges && (
            <Button onClick={handleSave} size="sm" variant="outline">
              <Save className="h-4 w-4 mr-1" />
              {t("save")}
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="space-y-1">
              <Button
                className="w-full justify-start"
                onClick={() => handleNavigation("/")}
                variant={!slug ? "secondary" : "ghost"}
              >
                <Home className="h-4 w-4 mr-2" />
                {t("home")}
              </Button>

              <Button
                className="w-full justify-start"
                onClick={() => handleNavigation(goToProject({ project }))}
                variant={slug === project.slug ? "secondary" : "ghost"}
              >
                <Workflow className="h-4 w-4 mr-2" />
                {project.name}
              </Button>
            </div>

            <Separator className="my-4" />

            <Collapsible onOpenChange={setOpenBooks} open={openBooks}>
              <CollapsibleTrigger asChild>
                <Button className="w-full justify-between" variant="ghost">
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
                      className="w-full justify-start text-sm"
                      key={book.slug}
                      onClick={() => handleNavigation(goToBook({ book, project }))}
                      variant={bookSlug === book.slug ? "secondary" : "ghost"}
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

      <AlertDialog onOpenChange={setShowUnsavedDialog} open={showUnsavedDialog}>
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
