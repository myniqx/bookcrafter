"use client"

import { useState } from "react"

import { Briefcase, Calendar, MapPin, Plus, Search, User } from "lucide-react"

import type { EntityType } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrentProjectStore, useEntitiesStore } from "@/lib/stores"

import { useLanguage } from "@/contexts/language-context"
import { goToEntity } from "@/lib/utils/navigateTo"
import Link from "next/link"
import { CreateEntityForm } from "./create-entity-form"


export function EntityList({ activeType, onTypeChange }: {
  activeType: EntityType
  onTypeChange: (type: EntityType) => void
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { entities } = useEntitiesStore()
  const { metadata: project } = useCurrentProjectStore()
  const { t } = useLanguage()

  const filteredEntities = entities
    .filter((entity) => entity.type === activeType)
    .filter(
      (entity) =>
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.slug.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const getEntityTypeTitle = () => t(activeType)



  return (
    <div className="space-y-4 h-full overflow-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{getEntityTypeTitle()}</h2>
        <Button
          className={
            showCreateForm ? "" : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          }
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant={showCreateForm ? "secondary" : "default"}
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
          onCancel={() => setShowCreateForm(false)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Öğe adı veya slug ile ara..."
                value={searchTerm}
              />
            </div>
          </div>

          <Tabs onValueChange={(value) => onTypeChange(value as EntityType)} value={activeType}>
            <TabsList className="grid w-full grid-cols-4">
                {Object.entries({
                  character: User,
                  event: Calendar,
                  item: Briefcase,
                  location: MapPin,
                }).map(([value, Icon]) => (
                  <TabsTrigger key={value} value={value}>
                    <Icon className="h-4 w-4 mr-2" />
                    {t(`${value as EntityType}s`)}
                  </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent className="mt-4" value={activeType}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredEntities.length === 0 ? (
                  <div className="md:col-span-2 lg:col-span-3 text-center p-8 border rounded-lg bg-muted/20">
                      <p className="text-muted-foreground">{t("no_item_found")}</p>
                  </div>
                ) : (
                  filteredEntities.map((entity) => (
                    <Link href={goToEntity({ entity, project })} key={entity.slug}>
                      <Card
                        className="cursor-pointer hover:bg-muted/20 transition-colors"
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
                    </Link>
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
