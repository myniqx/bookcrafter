"use client"

import { useState } from "react"

import { BookOpen, Plus, Upload } from "lucide-react"

import { CreateProjectDialog } from "@/components/create-project-dialog"
import { LanguageSwitcher } from "@/components/language-switcher"
import { LoadProjectDialog } from "@/components/load-project-dialog"
import { ProjectList } from "@/components/project-list"
import { SavedProjectsList } from "@/components/saved-projects-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"
import { useProjects } from "@/hooks/use-projects"
import { generateMock } from "@/lib/generateMock"
import { goToProject } from "@/lib/utils/navigateTo"
import { useRouter } from "next/navigation"

export default function Home() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const { t } = useLanguage()
  const router = useRouter()
  const { createProject } = useProjects()
  const mockProject = async () => {
    const mock = generateMock()
    const createdProject = await createProject({
      description: mock.metadata.description,
      name: mock.metadata.name
    })
    if (createdProject) {
      goToProject({ project: { slug: createdProject.metadata.slug }, router })
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header with language switcher */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("app_title")}</h1>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("welcome")}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {t("welcome_description")}
            </p>
            <p className="text-gray-500 dark:text-gray-400">{t("get_started")}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={mockProject}
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Mock Project
            </Button>
            <Button
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => setCreateDialogOpen(true)}
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("new_project")}
            </Button>
            <Button onClick={() => setLoadDialogOpen(true)} size="lg" variant="outline">
              <Upload className="mr-2 h-5 w-5" />
              {t("load_project")}
            </Button>
          </div>

          {/* Projects Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t("your_projects")}</CardTitle>
              <CardDescription>{t("get_started")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs className="w-full" defaultValue="saved">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="saved">{t("your_projects")}</TabsTrigger>
                  <TabsTrigger value="autosaved">{t("autosaved_projects")}</TabsTrigger>
                </TabsList>
                <TabsContent className="mt-6" value="saved">
                  <ProjectList />
                </TabsContent>
                <TabsContent className="mt-6" value="autosaved">
                  <SavedProjectsList />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <CreateProjectDialog onOpenChange={setCreateDialogOpen} open={createDialogOpen} />
      <LoadProjectDialog onOpenChange={setLoadDialogOpen} open={loadDialogOpen} />
    </div>
  )
}
