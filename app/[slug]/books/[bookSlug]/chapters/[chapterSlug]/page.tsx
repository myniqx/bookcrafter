"use client"

import { useEffect, useState } from "react"


import { ChapterHeader } from "@/components/chapter-header"
import { ChapterStatisticsView } from "@/components/chapter-statistics-view"
import { EntityBadgesList } from "@/components/entity-badges-list"
import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { useChapter } from "@/providers/chapter-provider"
import { ChapterStatistics, Entity } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { useProject } from "@/providers/project-provider"

export default function ChapterPage() {
  const { book, chapter, project, updateChapter } = useChapter()
  const { saveProject, updateProject } = useProject()
  
  const router = useRouter()
  const [content, setContent] = useState("")
  const [originalContent, setOriginalContent] = useState("")
  const [activeTab, setActiveTab] = useState("preview")
  const [statistics, setStatistics] = useState<ChapterStatistics | null>(null)
  const [processedContent, setProcessedContent] = useState("")
  const { hasUnsavedChanges, setUnsavedChanges } = useUnsavedChanges()
  const { toast } = useToast()
  const [chapterTitle, setChapterTitle] = useState("")
  const { t } = useLanguage()


  // Load chapter content
  useEffect(() => {
    if (!chapter) return

    setContent(chapter.content || "")
    setOriginalContent(chapter.content || "")
    setChapterTitle(chapter.title)
    calculateStatistics(chapter.content || "", project.entities)
  }, [chapter])

  // Check for unsaved changes
  useEffect(() => {
    setUnsavedChanges(content !== originalContent)
  }, [content, originalContent, setUnsavedChanges])



  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    calculateStatistics(newContent, project.entities)
  }

  const handleProcessedContentChange = (processed: string) => {
    setProcessedContent(processed)
  }

  const handleSave = () => {
    updateChapter({
      content,
      title: chapterTitle
    })

    // Update entity references
    const entityReferences = extractEntityReferences(content, project.entities)
    const updatedEntities = project.entities.map((entity) => {
      const references = entityReferences.filter((ref) => ref.entitySlug === entity.slug)
      if (references.length > 0) {
        const updatedUsages = [...(entity.usages || [])]

        // Check if this chapter is already in usages
        const existingUsageIndex = updatedUsages.findIndex(
          (usage) => usage.bookId === book.slug && usage.chapterId === chapter.slug,
        )

        if (existingUsageIndex >= 0) {
          // Update existing usage
          updatedUsages[existingUsageIndex] = {
            bookId: book.slug,
            chapterId: chapter.slug,
            count: references.length,
          }
        } else {
          // Add new usage
          updatedUsages.push({
            bookId: book.slug,
            chapterId: chapter.slug,
            count: references.length,
          })
        }

        return {
          ...entity,
          usages: updatedUsages,
        }
      } else {
        // Remove this chapter from usages if it exists
        const updatedUsages = (entity.usages || []).filter(
          (usage) => !(usage.bookId === book.slug && usage.chapterId === chapter.slug),
        )

        return {
          ...entity,
          usages: updatedUsages,
        }
      }
    })

    updateProject({
      ...project,
      entities: updatedEntities,
    })

    saveProject()
    setOriginalContent(content)

    toast({
      description: t("changes_saved"),
      title: t("chapter_saved"),
      variant: "success",
    })

    setUnsavedChanges(false)
  }

  const calculateStatistics = (text: string, entities: Entity[]) => {
    // Count paragraphs (non-empty lines)
    const paragraphs = text.split("\n").filter((line) => line.trim().length > 0)
    const paragraphCount = paragraphs.length

    // Count words
    const words = text.split(/\s+/).filter((word) => word.length > 0)
    const wordCount = words.length

    // Count characters (excluding whitespace)
    const characterCount = text.replace(/\s+/g, "").length

    // Count entity usage
    const entityUsage = entities
      .map((entity) => {
        const regex = new RegExp(`@${entity.slug}(?:\\.(\\w+))?`, "g")
        const matches = text.match(regex) || []

        return {
          count: matches.length,
          entityName: entity.name,
          entitySlug: entity.slug,
        }
      })
      .filter((usage) => usage.count > 0)

    setStatistics({
      characterCount,
      entityUsage,
      paragraphCount,
      wordCount,
    })
  }

  const handleCreateEntity = (entity: Entity) => {
    if (!project) return

    const updatedProject = {
      ...project,
      entities: [...project.entities, entity],
    }

    saveProject(updatedProject)

    toast({
      description: formatTranslation(t("entity_created_description"), { name: entity.name }),
      title: t("entity_created"),
      variant: "success",
    })
  }

  const handleCompleteNote = (entityId: string, noteId: string, completed: boolean) => {

    const updatedEntities = project.entities.map((entity) => {
      if (entity.slug === entityId && entity.notes) {
        const updatedNotes = entity.notes.map((note) => {
          if (note.id === noteId) {
            return {
              ...note,
              completed,
              completedIn: completed
                ? {
                  bookId: book.slug,
                  chapterId: chapter.slug,
                }
                : undefined,
            }
          }
          return note
        })

        return {
          ...entity,
          notes: updatedNotes,
        }
      }
      return entity
    })

    const updatedProject = {
      ...project,
      entities: updatedEntities,
    }

    saveProject(updatedProject)

    toast({
      description: completed ? t("note_completed_description") : t("note_uncompleted_description"),
      title: completed ? t("note_completed") : t("note_uncompleted"),
      variant: "success",
    })
  }

  // Helper function to format translations with variables
  const formatTranslation = (key: string, vars: { [key: string]: string }) => {
    let translation = t(key)
    for (const key in vars) {
      translation = translation.replace(`{${key}}`, vars[key])
    }
    return translation
  }


  return (
    <div className="flex flex-col h-full">
      <div className="flex-none">
        <Separator className="my-2" />
      </div>

      <ChapterHeader />

      <div className="flex-1 overflow-hidden">
        <div className="flex flex-row">
          <ScrollArea className="h-full w-3/5">
            <div className="p-4">
              <MarkdownEditor
                content={content}
                currentChapter={chapter.title}
                entities={project.entities}
                onChange={handleContentChange}
                onProcessedContentChange={handleProcessedContentChange}
                project={project}
              />
            </div>
          </ScrollArea>

          <Tabs className="h-full flex flex-col" onValueChange={setActiveTab} orientation="vertical" value={activeTab}>
            <div className="flex items-center justify-between px-2">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>
              <EntityBadgesList entities={project.entities} />
            </div>


            <TabsContent className="flex-1 overflow-hidden" value="preview">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <MarkdownPreview content={processedContent} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent className="flex-1 overflow-hidden" value="statistics">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <ChapterStatisticsView statistics={statistics} />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>


      </div>
    </div>
  )
}


// Helper function to extract entity references from content
function extractEntityReferences(content: string, entities: Entity[]) {
  const references: { entitySlug: string; property?: string }[] = []

  entities.forEach((entity) => {
    // Match @slug or @slug.property
    const regex = new RegExp(`@${entity.slug}(?:\\.(\\w+))?`, "g")
    let match

    while ((match = regex.exec(content)) !== null) {
      references.push({
        entitySlug: entity.slug,
        property: match[1],
      })
    }
  })

  return references
}
