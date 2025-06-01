"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen } from "lucide-react"
import { CreateBookDialog } from "./create-book-dialog"
import { EditableText } from "./editable-text"
import type { Book, Project } from "@/lib/types"
import { useLanguage } from "@/contexts/language-context"
import { useProject } from "@/providers/project-provider"


export function BooksList() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { t } = useLanguage()
  const { project, updateBook, updateProject } = useProject()

  if(!project) return null

  const onCreateBook = (book: Book) => {
    console.log('project', project)
    const updatedProject = {
      ...project,
      books: [...project.books, book],
    }
    updateProject(updatedProject)
    setIsCreateDialogOpen(false)
  }

  const books = project?.books || []

  if (books.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">{t("no_books_yet")}</p>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("create_first_book")}
        </Button>
        <CreateBookDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateBook={onCreateBook}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("books")}</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("new_book")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Link href={`/project/${project.id}/book/${book.id}`} key={book.id}>
            <Card className="h-full cursor-pointer hover:bg-muted/20 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <EditableText
                    value={book.title || t("untitled_book")}
                    onChange={(value) => updateBook(book.id, { title: value })}
                    className="flex-1"
                  />
                </CardTitle>
                <CardDescription>
                  <EditableText
                    value={book.description || t("no_description")}
                    onChange={(value) => updateBook(book.id, { description: value })}
                    placeholder={t("add_description")}
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("chapters")}:</span>
                    <Badge variant="secondary">{book.chapters?.length || 0}</Badge>
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

      <CreateBookDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateBook={onCreateBook}
      />
    </div>
  )
}
