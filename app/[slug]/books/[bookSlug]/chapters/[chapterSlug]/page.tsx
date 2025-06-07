"use client"

import { useCallback, useEffect, useState } from "react"

import { ChapterHeader } from "@/components/chapter-header"
import { ChapterStatisticsView } from "@/components/chapter-statistics-view"
import { EntityManagementPanel } from "@/components/entity-management-panel"
import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { ChapterStatistics, Entity } from "@/lib/types"
import { useChapter } from "@/providers/chapter-provider"
import { useProject } from "@/providers/project-provider"
import { debounce } from "lodash"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function ChapterPage() {
  const { book, chapter, project, updateChapter } = useChapter()
  const { saveProject, updateProject } = useProject()

  const [content, setContent] = useState("")
  const [originalContent, setOriginalContent] = useState("")
  const [activeTab, setActiveTab] = useState("preview")
  const [statistics, setStatistics] = useState<ChapterStatistics | null>(null)
  const [processedContent, setProcessedContent] = useState("")
  const { toast } = useToast()
  const { t } = useLanguage()


  // Load chapter content
  useEffect(() => {
    if (!chapter) return

    setContent(chapter.content || "")
    setOriginalContent(chapter.content || "")
    calculateStatistics(chapter.content || "", project.entities)
  }, [chapter])

  const handleProcessedContentChange = (processed: string) => {
    setProcessedContent(processed)
  }

  const handleSave = (content: string) => {
    updateChapter({ content })

    // Update entity references
    const entityReferences = extractEntityReferences(content, project.entities)
    const updatedEntities = project.entities.map((entity) => {
      const references = entityReferences.filter((ref) => ref.entitySlug === entity.slug)
      if (references.length > 0) {
        const updatedUsages = [...(entity.usages || [])]

        // Check if this chapter is already in usages
        const existingUsageIndex = updatedUsages.findIndex(
          (usage) => usage.bookSlug === book.slug && usage.chapterSlug === chapter.slug,
        )

        if (existingUsageIndex >= 0) {
          // Update existing usage
          updatedUsages[existingUsageIndex] = {
            bookSlug: book.slug,
            chapterSlug: chapter.slug,
            count: references.length,
          }
        } else {
          // Add new usage
          updatedUsages.push({
            bookSlug: book.slug,
            chapterSlug: chapter.slug,
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
          (usage) => !(usage.bookSlug === book.slug && usage.chapterSlug === chapter.slug),
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

  }

  const handleSaveDebounced = debounce(handleSave, 1000)


  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    calculateStatistics(newContent, project.entities)
    handleSaveDebounced()
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



  return (
    <div className="flex flex-col h-full">
      <ChapterHeader />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction={"horizontal"}>
          <ResizablePanel className="p-2" defaultSize={70} minSize={30}>
            <ScrollArea>
              <MarkdownEditor
                content={content}
                currentChapter={chapter.title}
                onChange={handleContentChange}
                onProcessedContentChange={handleProcessedContentChange}
                project={project}
              />
            </ScrollArea>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel className="p-2" minSize={30}>
            <Tabs
              onValueChange={setActiveTab}
              orientation="vertical"
              value={activeTab}
            >
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="entities">Entities</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>

              <TabsContent className="flex-1 overflow-hidden" value="preview">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <MarkdownPreview content={processedContent} />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent className="flex-1 overflow-hidden" value="entities">
                <ScrollArea className="h-full">
                  <EntityManagementPanel
                    bookId={book.slug}
                    chapterId={chapter.slug}
                    onCompleteNote={handleCompleteNote} />
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
          </ResizablePanel>
        </ResizablePanelGroup>


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
