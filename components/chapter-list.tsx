"use client"

import { FileText } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { useCurrentBookStore, useCurrentProjectStore } from "@/lib/stores"
import { useProjectQuery, useSaveProjectMutation } from "@/hooks/queries/use-project-query"

import { CreateChapterDialog } from "./create-chapter-dialog"
import { EditableText } from "./editable-text"
import { goToChapter } from "@/lib/utils/navigateTo"


export function ChapterList() {
  const { book, chapters } = useCurrentBookStore()
  const { metadata: project } = useCurrentProjectStore()
  const { data: fullProject } = useProjectQuery(project?.slug || '')
  const saveProjectMutation = useSaveProjectMutation()
  
  const updateChapter = async (chapterSlug: string, updates: any) => {
    if (!fullProject) return
    
    const updatedProject = {
      ...fullProject,
      chapters: fullProject.chapters.map(chapter => 
        chapter.slug === chapterSlug ? { ...chapter, ...updates, updatedAt: new Date().toISOString() } : chapter
      )
    }
    
    await saveProjectMutation.mutateAsync(updatedProject)
  }
  const { t } = useLanguage()

  if (!chapters) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">{t("no_chapters_yet")}</p>
        <CreateChapterDialog />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("chapters")}</h2>
        <CreateChapterDialog />
      </div>

      <div className="grid gap-4">
        {chapters.map((chapter, index) => (
          <Link href={goToChapter({ book, chapter, project })} key={chapter.slug}>
            <Card className="cursor-pointer hover:bg-muted/20 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  <EditableText
                    className="flex-1"
                    onChange={(value) => updateChapter(chapter.slug, { title: value })}
                    value={chapter.title || t("untitled_chapter")}
                  />
                </div>
                <div>
                  <EditableText
                    onChange={(value) => updateChapter(chapter.slug, { description: value })}
                    placeholder={t("add_description")}
                    value={chapter.description || t("no_description")}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {chapter.content ? `${chapter.content.length} ${t("characters")}` : t("empty")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
