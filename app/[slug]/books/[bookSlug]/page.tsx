"use client"

import { BookHeader } from "@/components/book-header"
import { ChapterList } from "@/components/chapter-list"
import { CreateChapterDialog } from "@/components/create-chapter-dialog"
import { EntityBadgesList } from "@/components/entity-badges-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { formatTranslation, useLanguage } from "@/contexts/language-context"
import { useAutosave } from "@/hooks/use-autosave"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import type { Chapter, Entity } from "@/lib/types"
import { goToBook, goToProject } from "@/lib/utils/navigateTo"
import { useProject } from "@/providers/project-provider"
import { useRouter } from "next/navigation"
import React from "react"
import { Usable, useEffect, useState } from "react"

export default function BookPage({
  params,
}: {
  params: Usable<{ bookSlug: string }>
}) {
  const { bookSlug } = React.use(params)
  const { project, loading, error, saveProject, getBook } = useProject()
  const router = useRouter()
  const [isCreateChapterOpen, setIsCreateChapterOpen] = useState(false)
  const { hasUnsavedChanges, setUnsavedChanges } = useUnsavedChanges()
  const { toast } = useToast()
  const [usedEntities, setUsedEntities] = useState<Entity[]>([])
  const [entityCounts, setEntityCounts] = useState<Record<string, number>>({})
  const { t } = useLanguage()

  // Set up autosave
  const { handleManualSave } = useAutosave()

  const book = getBook(bookSlug)

  useEffect(() => {
    if (error) {
      router.push("/")
    }
  }, [error, router])

  useEffect(() => {
    if (book) {
      // Collect all entities used in this book's chapters
      const usedEntityIds = new Set<string>()
      const counts: Record<string, number> = {}

      book.chapters.forEach((chapter) => {
        project.entities.forEach((entity) => {
          // Check if entity is referenced in chapter content
          if (chapter.content) {
            const regex = new RegExp(`@${entity.slug}(?:\\.(\\w+))?`, "g")
            const matches = chapter.content.match(regex) || []

            if (matches.length > 0) {
              usedEntityIds.add(entity.slug)
              counts[entity.slug] = (counts[entity.slug] || 0) + matches.length
            }
          }
        })
      })

      // Filter entities that are used in this book
      const bookEntities = project.entities.filter((entity) => usedEntityIds.has(entity.slug))
      setUsedEntities(bookEntities)
      setEntityCounts(counts)
    }
  }, [project, book?.slug])

  if (loading) {
    return null // Layout will show loading state
  }

  if (!book) {
    goToProject(project.slug, router)
    return null
  }

  const handleCreateChapter = (chapter: Chapter) => {
    const updatedBooks = project.books.map((b) => {
      if (b.slug === book.slug) {
        return {
          ...b,
          chapters: [...b.chapters, chapter],
        }
      }
      return b
    })

    const updatedProject = {
      ...project,
      books: updatedBooks,
    }

    saveProject(updatedProject)
    setIsCreateChapterOpen(false)

    toast({
      title: t("chapter_created"),
      description: formatTranslation(t("chapter_created_description"), { title: chapter.title }),
      variant: "success",
    })

    setUnsavedChanges(false)
  }

  const handleSave = () => {
    if (handleManualSave()) {
      toast({
        title: t("project_saved"),
        description: t("all_changes_saved"),
        variant: "success",
      })
    }
  }

  // Handle book title and description changes
  const handleBookTitleChange = (title: string) => {
    if (title !== book.title) {
      const updatedBooks = project.books.map((b) => {
        if (b.slug === book.slug) {
          return {
            ...b,
            title,
            updatedAt: new Date().toISOString(),
          }
        }
        return b
      })

      // Update the project in memory
      project.books = updatedBooks
      project.updatedAt = new Date().toISOString()

      setUnsavedChanges(true)
    }
  }

  const handleBookDescriptionChange = (description: string) => {
    if (description !== book.description) {
      const updatedBooks = project.books.map((b) => {
        if (b.slug === book.slug) {
          return {
            ...b,
            description,
            updatedAt: new Date().toISOString(),
          }
        }
        return b
      })

      // Update the project in memory
      project.books = updatedBooks
      project.updatedAt = new Date().toISOString()

      setUnsavedChanges(true)
    }
  }

  // Handle chapter title changes
  const handleChapterTitleChange = (chapterId: string, title: string) => {
    const updatedBooks = project.books.map((b) => {
      if (b.slug === book.slug) {
        const updatedChapters = b.chapters.map((c) => {
          if (c.slug === chapterId) {
            return {
              ...c,
              title,
              updatedAt: new Date().toISOString(),
            }
          }
          return c
        })

        return {
          ...b,
          chapters: updatedChapters,
          updatedAt: new Date().toISOString(),
        }
      }
      return b
    })

    // Update the project in memory
    project.books = updatedBooks
    project.updatedAt = new Date().toISOString()

    setUnsavedChanges(true)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <BookHeader
          book={book}
          projectId={project.slug}
          hasUnsavedChanges={hasUnsavedChanges}
          onTitleChange={handleBookTitleChange}
          onDescriptionChange={handleBookDescriptionChange}
        />
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{t("chapters")}</h2>
              <Button
                onClick={() => setIsCreateChapterOpen(true)}
                className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {t("add_new_chapter")}
              </Button>
            </div>

            <ChapterList
              chapters={book.chapters}
              projectId={params.id}
              bookId={book.id}
              entities={project.entities}
              onChapterTitleChange={handleChapterTitleChange}
            />
          </div>

          <div>
            <Card className="shadow-xs">
              <CardHeader>
                <CardTitle>{t("book_statistics")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">{t("chapter_count")}</h3>
                  <div className="text-2xl font-bold">{book.chapters.length}</div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">{t("used_items")}</h3>
                  <EntityBadgesList entities={usedEntities} projectId={params.id} counts={entityCounts} limit={10} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CreateChapterDialog
        open={isCreateChapterOpen}
        onOpenChange={setIsCreateChapterOpen}
        onCreateChapter={handleCreateChapter}
        existingChapters={book.chapters}
      />
    </div>
  )
}
