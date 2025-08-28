import { Save } from "lucide-react"
import { useParams } from "next/navigation"

import { goToProject } from "@/lib/utils/navigateTo"
import { useCurrentChapterStore } from "@/lib/stores"
import { useDebouncedChapterSave } from "@/hooks/queries/use-chapter-query"

import { BreadcrumbNavigation } from "./breadcrumb-navigation"
import { ExportDialog } from "./export-dialog"
import { Button } from "./ui/button"

export const HeaderNavigation = () => {
  const { slug: projectSlug, bookSlug, chapterSlug } = useParams()
  const { chapter, content, isSaving } = useCurrentChapterStore()
  
  // Manual save functionality for current chapter
  const { save: saveChapter } = useDebouncedChapterSave(
    projectSlug as string,
    bookSlug as string, 
    chapterSlug as string,
    0 // Immediate save
  )
  
  const handleManualSave = () => {
    if (chapter && content) {
      saveChapter(content)
    }
  }


  return (
    <nav className="flex items-center space-x-4 h-15 w-full p-2 overflow-hidden border-b">
      <div className="flex flex-row justify-between w-full">
        <div className="flex items-center space-x-4 flex-row">
          <BreadcrumbNavigation />
        </div>
        <div className="flex flex-row items-center space-x-4">
          <Button
            className="rounded-full"
            onClick={handleManualSave}
            size="icon"
            title={isSaving ? "Kaydediliyor..." : "Manuel Kaydet"}
            variant={isSaving ? "secondary" : "outline"}
            disabled={isSaving || !chapter}
          >
            <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
          </Button>
          <ExportDialog />
        </div>
      </div>
    </nav>
  )
}
