"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Book } from "@/lib/types"
import { EditableText } from "./editable-text"

interface BookHeaderProps {
  book: Book
  projectId: string
  hasUnsavedChanges: boolean
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
}

export function BookHeader({
  book,
  projectId,
  hasUnsavedChanges,
  onTitleChange,
  onDescriptionChange,
}: BookHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Link href={`/project/${projectId}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Geri</span>
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
            <EditableText
              value={book.title}
              onChange={onTitleChange || (() => {})}
              isTitle
              className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
            />
            {hasUnsavedChanges && <span className="text-red-500">*</span>}
          </h1>
          <div className="text-muted-foreground mt-1">
            <EditableText
              value={book.description || ""}
              onChange={onDescriptionChange || (() => {})}
              placeholder="Kitap açıklaması ekleyin..."
              multiline
            />
          </div>
        </div>
      </div>
    </div>
  )
}
