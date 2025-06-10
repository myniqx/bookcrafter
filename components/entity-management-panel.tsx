"use client"

import { useState } from "react"

import { Briefcase, Calendar, Check, MapPin, Plus, Search, User } from "lucide-react"

import type { Entity, EntityType, Note } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useLanguage } from "@/contexts/language-context"
import { useChapter } from "@/providers/chapter-provider"
import { useProject } from "@/providers/project-provider"
import { CreateEntityForm } from "./create-entity-form"


export function EntityManagementPanel() {
  const [activeTab, setActiveTab] = useState<EntityType>("character")
  const { entities } = useChapter()
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { t } = useLanguage()

  const filteredEntities = entities
    ?.filter((entity) => entity.type === activeTab)
    .filter(
      (entity) =>
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  ) || []

  return (
    <div className="space-y-4 h-full overflow-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t(`${activeTab}s`)}</h2>
        <Button
          className={
            showCreateForm ? "" : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          }
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant={showCreateForm ? "secondary" : "default"}
        >
          {showCreateForm ? (
            t("cancel")
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Yeni{" "}
                {t(activeTab)}
            </>
          )}
        </Button>
      </div>

      {showCreateForm ? (
        <CreateEntityForm
          entityType={activeTab}
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

          <Tabs onValueChange={(value) => setActiveTab(value as EntityType)} value={activeTab}>
            <TabsList className="grid w-full grid-cols-4">
                {Object.entries({
                  character: User,
                  event: Calendar,
                  item: Briefcase,
                  location: MapPin,
                }).map(([value, Icon]) => (
                  <TabsTrigger key={value} value={value}>
                    <Icon className="h-4 w-4 mr-2" />
                    {t(`${value}s`)}
                  </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent className="mt-4" value={activeTab}>
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-auto pr-1">
                {filteredEntities.length === 0 ? (
                  <div className="text-center p-8 border rounded-lg bg-muted/20">
                      <p className="text-muted-foreground">{t("no_item_found")}</p>
                  </div>
                ) : (
                  filteredEntities.map((entity) => (
                    <EntityCard
                      entity={entity}
                      key={entity.slug}
                    />
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

interface EntityCardProps {
  entity: Entity
}

function EntityCard({ entity }: EntityCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { book, chapter } = useChapter()

  // Filter notes that are not completed or completed in this chapter
  const relevantNotes =
    entity.notes?.filter(
      (note) => !note.completed || (note.completedIn?.bookId === book.slug && note.completedIn?.chapterId === chapter.slug),
    ) || []

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="py-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-base flex items-center justify-between">
          <span>{entity.name}</span>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">@{entity.slug}</span>
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent>
          {entity.description && <p className="text-sm text-muted-foreground mb-4">{entity.description}</p>}

          {relevantNotes.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Notlar:</h4>
              {relevantNotes.map((note) => (
                <NoteItem
                  bookId={book.slug}
                  chapterId={chapter.slug}
                  entity={entity}
                  key={note.id}
                  note={note}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Bu öğe için not bulunmuyor.</p>
          )}
        </CardContent>
      )}
    </Card>
  )
}

interface NoteItemProps {
  note: Note
  entity: Entity
  bookId: string
  chapterId: string
}

function NoteItem({ bookId, chapterId, entity, note }: NoteItemProps) {
  const { updateEntity } = useProject()
  const isCompletedHere =
    note.completed &&
    note.completedIn?.bookId === bookId &&
    note.completedIn?.chapterId === chapterId

  const onComplete = (completed: boolean) => {
    updateEntity(entity.slug, {
      ...entity,
      notes: entity.notes?.map((n) =>
        n.id === note.id
          ? {
            ...n,
            completed,
            completedIn: completed
              ? { bookId, chapterId }
              : undefined,
          }
          : n
      ),
    })
  }

  return (
    <div className="flex items-start gap-2 p-2 border rounded-md bg-muted/10 hover:bg-muted/20 transition-colors">
      <Checkbox
        checked={isCompletedHere}
        id={`note-${note.id}`}
        onCheckedChange={(checked) => {
          onComplete(checked === true)
        }}
      />
      <div className="flex-1">
        <label
          className={`text-sm font-medium cursor-pointer ${isCompletedHere ? "line-through text-muted-foreground" : ""}`}
          htmlFor={`note-${note.id}`}
        >
          {note.title}
        </label>
        <p
          className={`text-xs mt-1 ${isCompletedHere ? "line-through text-muted-foreground" : "text-muted-foreground"}`}
        >
          {note.content}
        </p>
      </div>
      {isCompletedHere && <Check className="h-4 w-4 text-green-500" />}
    </div>
  )
}
