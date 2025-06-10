"use client"
import { useEffect, useState } from "react"
import type { Entity } from "@/lib/types"
import { BookHeader } from "@/components/book-header"
import { ChapterList } from "@/components/chapter-list"
import { EntityBadgesList } from "@/components/entity-badges-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { useBook } from "@/providers/book-provider"

export default function BookPage() {
  const { chapters, entities } = useBook()
  const [usedEntities, setUsedEntities] = useState<Entity[]>([])
  const [entityCounts, setEntityCounts] = useState<Record<string, number>>({})
  const { t } = useLanguage()

  useEffect(() => {
    const usedEntityIds = new Set<string>()
    const counts: Record<string, number> = {}

    chapters?.forEach((chapter) => {
      entities?.forEach((entity) => {
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
    const bookEntities = entities?.filter((entity) => usedEntityIds.has(entity.slug)) || []
    setUsedEntities(bookEntities)
    setEntityCounts(counts)
  }, [chapters, entities])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <BookHeader />
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">

            <ChapterList />
          </div>

          <div>
            <Card className="shadow-xs">
              <CardHeader>
                <CardTitle>{t("book_statistics")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">{t("chapter_count")}</h3>
                  <div className="text-2xl font-bold">{chapters.length}</div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">{t("used_items")}</h3>
                  <EntityBadgesList
                    counts={entityCounts}
                    entities={usedEntities}
                    limit={10}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
