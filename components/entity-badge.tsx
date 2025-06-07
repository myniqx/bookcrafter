"use client"

import { Briefcase, Calendar, LucideProps, MapPin, User } from "lucide-react"

import type { Entity } from "@/lib/types"

import { Badge } from "@/components/ui/badge"

interface EntityBadgeProps {
  entity: Entity
  count?: number
  onClick?: () => void
}

export function EntityBadge({ count, entity, onClick }: EntityBadgeProps) {
  const entityStyles:
    Record<Entity["type"], { Icon: React.ComponentType<LucideProps>, color: string }>
    = {
    character: {
      color: "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:hover:bg-blue-900 dark:text-blue-200",
      Icon: User,
    },
    event: {
      color: "bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:hover:bg-purple-900 dark:text-purple-200",
      Icon: Calendar,
    },
    item: {
      color: "bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:hover:bg-amber-900 dark:text-amber-200",
      Icon: Briefcase,
    },
    location: {
      color: "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/50 dark:hover:bg-green-900 dark:text-green-200",
      Icon: MapPin,
    },
  }

  const { color, Icon } = entityStyles[entity.type]

  return (
    <Badge
      className={`flex items-center text-xs py-0.5 px-2 mr-1 mb-1 cursor-pointer ${color}`}
      onClick={onClick}
      variant="outline"
    >
      <Icon className="h-3 w-3 mr-1" />
      {entity.name}
      {count !== undefined && (
        <span className="ml-1 bg-white dark:bg-gray-800 text-xs px-1 rounded-full">
          {count}
        </span>
      )}
    </Badge>
  )
}
