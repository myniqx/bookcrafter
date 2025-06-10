"use client"

import Link from "next/link"

import type { Entity } from "@/lib/types"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { goToChapter } from "@/lib/utils/navigateTo"
import { useProject } from "@/providers/project-provider"

interface EntityDetailsPanelProps {
  entity: Entity | null
  projectId: string
}

export function EntityDetailsPanel({ entity }: EntityDetailsPanelProps) {
  const { project } = useProject()

  if (!entity) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Öğe Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detaylarını görmek için bir öğe seçin.</p>
        </CardContent>
      </Card>
    )
  }

  // Get entity type name in Turkish
  const getEntityTypeName = () => {
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

  // Get default property value
  const getDefaultProperty = () => {
    const defaultProp = entity.properties.find((p) => p.isDefault)
    return defaultProp ? defaultProp.value : entity.name
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{getEntityTypeName()} Detayları</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Temel Bilgiler</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">İsim</p>
              <p>{getDefaultProperty()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Referans</p>
              <p>@{entity.slug}</p>
            </div>
            {entity.description && (
              <div>
                <p className="text-xs text-muted-foreground">Açıklama</p>
                <p className="text-sm">{entity.description}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-2">Özellikler</h3>
          <div className="space-y-2">
            {entity.properties
              .filter((prop) => !prop.isDefault)
              .map((property) => (
                <div key={property.id}>
                  <p className="text-xs text-muted-foreground">{property.name}</p>
                  <p>{property.value || <span className="text-muted-foreground italic">Boş</span>}</p>
                </div>
              ))}
          </div>
        </div>

        {entity.notes && entity.notes.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-2">Notlar</h3>
              <div className="space-y-2">
                {entity.notes.map((note) => (
                  <div className="p-2 border rounded-md" key={note.id}>
                    <p className="font-medium text-sm">{note.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{note.content}</p>
                    {note.completed && (
                      <Badge
                        className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        variant="outline"
                      >
                        Tamamlandı
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {entity.usages && entity.usages.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-2">Kullanım</h3>
              <p className="text-sm mb-2">
                {entity.usages.reduce((sum, usage) => sum + usage.count, 0)} kez kullanılıyor
              </p>
              <div className="space-y-1">
                {entity.usages.map((usage) => (
                  <Link
                    className="text-xs block hover:underline text-blue-600 dark:text-blue-400"
                    href={goToChapter({
                      book: { slug: usage.bookSlug },
                      chapter: { slug: usage.chapterSlug }, project
                    })}
                    key={`${usage.bookSlug}-${usage.chapterSlug}`}
                  >
                    • {usage.count} kez kullanıldı
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
