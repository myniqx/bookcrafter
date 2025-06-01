import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Entity } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { ChevronLeft, User, MapPin, Briefcase, Calendar } from "lucide-react"

interface EntityHeaderProps {
  entity: Entity
  projectId: string
}

export function EntityHeader({ entity, projectId }: EntityHeaderProps) {
  const getEntityIcon = () => {
    switch (entity.type) {
      case "character":
        return <User className="h-5 w-5" />
      case "location":
        return <MapPin className="h-5 w-5" />
      case "item":
        return <Briefcase className="h-5 w-5" />
      case "event":
        return <Calendar className="h-5 w-5" />
    }
  }

  const getEntityTypeText = () => {
    switch (entity.type) {
      case "character":
        return "Karakter"
      case "location":
        return "Mekan"
      case "item":
        return "Eşya"
      case "event":
        return "Olay"
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/50">
          <Link href={`/project/${projectId}`}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Geri</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {getEntityIcon()}
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            {entity.name}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="text-sm font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full">
          @{entity.slug}
        </span>
        <span className="text-sm bg-muted/50 px-2 py-1 rounded-full">{getEntityTypeText()}</span>
      </div>

      {entity.description && <p className="text-muted-foreground">{entity.description}</p>}

      <div className="flex gap-4 text-sm text-muted-foreground">
        <div className="bg-muted/50 px-2 py-1 rounded-full">Oluşturulma: {formatDate(entity.createdAt)}</div>
        <div className="bg-muted/50 px-2 py-1 rounded-full">Son Güncelleme: {formatDate(entity.updatedAt)}</div>
      </div>
    </div>
  )
}
