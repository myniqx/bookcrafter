"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"

import { AddNoteDialog } from "@/components/add-note-dialog"
import { AddPropertyDialog } from "@/components/add-property-dialog"
import { EditableText } from "@/components/editable-text"
import { NotesList } from "@/components/notes-list"
import { PropertyList } from "@/components/property-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsageList } from "@/components/usage-list"
import { useLanguage } from "@/contexts/language-context"
import { useCurrentProjectStore, useCurrentEntityStore } from "@/lib/stores"
import { useProjectQuery } from "@/hooks/queries/use-project-query"
import { useEntitiesActions } from "@/hooks/use-entities-actions"
import { useDebouncedEntitySave } from "@/hooks/queries/use-entity-query"

export default function EntityPage() {
  const searchParams = useSearchParams()
  const { entitySlug, slug: projectSlug } = useParams()
  
  const { metadata: project } = useCurrentProjectStore()
  const { entity } = useCurrentEntityStore()
  const { data: fullProject, isLoading } = useProjectQuery(project?.slug || '')
  const { updateEntity, isUpdating } = useEntitiesActions(project?.slug || '')
  const { save: saveEntity, isSaving } = useDebouncedEntitySave(
    project?.slug || '', 
    entitySlug as string,
    1000 // 1 second debounce
  )
  
  const [activeTab, setActiveTab] = useState("properties")
  const { t } = useLanguage()

  const getBook = (bookSlug: string) => fullProject?.books.find(b => b.slug === bookSlug) || null
  const getChapter = (bookSlug: string, chapterSlug: string) => 
    fullProject?.chapters.find(c => c.bookSlug === bookSlug && c.slug === chapterSlug) || null

  // Set active tab based on URL params
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "notes" || tab === "usages") {
      setActiveTab(tab)
    } else {
      setActiveTab("properties")
    }
  }, [searchParams])

  // Handle entity name and description changes with autosave
  const handleEntityNameChange = (name: string) => {
    saveEntity({ name })
  }

  const handleEntityDescriptionChange = (description: string) => {
    saveEntity({ description })
  }

  // Loading states
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading entity...</div>
  }

  if (!entity) {
    return <div className="flex items-center justify-center h-64">Entity not found</div>
  }

  // Get book and chapter titles for usages
  const usagesWithTitles = (entity.usages || []).map((usage) => {
    const book = getBook(usage.bookSlug)
    const chapter = getChapter(usage.bookSlug, usage.chapterSlug)

    return {
      ...usage,
      bookTitle: book?.title || "Bilinmeyen Kitap",
      chapterTitle: chapter?.title || "Bilinmeyen Bölüm",
    }
  })

  // Get entity type name in Turkish
  const getEntityTypeName = () => t(entity.type)


  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      <div className="p-4 border-b">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
            <EditableText
              className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
              isTitle
              onChange={handleEntityNameChange}
              value={entity.name}
            />
            {(isSaving || isUpdating) && <span className="text-blue-500">↻</span>}
          </h1>

          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full">
              @{entity.slug}
            </span>
            <span className="text-sm bg-muted/50 px-2 py-1 rounded-full">{getEntityTypeName()}</span>
          </div>

          <div className="text-muted-foreground">
            <EditableText
              multiline
              onChange={handleEntityDescriptionChange}
              placeholder="Öğe açıklaması ekleyin..."
              value={entity.description || ""}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Tabs
          onValueChange={(value) => {
            setActiveTab(value)
          }}
          value={activeTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Özellikler</TabsTrigger>
            <TabsTrigger value="notes">Notlar</TabsTrigger>
            <TabsTrigger value="usages">Kullanımlar</TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="properties">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Özellikler</h2>
              <AddPropertyDialog />
            </div>

            <PropertyList />
          </TabsContent>

          <TabsContent className="mt-4" value="notes">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Notlar</h2>
              <AddNoteDialog />
            </div>

            <NotesList />
          </TabsContent>

          <TabsContent className="mt-4" value="usages">
            <Card>
              <CardHeader>
                <CardTitle>Kullanım İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Bu öğe toplam {usagesWithTitles.reduce((sum, usage) => sum + usage.count, 0)} kez kullanılmıştır.
                </p>

                <UsageList usages={usagesWithTitles} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>



    </div>
  )
}
