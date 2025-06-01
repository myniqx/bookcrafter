"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import type { Entity, EntityType } from "@/lib/types"
import { Search, User, MapPin, Briefcase, Calendar, Plus } from "lucide-react"
import { CreateEntityForm } from "./create-entity-form"
import { Input } from "@/components/ui/input"
import { useProject } from "@/providers/project-provider"

interface EntityListProps {
  entities: Entity[]
  projectId: string
  activeType: EntityType
  onTypeChange: (type: EntityType) => void
  onCreateCharacter: () => void
  onCreateLocation: () => void
  onCreateItem: () => void
  onCreateEvent: () => void
  onSelectEntity: (entity: Entity) => void
}

export function EntityList({
  activeType,
  onTypeChange,
  onCreateCharacter,
  onCreateLocation,
  onCreateItem,
  onCreateEvent,
  onSelectEntity,
}: EntityListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { project, addEntity, updateEntity } = useProject()
  
  if (!project) {
    return null
  }

  const entities = project.entities || []

  const filteredEntities = entities
    .filter((entity) => entity.type === activeType)
    .filter(
      (entity) =>
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.slug.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const getEntityTypeTitle = () => {
    switch (activeType) {
      case "character":
        return "Karakterler"
      case "location":
        return "Mekanlar"
      case "item":
        return "Eşyalar"
      case "event":
        return "Olaylar"
    }
  }

  const handleCreateClick = () => {
    switch (activeType) {
      case "character":
        onCreateCharacter()
        break
      case "location":
        onCreateLocation()
        break
      case "item":
        onCreateItem()
        break
      case "event":
        onCreateEvent()
        break
    }
  }

  const handleCreateEntity = () => {
    setShowCreateForm(false)
  }

  return (
    <div className="space-y-4 h-full overflow-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{getEntityTypeTitle()}</h2>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant={showCreateForm ? "secondary" : "default"}
          className={
            showCreateForm ? "" : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          }
        >
          {showCreateForm ? (
            "İptal"
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Yeni{" "}
              {activeType === "character"
                ? "Karakter"
                : activeType === "location"
                  ? "Mekan"
                  : activeType === "item"
                    ? "Eşya"
                    : "Olay"}
            </>
          )}
        </Button>
      </div>

      {showCreateForm ? (
        <CreateEntityForm
          entityType={activeType}
          onCreateEntity={handleCreateEntity}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Öğe adı veya slug ile ara..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeType} onValueChange={(value) => onTypeChange(value as EntityType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="character">
                <User className="h-4 w-4 mr-2" />
                Karakterler
              </TabsTrigger>
              <TabsTrigger value="location">
                <MapPin className="h-4 w-4 mr-2" />
                Mekanlar
              </TabsTrigger>
              <TabsTrigger value="item">
                <Briefcase className="h-4 w-4 mr-2" />
                Eşyalar
              </TabsTrigger>
              <TabsTrigger value="event">
                <Calendar className="h-4 w-4 mr-2" />
                Olaylar
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeType} className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredEntities.length === 0 ? (
                  <div className="md:col-span-2 lg:col-span-3 text-center p-8 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">Hiç öğe bulunamadı.</p>
                  </div>
                ) : (
                  filteredEntities.map((entity) => (
                    <Card
                      key={entity.id}
                      className="cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => onSelectEntity(entity)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {entity.type === "character" && <User className="h-4 w-4" />}
                          {entity.type === "location" && <MapPin className="h-4 w-4" />}
                          {entity.type === "item" && <Briefcase className="h-4 w-4" />}
                          {entity.type === "event" && <Calendar className="h-4 w-4" />}
                          {entity.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Slug:</span>
                            <span className="text-sm font-medium">@{entity.slug}</span>
                          </div>
                          {entity.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{entity.description}</p>
                          )}
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Özellikler:</span>
                            <span className="text-sm font-medium">{entity.properties.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Kullanım:</span>
                            <span className="text-sm font-medium">
                              {entity.usages?.reduce((sum, usage) => sum + usage.count, 0) || 0} kez
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
