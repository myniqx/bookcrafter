"use client"

import { useEffect, useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import type { EntityType, ProjectImage } from "@/lib/types"

import { BooksList } from "@/components/books-list"
import { EntityList } from "@/components/entity-list"
import { ImageManager } from "@/components/image-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"
import { goToProject } from "@/lib/utils/navigateTo"
import { useProject } from "@/providers/project-provider"

export default function ProjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { project } = useProject()
  const [activeTab, setActiveTab] = useState("books")

  const { t } = useLanguage()

  const [activeType, onTypeChange] = useState<EntityType>("character")
  // Set active tab based on URL params
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "entities") {
      setActiveTab("entities")
    } else {
      setActiveTab("books")
    }
  }, [searchParams])




  const handleAddImage = (image: ProjectImage) => {
    const updatedProject = {
      ...project,
      images: [...(project.images || []), image],
      updatedAt: new Date().toISOString(),
    }

    // Update project in memory
    project.images = updatedProject.images
    project.updatedAt = updatedProject.updatedAt

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

  }

  return (
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
            goToProject({ params: params.toString(), project, router })
          }}
          value={activeTab}
        >
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="books">{t("books_tab")}</TabsTrigger>
            <TabsTrigger value="entities">{t("world_items_tab")}</TabsTrigger>
            <TabsTrigger value="images">{t("images_tab")}</TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="books">
            <BooksList />
          </TabsContent>

          <TabsContent className="mt-4" value="entities">
            <EntityList
            activeType={activeType}
            onTypeChange={onTypeChange}
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
  )
}
