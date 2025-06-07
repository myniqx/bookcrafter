"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import type { Book } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { goToProject } from "@/lib/utils/navigateTo"
import { useBook } from "@/providers/book-provider"

import { EditableText } from "./editable-text"


export function BookHeader() {
  const { book, hasUnsavedChanges, project, updateBook } = useBook();
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
              onChange={(title) => updateBook({ title })}
              value={book.title}
            />
            {hasUnsavedChanges && <span className="text-red-500">*</span>}
          </h1>
          <div className="text-muted-foreground mt-1">
            <EditableText
              multiline
              onChange={(description) => updateBook({ description })}
              placeholder="Kitap açıklaması ekleyin..."
              value={book.description || ""}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
