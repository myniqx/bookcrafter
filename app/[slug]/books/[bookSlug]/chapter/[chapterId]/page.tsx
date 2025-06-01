"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useProject } from "@/hooks/use-project"
import { ChapterHeader } from "@/components/chapter-header"
import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { ChapterStatisticsView } from "@/components/chapter-statistics-view"
import { EntityBadgesList } from "@/components/entity-badges-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ChapterPage() {
  const params = useParams()
  const projectId = params.id as string
  const bookId = params.bookId as string
  const chapterId = params.chapterId as string

  const { project, loading, error, getBook, getChapter, updateChapter } = useProject(projectId)
  const [content, setContent] = useState("")
  const [processedContent, setProcessedContent] = useState("")
  const [activeTab, setActiveTab] = useState("write")
  const { setUnsavedChanges } = useUnsavedChanges()

  // Load chapter content
  useEffect(() => {
    if (project) {
      const chapter = getChapter(bookId, chapterId)
      if (chapter) {
        setContent(chapter.content || "")
      }
    }
  }, [project, bookId, chapterId, getChapter])

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setUnsavedChanges(true)
  }

  // Handle processed content change
  const handleProcessedContentChange = (processed: string) => {
    setProcessedContent(processed)
  }

  // Save chapter content
  const handleSave = () => {
    if (project) {
      updateChapter(bookId, chapterId, {
        content,
        updatedAt: new Date().toISOString(),
      })
      setUnsavedChanges(false)
    }
  }

  // Get book and chapter
  const book = project ? getBook(bookId) : null
  const chapter = book ? book.chapters.find((c) => c.id === chapterId) : null

  if (loading) {
    return <div className="p-4">Loading chapter...</div>
  }

  if (error || !project || !book || !chapter) {
    return <div className="p-4">Error loading chapter</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none">
        <BreadcrumbNavigation
          items={[
            { label: project.name, href: `/project/${project.id}` },
            { label: book.title, href: `/project/${project.id}/book/${book.id}` },
            { label: chapter.title, href: `/project/${project.id}/book/${book.id}/chapter/${chapter.id}` },
          ]}
        />
        <Separator className="my-2" />
      </div>

      <ChapterHeader
        chapter={chapter}
        bookId={bookId}
        onSave={handleSave}
        onTitleChange={(title) => updateChapter(bookId, chapterId, { title })}
      />

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="flex items-center justify-between px-2">
            <TabsList>
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>
            <EntityBadgesList entities={project.entities} />
          </div>

          <TabsContent value="write" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                <MarkdownEditor
                  content={content}
                  entities={project.entities}
                  project={project}
                  currentChapter={chapter.title}
                  onChange={handleContentChange}
                  onProcessedContentChange={handleProcessedContentChange}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                <MarkdownPreview content={processedContent} />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="statistics" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                <ChapterStatisticsView content={content} entities={project.entities} />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
