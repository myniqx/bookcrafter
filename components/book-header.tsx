"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import type { Book } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { goToProject } from "@/lib/utils/navigateTo"
import { useCurrentBookStore, useCurrentProjectStore } from "@/lib/stores"
import { useBookActions } from "@/hooks/use-book-actions"

import { EditableText } from "./editable-text"

export function BookHeader() {
  const { book } = useCurrentBookStore()
  const { metadata: project } = useCurrentProjectStore()
  const { isUpdating, updateBook } = useBookActions(project?.slug || '')

  const handleUpdateBook = async (updates: Partial<Book>) => {
    if (!book) return

    try {
      await updateBook(book.slug, updates)
    } catch (error) {
      console.error('Failed to update book:', error)
    }

    const projectLink = goToProject({ project })

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Link href={projectLink}>
            <Button className="rounded-full" size="icon" variant="ghost">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Geri</span>
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
              <EditableText
                className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
                isTitle
                onChange={(title) => handleUpdateBook({ title })}
                value={book.title}
              />
              {isUpdating && <span className="text-blue-500">↻</span>}
            </h1>
            <div className="text-muted-foreground mt-1">
              <EditableText
                multiline
                onChange={(description) => handleUpdateBook({ description })}
                placeholder="Kitap açıklaması ekleyin..."
                value={book.description || ""}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

}
