"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, Upload } from "lucide-react"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { LoadProjectDialog } from "@/components/load-project-dialog"
import { ProjectList } from "@/components/project-list"
import { SavedProjectsList } from "@/components/saved-projects-list"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"

export default function Home() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
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
              onClick={() => setCreateDialogOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("new_project")}
            </Button>
            <Button onClick={() => setLoadDialogOpen(true)} variant="outline" size="lg">
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
              <Tabs defaultValue="saved" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="saved">{t("your_projects")}</TabsTrigger>
                  <TabsTrigger value="autosaved">{t("autosaved_projects")}</TabsTrigger>
                </TabsList>
                <TabsContent value="saved" className="mt-6">
                  <ProjectList />
                </TabsContent>
                <TabsContent value="autosaved" className="mt-6">
                  <SavedProjectsList />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <LoadProjectDialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen} />
    </div>
  )
}
