"use client"

import { useEffect, useState } from "react"

import { ChapterHeader } from "@/components/chapter-header"
import { ChapterStatisticsView } from "@/components/chapter-statistics-view"
import { EntityManagementPanel } from "@/components/entity-management-panel"
import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChapterStatistics, Entity } from "@/lib/types"
import { useChapter } from "@/providers/chapter-provider"

export default function ChapterPage() {
  const { chapter, entities, project } = useChapter()

  const [content, setContent] = useState("")
  const [originalContent, setOriginalContent] = useState("")
  const [activeTab, setActiveTab] = useState("preview")
  const [statistics, setStatistics] = useState<ChapterStatistics | null>(null)
  const [processedContent, setProcessedContent] = useState("")



  // Load chapter content
  useEffect(() => {
    if (!chapter) return

    setContent(chapter.content || "")
    setOriginalContent(chapter.content || "")
    calculateStatistics(chapter.content || "", entities)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.slug])

  const handleProcessedContentChange = (processed: string) => {
    setProcessedContent(processed)
  }


  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    calculateStatistics(newContent, entities)
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


