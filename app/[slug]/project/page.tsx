"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  Activity,
  BarChart3,
  BookOpen, 
  Calendar,
  Clock,
  FileText, 
  Plus, 
  Users
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentProjectStore } from "@/lib/stores"
import { useProjectQuery } from "@/hooks/queries/use-project-query"
import { formatDate } from "@/lib/utils"
import { CreateEntityForm } from "@/components/create-entity-form"

export default function ProjectDashboard() {
  const { slug } = useParams()
  const projectSlug = Array.isArray(slug) ? slug[0] : slug
  
  const { metadata: project } = useCurrentProjectStore()
  const { data: fullProject, isLoading } = useProjectQuery(projectSlug || '')
  
  const [showCreateEntity, setShowCreateEntity] = useState(false)

  const books = fullProject?.books || []
  const chapters = fullProject?.chapters || []
  const entities = fullProject?.entities || []
  
  // Calculate statistics
  const stats = {
    totalBooks: books.length,
    totalChapters: chapters.length,
    totalEntities: entities.length,
    totalWords: chapters.reduce((sum, chapter) => sum + (chapter.content?.length || 0), 0),
    recentActivity: [
      ...books.map(book => ({ type: 'book', item: book, date: book.updatedAt })),
      ...chapters.map(chapter => ({ type: 'chapter', item: chapter, date: chapter.updatedAt })),
      ...entities.map(entity => ({ type: 'entity', item: entity, date: entity.updatedAt }))
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }

  const entityTypes = [
    { type: "character", count: entities.filter(e => e.type === "character").length, icon: Users },
    { type: "location", count: entities.filter(e => e.type === "location").length, icon: BookOpen },
    { type: "item", count: entities.filter(e => e.type === "item").length, icon: FileText },
    { type: "event", count: entities.filter(e => e.type === "event").length, icon: Calendar },
  ]

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header Section */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4 flex-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {project?.name?.charAt(0)?.toUpperCase() || 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold">{project?.name || 'Project'}</h1>
              <p className="text-sm text-muted-foreground">{project?.description || 'No description'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreateEntity(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Entity
            </Button>
            <Link href={`/${projectSlug}/books`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Book
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBooks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalChapters} chapters total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chapters</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChapters}</div>
              <p className="text-xs text-muted-foreground">
                ~{Math.round(stats.totalWords / 250)} pages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entities</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntities}</div>
              <p className="text-xs text-muted-foreground">
                Characters, locations & more
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Words</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all chapters
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Books */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Books</CardTitle>
              <Link href={`/${projectSlug}/books`}>
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {books.length > 0 ? (
                <div className="space-y-3">
                  {books.slice(0, 3).map(book => (
                    <Link 
                      key={book.slug}
                      href={`/${projectSlug}/books/${book.slug}`}
                      className="block"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{book.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {chapters.filter(c => c.bookSlug === book.slug).length} chapters
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(book.updatedAt)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-3">No books yet</p>
                  <Link href={`/${projectSlug}/books`}>
                    <Button size="sm">
                      Create First Book
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entity Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Entity Overview</CardTitle>
              <Link href={`/${projectSlug}/entities`}>
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {entities.length > 0 ? (
                <div className="space-y-4">
                  {entityTypes.map(({ type, count, icon: Icon }) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium capitalize">{type}s</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-2 gap-3">
                      {entities.slice(0, 4).map(entity => (
                        <Link 
                          key={entity.slug}
                          href={`/${projectSlug}/entities/${entity.slug}`}
                          className="block"
                        >
                          <div className="p-2 rounded border hover:bg-accent/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">{entity.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {entity.type.charAt(0).toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-3">No entities yet</p>
                  <Button size="sm" onClick={() => setShowCreateEntity(true)}>
                    Create First Entity
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => {
                    const item = activity.item as any
                    return (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/30">
                        <div className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm">
                            {activity.type === 'book' && (
                              <>Updated book <span className="font-medium">{item.title}</span></>
                            )}
                            {activity.type === 'chapter' && (
                              <>Updated chapter <span className="font-medium">{item.title}</span></>
                            )}
                            {activity.type === 'entity' && (
                              <>Updated {item.type} <span className="font-medium">{item.name}</span></>
                            )}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(activity.date)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Entity Dialog */}
      {showCreateEntity && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Entity</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateEntityForm
                entityType="character"
                onCancel={() => setShowCreateEntity(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}