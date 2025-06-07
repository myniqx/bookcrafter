"use client"

import { useEffect, useState } from "react"

import { FileText, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import type { Project } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { formatDate } from "@/lib/utils"

export function SavedProjectsList() {
  const [savedProjects, setSavedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    // Load saved projects from localStorage
    const loadSavedProjects = () => {
      try {
        if (typeof window !== "undefined") {
          const projectsListKey = "projects_list"
          const projectsListJson = localStorage.getItem(projectsListKey)

          if (projectsListJson) {
            const projectsList = JSON.parse(projectsListJson) as Project[]
            // Filter to show only autosaved projects
            const autosavedProjects = (projectsList || []).filter((project) => project?.slug?.includes("-autosave"))
            setSavedProjects(autosavedProjects)
          } else {
            setSavedProjects([])
          }
        }
      } catch (error) {
        console.error("Error parsing saved projects:", error)
        setSavedProjects([])
      } finally {
        setLoading(false)
      }
    }

    loadSavedProjects()
  }, [])

  const handleLoadProject = (slug: string) => {
    if (!slug) return

    // Extract the original project ID (remove -autosave suffix)
    const originalId = slug.replace("-autosave", "")
    router.push(`/${originalId}/project`)
  }

  const handleDeleteProject = (slug: string) => {
    if (!slug || typeof window === "undefined") return

    try {
      // Remove from localStorage
      localStorage.removeItem(`project_${slug}`)

      // Update projects list
      const projectsListKey = "projects_list"
      const projectsListJson = localStorage.getItem(projectsListKey)

      if (projectsListJson) {
        const projectsList = JSON.parse(projectsListJson) as Project[]
        const updatedList = (projectsList || []).filter((p) => p?.slug !== slug)
        localStorage.setItem(projectsListKey, JSON.stringify(updatedList))

        // Update state
        setSavedProjects((prevProjects) => (prevProjects || []).filter((p) => p?.slug !== slug))
      }
    } catch (error) {
      console.error("Error updating projects list:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    )
  }

  if (!savedProjects || savedProjects.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">{t("no_autosaved_projects")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {savedProjects.map((project) => {
        if (!project || !project.slug) return null

        // Extract original project name (remove -autosave suffix)
        const originalName = (project.name || t("untitled_project")).replace("-autosave", "")

        return (
          <Card className="hover:bg-muted/20 transition-colors" key={project.slug}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {originalName} <span className="text-amber-500">({t("autosaved")})</span>
                </span>
              </CardTitle>
              <CardDescription>{project.description || t("no_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("book_count")}:</span>
                  <span className="text-sm font-medium">{project.books?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("entity_count")}:</span>
                  <span className="text-sm font-medium">{project.entities?.length || 0}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-xs text-muted-foreground">
                {t("last_updated")}: {project.updatedAt ? formatDate(project.updatedAt) : t("unknown")}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleDeleteProject(project.slug)} size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t("delete")}
                </Button>
                <Button onClick={() => handleLoadProject(project.slug)} size="sm" variant="default">
                  {t("load")}
                </Button>
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
