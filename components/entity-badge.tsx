"use client"

import type { Entity } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Briefcase, Calendar } from "lucide-react"

interface EntityBadgeProps {
  entity: Entity
  projectId: string
  count?: number
  onClick?: () => void
}

export function EntityBadge({ entity, projectId, count, onClick }: EntityBadgeProps) {
  const getEntityIcon = () => {
    switch (entity.type) {
      case "character":
        return <User className="h-3 w-3 mr-1" />
      case "location":
        return <MapPin className="h-3 w-3 mr-1" />
      case "item":
        return <Briefcase className="h-3 w-3 mr-1" />
      case "event":
        return <Calendar className="h-3 w-3 mr-1" />
    }
  }

  const getEntityColor = () => {
    switch (entity.type) {
      case "character":
        return "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:hover:bg-blue-900 dark:text-blue-200"
      case "location":
        return "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/50 dark:hover:bg-green-900 dark:text-green-200"
      case "item":
        return "bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:hover:bg-amber-900 dark:text-amber-200"
      case "event":
        return "bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:hover:bg-purple-900 dark:text-purple-200"
    }
  }

  return (
    <Badge
      variant="outline"
      className={`flex items-center text-xs py-0.5 px-2 mr-1 mb-1 cursor-pointer ${getEntityColor()}`}
      onClick={onClick}
    >
      {getEntityIcon()}
      {entity.name}
      {count !== undefined && <span className="ml-1 bg-white dark:bg-gray-800 text-xs px-1 rounded-full">{count}</span>}
    </Badge>
  )
}
