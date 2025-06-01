import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Book, Chapter } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"

interface ChapterHeaderProps {
  chapter: Chapter
  book: Book
  projectId: string
  hasUnsavedChanges?: boolean
}

export function ChapterHeader({ chapter, book, projectId, hasUnsavedChanges = false }: ChapterHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/50">
          <Link href={`/project/${projectId}/book/${book.id}`}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Geri</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            {chapter.number && <span className="text-muted-foreground mr-2">#{chapter.number}</span>}
            {chapter.title}
            {hasUnsavedChanges && <span className="text-red-500 ml-2">*</span>}
          </h1>
          <p className="text-muted-foreground">{book.title}</p>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground">
        <div className="bg-muted/50 px-2 py-1 rounded-full">Oluşturulma: {formatDate(chapter.createdAt)}</div>
        <div className="bg-muted/50 px-2 py-1 rounded-full">Son Güncelleme: {formatDate(chapter.updatedAt)}</div>
      </div>
    </div>
  )
}
