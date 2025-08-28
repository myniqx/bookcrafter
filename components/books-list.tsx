"use client"
import { BookOpen, Plus } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { useCurrentProjectStore } from "@/lib/stores"
import { useProjectQuery } from "@/hooks/queries/use-project-query"
import { useBookActions } from "@/hooks/use-book-actions"

import { CreateBookDialog } from "./create-book-dialog"
import { EditableText } from "./editable-text"

export function BooksList() {
  const { t } = useLanguage()
  const { metadata: project } = useCurrentProjectStore()
  const { data: fullProject, isLoading } = useProjectQuery(project?.slug || '')
  const { updateBook, isUpdating } = useBookActions(project?.slug || '')
  
  const books = fullProject?.books || []
  const getChaptersForBook = (bookSlug: string) => {
    return fullProject?.chapters.filter(chapter => chapter.bookSlug === bookSlug) || []
  }
  
  if (!project) {
    return <div className="flex items-center justify-center h-32">Loading...</div>
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-32">Loading books...</div>
  }

  const handleUpdateBook = async (bookSlug: string, updates: any) => {
    try {
      await updateBook(bookSlug, updates)
    } catch (error) {
      console.error('Failed to update book:', error)
    }
  }

  if (books.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">{t("no_books_yet")}</p>
        <CreateBookDialog />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("books")}</h2>

        <CreateBookDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Link href={goToBook({ book, project })} key={book.slug}>
            <Card className="h-full cursor-pointer hover:bg-muted/20 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <EditableText
                    className="flex-1"
                    onChange={(value) => handleUpdateBook(book.slug, { title: value })}
                    value={book.title || t("untitled_book")}
                  />
                </div>
                <div>
                  <EditableText
                    onChange={(value) => handleUpdateBook(book.slug, { description: value })}
                    placeholder={t("add_description")}
                    value={book.description || t("no_description")}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("chapters")}:</span>
                    <Badge variant="secondary">{getChaptersForBook(book.slug)?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("status")}:</span>
                    <Badge variant={book.status === "completed" ? "default" : "secondary"}>
                      {t(book.status || "draft")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

    </div>
  )
}
