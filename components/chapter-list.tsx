"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText } from "lucide-react"
import { CreateChapterDialog } from "./create-chapter-dialog"
import { EditableText } from "./editable-text"
import type { Book, Chapter, Project } from "@/lib/types"
import { useLanguage } from "@/contexts/language-context"

interface ChapterListProps {
  project: Project
  book: Book
  onUpdateProject: (project: Project) => void
}

export function ChapterList({ project, book, onUpdateProject }: ChapterListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { t } = useLanguage()

  const handleUpdateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    if (!project || !project.books || !book) return

    const updatedBooks = project.books.map((b) => {
      if (b.id === book.id) {
        const updatedChapters = (b.chapters || []).map((chapter) =>
          chapter.id === chapterId ? { ...chapter, ...updates } : chapter,
        )
        return { ...b, chapters: updatedChapters }
      }
      return b
    })

    onUpdateProject({
      ...project,
      books: updatedBooks,
    })
  }

  const chapters = book?.chapters || []

  if (chapters.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">{t("no_chapters_yet")}</p>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("create_first_chapter")}
        </Button>
        <CreateChapterDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          project={project}
          book={book}
          onUpdateProject={onUpdateProject}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("chapters")}</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("new_chapter")}
        </Button>
      </div>

      <div className="grid gap-4">
        {chapters.map((chapter, index) => (
          <Link href={`/project/${project.id}/book/${book.id}/chapter/${chapter.id}`} key={chapter.id}>
            <Card className="cursor-pointer hover:bg-muted/20 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  <EditableText
                    value={chapter.title || t("untitled_chapter")}
                    onSave={(value) => handleUpdateChapter(chapter.id, { title: value })}
                    className="flex-1"
                  />
                </CardTitle>
                <CardDescription>
                  <EditableText
                    value={chapter.description || t("no_description")}
                    onSave={(value) => handleUpdateChapter(chapter.id, { description: value })}
                    placeholder={t("add_description")}
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Badge variant={chapter.status === "completed" ? "default" : "secondary"}>
                      {t(chapter.status || "draft")}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {chapter.content ? `${chapter.content.length} ${t("characters")}` : t("empty")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <CreateChapterDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        project={project}
        book={book}
        onUpdateProject={onUpdateProject}
      />
    </div>
  )
}
