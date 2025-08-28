"use client"

import { useEffect, useMemo, useState } from "react"

import { ChapterHeader } from "@/components/chapter-header"
import { ChapterStatisticsView } from "@/components/chapter-statistics-view"
import { EntityManagementPanel } from "@/components/entity-management-panel"
import { MarkdownEditorV2 } from "@/components/markdown-editor-v2"
import { MarkdownPreview } from "@/components/markdown-preview"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChapterStatistics } from "@/lib/types"
import { useCurrentBookStore, useCurrentChapterStore, useEntitiesStore } from "@/lib/stores"
// import { useChapterContentQuery } from "@/hooks/queries/use-chapter-query"

interface ChapterPageV2Props {
  params: {
    slug: string
    bookSlug: string
    chapterSlug: string
  }
}

export default function ChapterPageV2({ params }: ChapterPageV2Props) {
  const { bookSlug, chapterSlug, slug: projectSlug } = params

  // Store state
  const chapter = useCurrentChapterStore(state => state.chapter)
  const content = useCurrentChapterStore(state => state.content)
  const setChapter = useCurrentChapterStore(state => state.setChapter)
  const setContent = useCurrentChapterStore(state => state.setContent)

  const book = useCurrentBookStore(state => state.book)
  const getChapter = useCurrentBookStore(state => state.getChapter)

  const entities = useEntitiesStore(state => state.entities)

  // Local state for UI
  const [activeTab, setActiveTab] = useState("preview")
  const [statistics, setStatistics] = useState<ChapterStatistics | null>(null)
  const [processedContent, setProcessedContent] = useState("")

  // Derive bookId and chapterId from slugs - in real implementation these would be UUID
  // For now we'll use the slugs as IDs
  const bookId = bookSlug
  const chapterId = chapterSlug

  // Mock loading state for testing
  const chapterContent = null
  const isLoading = false
  const error: { message: string } | null = null

  // Set chapter data when component mounts or chapter changes
  useEffect(() => {
    const currentChapter = getChapter(chapterSlug)
    if (currentChapter) {
      setChapter(currentChapter)

      // If we have content from query, use it, otherwise use chapter content
      const initialContent = chapterContent || currentChapter.content || ""
      setContent(initialContent)
    }
  }, [chapterSlug, getChapter, setChapter, setContent, chapterContent])

  // Calculate statistics whenever content or entities change
  const calculatedStatistics = useMemo(() => {
    if (!content || !entities) return null

    return calculateStatistics(content, entities)
  }, [content, entities])

  // Update statistics when calculation changes
  useEffect(() => {
    setStatistics(calculatedStatistics)
  }, [calculatedStatistics])

  const handleProcessedContentChange = (processed: string) => {
    setProcessedContent(processed)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading chapter: {error.message}</p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show not found state
  if (!chapter) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Chapter not found</p>
          <a className="text-primary hover:underline" href={`/${projectSlug}/books/${bookSlug}`}>
            Back to book
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ChapterHeader />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction={"horizontal"}>
          <ResizablePanel className="p-2" defaultSize={70} minSize={30}>
            <ScrollArea>
              <MarkdownEditorV2
                bookId={bookId}
                chapterId={chapterId}
                onProcessedContentChange={handleProcessedContentChange}
                projectSlug={projectSlug}
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
                  <EntityManagementPanel />
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

// Helper function to calculate statistics (moved from original component)
function calculateStatistics(text: string, entities: any[]): ChapterStatistics {
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

  return {
    characterCount,
    entityUsage,
    paragraphCount,
    wordCount,
  }
}
