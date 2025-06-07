import React from "react"

import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"

interface Usage {
  bookId: string
  chapterId: string
  bookTitle: string
  chapterTitle: string
  count: number
}

interface UsageListProps {
  usages: Usage[]
  projectId: string
}

export function UsageList({ projectId, usages }: UsageListProps) {
  if (usages.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">Bu öğe henüz hiçbir bölümde kullanılmamış.</div>
  }

  return (
    <div className="space-y-2">
      {usages.map((usage) => (
        <Link
          href={`/project/${projectId}/book/${usage.bookId}/chapter/${usage.chapterId}`}
          key={`${usage.bookId}-${usage.chapterId}`}
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
