"use client"
import React from "react"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { goToChapter } from "@/lib/utils/navigateTo"
import { useChapter } from "@/providers/chapter-provider"


export function ChapterHeader() {
  const { book, chapter, hasUnsavedChanges, project } = useChapter();
  const backLink = goToChapter({ book, project })

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button asChild className="rounded-full hover:bg-muted/50" size="icon" variant="ghost">
          <Link href={backLink}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Geri</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
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
