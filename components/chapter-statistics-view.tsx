"use client"

import { BarChart, BookOpen, Check, FileText, Hash } from "lucide-react"
import Link from "next/link"

import type { ChapterStatistics, Entity } from "@/lib/types"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentChapterStore, useCurrentProjectStore, useEntitiesStore } from "@/lib/stores"
import { goToEntity } from "@/lib/utils/navigateTo"

interface ChapterStatisticsViewProps {
  statistics?: ChapterStatistics | null
}

export function ChapterStatisticsView({
  statistics,
}: ChapterStatisticsViewProps) {
  const { chapter } = useCurrentChapterStore()
  const { metadata: project } = useCurrentProjectStore()
  const { entities } = useEntitiesStore()
  
  const book = null // TODO: Get book from current book store if needed

  if (!statistics) return null

  return (
    <div className="space-y-6 h-full overflow-auto pr-1">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-100 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paragraf Sayısı</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.paragraphCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-indigo-100 dark:border-indigo-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kelime Sayısı</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.wordCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border-purple-100 dark:border-purple-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Karakter Sayısı</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.characterCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xs hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Öğe Kullanım İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statistics.entityUsage.length === 0 ? (
            <p className="text-muted-foreground">Bu bölümde hiç öğe kullanılmamış.</p>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-500px)] overflow-auto pr-1">
              {statistics.entityUsage.map((usage) => {
                const entity = entities.find((e) => e.slug === usage.entitySlug)
                if (!entity) return null

                // Get completed notes for this entity
                const completedNotes =
                  entity.notes?.filter(
                    (note) =>
                      note.completed &&
                      note.completedIn?.bookId === book.slug &&
                      note.completedIn?.chapterId === chapter.slug,
                  ) || []

                return (
                  <div className="border rounded-md p-4 hover:bg-muted/10 transition-colors" key={usage.entitySlug}>
                    <div className="flex justify-between items-center mb-2">
                      <Link
                        className="font-medium hover:underline text-blue-600 dark:text-blue-400"
                        href={goToEntity({ entity: { slug: usage.entitySlug }, project })}
                      >
                        {usage.entityName}
                      </Link>
                      <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                        {usage.count} kez kullanıldı
                      </span>
                    </div>

                    {completedNotes.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium mb-1">Bu bölümde tamamlanan notlar:</h4>
                        <ul className="text-sm space-y-1">
                          {completedNotes.map((note) => (
                            <li className="text-muted-foreground flex items-center gap-1" key={note.id}>
                              <Check className="h-3 w-3 text-green-500" />
                              {note.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
