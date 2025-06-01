"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { useProjects } from "@/hooks/use-projects"
import { Loader2 } from "lucide-react"

export function ProjectList() {
  const { t } = useLanguage()
  const { projects, loading, loadProjects } = useProjects()

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">{t("no_projects_yet")}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link href={`/${project.slug}/project`} key={project.slug || project.name}>
          <Card className="h-full cursor-pointer hover:bg-muted/20 transition-colors">
            <CardHeader>
              <CardTitle>{project.name || t("untitled_project")}</CardTitle>
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
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                {t("created")}: {project.createdAt ? formatDate(project.createdAt) : t("unknown")}
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
