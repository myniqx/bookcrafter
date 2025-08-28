import React from "react"

import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { EntityUsage } from "@/lib/types"
import { useCurrentProjectStore } from "@/lib/stores"
import { goToChapter } from "@/lib/utils/navigateTo"

interface Usage extends EntityUsage {
  bookTitle: string
  chapterTitle: string
}

interface UsageListProps {
  usages: Usage[]
}

export function UsageList({ usages }: UsageListProps) {
  const { metadata: project } = useCurrentProjectStore()
  
  if (!project || usages.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">Bu öğe henüz hiçbir bölümde kullanılmamış.</div>
  }

  return (
    <div className="space-y-2">
      {usages.map((usage) => (
        <Link
          href={goToChapter({ book: { slug: usage.bookSlug }, chapter: { slug: usage.chapterSlug }, project })}
          key={`${usage.bookSlug}-${usage.chapterSlug}`}
        >
          <Card className="cursor-pointer hover:bg-muted/20 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{usage.bookTitle}</div>
                  <div className="text-sm text-muted-foreground">{usage.chapterTitle}</div>
                </div>
                <div className="text-sm font-medium">{usage.count} kez</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
