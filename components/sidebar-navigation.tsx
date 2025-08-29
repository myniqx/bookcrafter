"use client"

import { useState } from "react"
import { BookIcon, ChevronDown, ChevronRight, Home, Save, Workflow, Users, MapPin, Package, Calendar } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import type { Book, Chapter, Entity } from "@/lib/types"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useLanguage } from "@/contexts/language-context"
import { useCurrentProjectStore, useCurrentChapterStore } from "@/lib/stores"
import { useProjectQuery } from "@/hooks/queries/use-project-query"
import { goToBook, goToProject, goToChapter, goToEntity } from "@/lib/utils/navigateTo"
export function SidebarNavigation() {
  const router = useRouter()
  const [openBooks, setOpenBooks] = useState(true)
  const [openEntities, setOpenEntities] = useState(true)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  
  const { metadata: project } = useCurrentProjectStore()
  const { data: fullProject } = useProjectQuery(project?.slug || '')

  const books = fullProject?.books || []
  const chapters = fullProject?.chapters || []
  const entities = fullProject?.entities || []
  const hasUnsavedChanges = useCurrentChapterStore(state => state.hasUnsavedChanges)
  
  const saveProject = async () => {
    console.warn('Save project not implemented with new store pattern')
  }
  
  const { bookSlug, chapterSlug, slug } = useParams()
  const { t } = useLanguage()

  // Group entities by type
  const entityGroups = {
    character: entities.filter(e => e.type === 'character'),
    location: entities.filter(e => e.type === 'location'),
    item: entities.filter(e => e.type === 'item'),
    event: entities.filter(e => e.type === 'event'),
  }

  const entityIcons = {
    character: Users,
    location: MapPin,
    item: Package,
    event: Calendar,
  }


  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path)
      setShowUnsavedDialog(true)
    } else {
      router.push(path)
    }
  }

  const confirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation)
    }
    setShowUnsavedDialog(false)
    setPendingNavigation(null)
  }

  const cancelNavigation = () => {
    setShowUnsavedDialog(false)
    setPendingNavigation(null)
  }

  const handleSave = () => {
    saveProject()
  }

  if (!project) {
    return null
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold truncate">{project.name}</h2>
              {project.description && (
                <p className="text-xs text-muted-foreground truncate">{project.description}</p>
              )}
            </div>
            {hasUnsavedChanges && (
              <Button onClick={handleSave} size="sm" variant="outline">
                <Save className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={!slug}
                    onClick={() => handleNavigation("/")}
                  >
                    <Home className="h-4 w-4" />
                    <span>{t("home")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={slug === project.slug}
                    onClick={() => handleNavigation(goToProject({ project }))}
                  >
                    <Workflow className="h-4 w-4" />
                    <span>{project.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Books */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <BookIcon className="h-4 w-4" />
              {t("books")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {books.map((book: Book) => {
                  const bookChapters = chapters.filter(ch => ch.bookSlug === book.slug)
                  return (
                    <SidebarMenuItem key={book.slug}>
                      <SidebarMenuButton
                        isActive={bookSlug === book.slug && !chapterSlug}
                        onClick={() => handleNavigation(goToBook({ book, project }))}
                      >
                        <span>{book.title}</span>
                      </SidebarMenuButton>
                      {bookChapters.length > 0 && (
                        <SidebarMenuSub>
                          {bookChapters.map((chapter: Chapter) => (
                            <SidebarMenuSubItem key={chapter.slug}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={chapterSlug === chapter.slug}
                              >
                                <button
                                  onClick={() => handleNavigation(goToChapter({ 
                                    book: { slug: book.slug }, 
                                    chapter: { slug: chapter.slug }, 
                                    project 
                                  }))}
                                >
                                  <span>{chapter.title}</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Entities */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <Users className="h-4 w-4" />
              {t("entities")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Object.entries(entityGroups).map(([type, typeEntities]) => {
                  if (typeEntities.length === 0) return null
                  const Icon = entityIcons[type as keyof typeof entityIcons]
                  return (
                    <SidebarMenuItem key={type}>
                      <SidebarMenuButton>
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{t(`${type}s` as any)}</span>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {typeEntities.slice(0, 5).map((entity: Entity) => (
                          <SidebarMenuSubItem key={entity.slug}>
                            <SidebarMenuSubButton
                              asChild
                            >
                              <button
                                onClick={() => handleNavigation(goToEntity({ 
                                  entity: { slug: entity.slug }, 
                                  project 
                                }))}
                              >
                                <span>{entity.name}</span>
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                        {typeEntities.length > 5 && (
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <button onClick={() => handleNavigation(`/${project.slug}/entities`)}>
                                <span>+{typeEntities.length - 5} more...</span>
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )}
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <AlertDialog onOpenChange={setShowUnsavedDialog} open={showUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("unsaved_changes")}</AlertDialogTitle>
            <AlertDialogDescription>{t("unsaved_changes_message")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelNavigation}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation}>{t("confirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
