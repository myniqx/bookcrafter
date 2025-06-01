"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyList } from "@/components/property-list"
import { NotesList } from "@/components/notes-list"
import { UsageList } from "@/components/usage-list"
import { AddPropertyDialog } from "@/components/add-property-dialog"
import { AddNoteDialog } from "@/components/add-note-dialog"
import { useProject } from "@/hooks/use-project"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { useToast } from "@/components/ui/use-toast"
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation"
import { EditableText } from "@/components/editable-text"
import { useAutosave } from "@/hooks/use-autosave"
import type { EntityProperty, Note } from "@/lib/types"
import { goToProject } from "@/lib/utils/navigateTo"

export default function EntityPage({
  params,
}: {
  params: { id: string; entityId: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { project, loading, error, saveProject } = useProject(params.id)
  const [activeTab, setActiveTab] = useState("properties")
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const { hasUnsavedChanges, setUnsavedChanges } = useUnsavedChanges()
  const { toast } = useToast()

  // Set up autosave
  const { handleManualSave } = useAutosave(params.id, project, hasUnsavedChanges)

  useEffect(() => {
    if (error) {
      router.push("/")
    }
  }, [error, router])

  // Set active tab based on URL params
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "notes" || tab === "usages") {
      setActiveTab(tab)
    } else {
      setActiveTab("properties")
    }
  }, [searchParams])

  if (loading) {
    return null // Layout will show loading state
  }

  if (!project) {
    return null
  }

  const entity = project.entities.find((e) => e.id === params.entityId)

  if (!entity) {
    goToProject(params.id, router)
    return null
  }

  const handleAddProperty = (property: EntityProperty) => {
    const updatedEntities = project.entities.map((e) => {
      if (e.id === entity.id) {
        return {
          ...e,
          properties: [...e.properties, property],
        }
      }
      return e
    })

    const updatedProject = {
      ...project,
      entities: updatedEntities,
    }

    saveProject(updatedProject)
    setIsAddPropertyOpen(false)

    toast({
      title: "Özellik eklendi",
      description: `"${property.name}" özelliği başarıyla eklendi.`,
      variant: "success",
    })

    setUnsavedChanges(false)
  }

  const handleAddNote = (note: Note) => {
    const updatedEntities = project.entities.map((e) => {
      if (e.id === entity.id) {
        return {
          ...e,
          notes: [...(e.notes || []), note],
        }
      }
      return e
    })

    const updatedProject = {
      ...project,
      entities: updatedEntities,
    }

    saveProject(updatedProject)
    setIsAddNoteOpen(false)

    toast({
      title: "Not eklendi",
      description: `"${note.title}" notu başarıyla eklendi.`,
      variant: "success",
    })

    setUnsavedChanges(false)
  }

  // Handle entity name and description changes
  const handleEntityNameChange = (name: string) => {
    if (name !== entity.name) {
      const updatedEntities = project.entities.map((e) => {
        if (e.id === entity.id) {
          return {
            ...e,
            name,
            updatedAt: new Date().toISOString(),
          }
        }
        return e
      })

      // Update the project in memory
      project.entities = updatedEntities
      project.updatedAt = new Date().toISOString()

      setUnsavedChanges(true)
    }
  }

  const handleEntityDescriptionChange = (description: string) => {
    if (description !== entity.description) {
      const updatedEntities = project.entities.map((e) => {
        if (e.id === entity.id) {
          return {
            ...e,
            description,
            updatedAt: new Date().toISOString(),
          }
        }
        return e
      })

      // Update the project in memory
      project.entities = updatedEntities
      project.updatedAt = new Date().toISOString()

      setUnsavedChanges(true)
    }
  }

  // Get book and chapter titles for usages
  const usagesWithTitles = (entity.usages || []).map((usage) => {
    const book = project.books.find((b) => b.id === usage.bookId)
    const chapter = book?.chapters.find((c) => c.id === usage.chapterId)

    return {
      ...usage,
      bookTitle: book?.title || "Bilinmeyen Kitap",
      chapterTitle: chapter?.title || "Bilinmeyen Bölüm",
    }
  })

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

  // Breadcrumb items
  const breadcrumbItems = [
    { label: project.name, href: `/project/${params.id}` },
    { label: getEntityTypeName(), href: `/project/${params.id}?tab=entities&type=${entity.type}` },
    { label: entity.name },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb navigation */}
      <BreadcrumbNavigation items={breadcrumbItems} projectId={params.id} />

      <div className="p-4 border-b">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
            <EditableText
              value={entity.name}
              onChange={handleEntityNameChange}
              isTitle
              className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
            />
            {hasUnsavedChanges && <span className="text-red-500">*</span>}
          </h1>

          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full">
              @{entity.slug}
            </span>
            <span className="text-sm bg-muted/50 px-2 py-1 rounded-full">{getEntityTypeName()}</span>
          </div>

          <div className="text-muted-foreground">
            <EditableText
              value={entity.description || ""}
              onChange={handleEntityDescriptionChange}
              placeholder="Öğe açıklaması ekleyin..."
              multiline
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            // Update URL
            const params = new URLSearchParams(searchParams)
            params.set("tab", value)
            router.push(`${router.pathname}?${params.toString()}`)
          }}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Özellikler</TabsTrigger>
            <TabsTrigger value="notes">Notlar</TabsTrigger>
            <TabsTrigger value="usages">Kullanımlar</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Özellikler</h2>
              <Button onClick={() => setIsAddPropertyOpen(true)}>Özellik Ekle</Button>
            </div>

            <PropertyList properties={entity.properties} entityId={entity.id} projectId={params.id} />
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Notlar</h2>
              <Button onClick={() => setIsAddNoteOpen(true)}>Not Ekle</Button>
            </div>

            <NotesList notes={entity.notes || []} entityId={entity.id} projectId={params.id} />
          </TabsContent>

          <TabsContent value="usages" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Kullanım İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Bu öğe toplam {usagesWithTitles.reduce((sum, usage) => sum + usage.count, 0)} kez kullanılmıştır.
                </p>

                <UsageList usages={usagesWithTitles} projectId={params.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddPropertyDialog
        open={isAddPropertyOpen}
        onOpenChange={setIsAddPropertyOpen}
        onAddProperty={handleAddProperty}
        existingProperties={entity.properties}
      />

      <AddNoteDialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen} onAddNote={handleAddNote} />
    </div>
  )
}
