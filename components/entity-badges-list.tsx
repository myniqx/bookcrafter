"use client"

import { useState } from "react"

import { ChevronDown, ChevronUp } from "lucide-react"

import type { Entity } from "@/lib/types"

import { Button } from "@/components/ui/button"

import { EntityBadge } from "./entity-badge"

interface EntityBadgesListProps {
  entities: Entity[]
  counts?: Record<string, number>
  limit?: number
  onSelectEntity?: (entity: Entity) => void
}

export function EntityBadgesList({
  counts = {},
  entities,
  limit = 10,
  onSelectEntity,
}: EntityBadgesListProps) {
  const [showAll, setShowAll] = useState(false)

  if (entities.length === 0) {
    return <div className="text-xs text-muted-foreground">Hiç öğe kullanılmamış</div>
  }

  // Sort entities by count (if provided)
  const sortedEntities = [...entities].sort((a, b) => {
    const countA = counts[a.slug] || 0
    const countB = counts[b.slug] || 0
    return countB - countA
  })

  const displayedEntities = showAll ? sortedEntities : sortedEntities.slice(0, limit)
  const hasMore = entities.length > limit

  const handleEntityClick = (entity: Entity) => {
    if (onSelectEntity) {
      onSelectEntity(entity)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap">
        {displayedEntities.map((entity) => (
          <EntityBadge
            count={counts[entity.slug]}
            entity={entity}
            key={entity.slug}
            onClick={() => handleEntityClick(entity)}
          />
        ))}
      </div>

      {hasMore && (
        <Button className="text-xs mt-1 h-6 px-2" onClick={() => setShowAll(!showAll)} size="sm" variant="ghost">
          {showAll ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Daha Az Göster
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              {entities.length - limit} Daha Fazla Göster
            </>
          )}
        </Button>
      )}
    </div>
  )
}
