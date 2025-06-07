"use client"

import { useEffect, useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import type { Book, Entity, EntityType, ProjectImage } from "@/lib/types"

import { BooksList } from "@/components/books-list"
import { CreateBookDialog } from "@/components/create-book-dialog"
import { CreateEntityDialog } from "@/components/create-entity-dialog"
import { EntityList } from "@/components/entity-list"
import { ExportDialog } from "@/components/export-dialog"
import { ImageManager } from "@/components/image-manager"
import { ProjectHeader } from "@/components/project-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { formatTranslation, useLanguage } from "@/contexts/language-context"
import { useAutosave } from "@/hooks/use-autosave"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { goToProject } from "@/lib/utils/navigateTo"
import { useProject } from "@/providers/project-provider"

export default function ProjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { error, loading, project, saveProject } = useProject()
  const [activeTab, setActiveTab] = useState("books")
  const [isCreateBookOpen, setIsCreateBookOpen] = useState(false)
  const [isCreateEntityOpen, setIsCreateEntityOpen] = useState(false)
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>("character")
  const { hasUnsavedChanges, setUnsavedChanges } = useUnsavedChanges()
  const { toast } = useToast()
  const { t } = useLanguage()

  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  // Set up autosave
  const { handleManualSave } = useAutosave()

  // Set active tab based on URL params
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "entities") {
      setActiveTab("entities")
    } else {
      setActiveTab("books")
    }
  }, [searchParams])

  useEffect(() => {
    if (error) {
      router.push("/")
    }
  }, [error, router])

  if (loading) {
    return null // Layout will show loading state
  }

  if (!project) {
    return null
  }

  const handleCreateBook = (book: Book) => {
    const updatedProject = {
      ...project,
      books: [...project.books, book],
    }
    saveProject(updatedProject)
    setIsCreateBookOpen(false)

    toast({
      description: formatTranslation(t("book_created_description"), { title: book.title }),
      title: t("book_created"),
      variant: "success",
    })

    setUnsavedChanges(false)
  }

  const handleCreateEntity = (entity: Entity) => {
    const updatedProject = {
      ...project,
      entities: [...project.entities, entity],
    }
    saveProject(updatedProject)
    setIsCreateEntityOpen(false)

    toast({
      description: formatTranslation(t("entity_created_description"), { name: entity.name }),
      title: t("entity_created"),
      variant: "success",
    })

    setUnsavedChanges(false)
  }

  const openCreateEntityDialog = (type: EntityType) => {
    setSelectedEntityType(type)
    setIsCreateEntityOpen(true)
  }

  const handleSave = () => {
    if (handleManualSave()) {
      toast({
        description: t("all_changes_saved"),
        title: t("project_saved"),
        variant: "success",
      })
    }
  }

  // Handle project name and description changes
  const handleProjectNameChange = (name: string) => {
    if (name !== project.name) {
      const updatedProject = {
        ...project,
        name,
        updatedAt: new Date().toISOString(),
      }

      // Don't save immediately, just update the state and mark as unsaved
      // saveProject(updatedProject)
      // Instead, update the project in memory
      project.name = name
      project.updatedAt = new Date().toISOString()

      setUnsavedChanges(true)
    }
  }

  const handleProjectDescriptionChange = (description: string) => {
    if (description !== project.description) {
      const updatedProject = {
        ...project,
        description,
        updatedAt: new Date().toISOString(),
      }

      // Don't save immediately, just update the state and mark as unsaved
      // saveProject(updatedProject)
      // Instead, update the project in memory
      project.description = description
      project.updatedAt = new Date().toISOString()

      setUnsavedChanges(true)
    }
  }

  // Handle book title and description changes
  const handleBookTitleChange = (bookId: string, title: string) => {
    const updatedBooks = project.books.map((book) => {
      if (book.id === bookId) {
        return {
          ...book,
          title,
          updatedAt: new Date().toISOString(),
        }
      }
      return book
    })

    const updatedProject = {
      ...project,
      books: updatedBooks,
      updatedAt: new Date().toISOString(),
    }

    // Don't save immediately, just update the state and mark as unsaved
    // saveProject(updatedProject)
    // Instead, update the project in memory
    project.books = updatedBooks
    project.updatedAt = new Date().toISOString()

    setUnsavedChanges(true)
  }

  const handleBookDescriptionChange = (bookId: string, description: string) => {
    const updatedBooks = project.books.map((book) => {
      if (book.id === bookId) {
        return {
          ...book,
          description,
          updatedAt: new Date().toISOString(),
        }
      }
      return book
    })

    const updatedProject = {
      ...project,
      books: updatedBooks,
      updatedAt: new Date().toISOString(),
    }

    // Don't save immediately, just update the state and mark as unsaved
    // saveProject(updatedProject)
    // Instead, update the project in memory
    project.books = updatedBooks
    project.updatedAt = new Date().toISOString()

    setUnsavedChanges(true)
  }

  const handleAddImage = (image: ProjectImage) => {
    const updatedProject = {
      ...project,
      images: [...(project.images || []), image],
      updatedAt: new Date().toISOString(),
    }

    // Update project in memory
    project.images = updatedProject.images
    project.updatedAt = updatedProject.updatedAt

    setUnsavedChanges(true)
  }

  const handleRemoveImage = (imageId: string) => {
    const updatedProject = {
      ...project,
      images: (project.images || []).filter((img) => img.id !== imageId),
      updatedAt: new Date().toISOString(),
    }

    // Update project in memory
    project.images = updatedProject.images
    project.updatedAt = updatedProject.updatedAt

    setUnsavedChanges(true)
  }

  const handleSetCoverImage = (imageId: string) => {
    const updatedProject = {
      ...project,
      coverImageId: imageId,
      updatedAt: new Date().toISOString(),
    }

    // Update project in memory
    project.coverImageId = updatedProject.coverImageId
    project.updatedAt = updatedProject.updatedAt

    setUnsavedChanges(true)
  }

  const handleSetBackgroundImage = (imageId: string) => {
    const updatedProject = {
      ...project,
      backgroundImageId: imageId,
      updatedAt: new Date().toISOString(),
    }

    // Update project in memory
    project.backgroundImageId = updatedProject.backgroundImageId
    project.updatedAt = updatedProject.updatedAt

    setUnsavedChanges(true)
  }

  // Get entity type from URL
  const entityType = (searchParams.get("type") as EntityType) || "character"

  return (
    <>

      <div className="flex-1 overflow-auto p-4">
        <Tabs
          className="w-full"
          onValueChange={(value: string) => {
            setActiveTab(value)
            // Update URL
            const params = new URLSearchParams(searchParams)
            if (value === "entities") {
              params.set("tab", "entities")
              if (!params.has("type")) {
                params.set("type", "character")
              }
            } else if (value !== 'images') {
              params.delete("tab")
              params.delete("type")
            }
            goToProject({ params: params.toString(), projectSlug: project.slug, router })
          }}
          value={activeTab}
        >
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="books">{t("books_tab")}</TabsTrigger>
            <TabsTrigger value="entities">{t("world_items_tab")}</TabsTrigger>
            <TabsTrigger value="images">{t("images_tab")}</TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="books">
            <BooksList />
          </TabsContent>

          <TabsContent className="mt-4" value="entities">
            <EntityList
              activeType={entityType}
              entities={project.entities}
              onCreateCharacter={() => openCreateEntityDialog("character")}
              onCreateEvent={() => openCreateEntityDialog("event")}
              onCreateItem={() => openCreateEntityDialog("item")}
              onCreateLocation={() => openCreateEntityDialog("location")}
              onTypeChange={(type) => {
                // Update URL
                const params = new URLSearchParams(searchParams)
                params.set("type", type)
                goToProject({ params: params.toString(), projectSlug: project.slug, router })
              }}
              projectId={project.id}
            />
          </TabsContent>

          <TabsContent className="mt-4" value="images">
            <ImageManager
              backgroundImageId={project.backgroundImageId}
              coverImageId={project.coverImageId}
              images={project.images || []}
              onAddImage={handleAddImage}
              onRemoveImage={handleRemoveImage}
              onSetBackgroundImage={handleSetBackgroundImage}
              onSetCoverImage={handleSetCoverImage}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreateEntityDialog
        entityType={selectedEntityType}
        onCreateEntity={handleCreateEntity}
        onOpenChange={setIsCreateEntityOpen}
        open={isCreateEntityOpen}
      />

    </>
  )
}
