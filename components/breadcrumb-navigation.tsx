"use client"
import React from "react"

import { ChevronRight, Home, Settings } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { goToBook, goToChapter, goToEntity, goToProject } from "@/lib/utils/navigateTo"
import { useProject } from "@/providers/project-provider"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[]
  projectId: string
}

export function BreadcrumbNavigation() {
  const { getBook, getChapter, getEntity, project, saveProject } = useProject()
  const { bookSlug, chapterSlug, entitySlug } = useParams()
  const book = bookSlug && getBook(bookSlug as string)
  const chapter = bookSlug && chapterSlug && getChapter(bookSlug as string, chapterSlug as string)
  const entity = getEntity(entitySlug as string)

  const items: BreadcrumbItem[] = [{
    href: goToProject({ project }),
    label: project.name
  }]

  if (book) {
    items.push({
      href: goToBook({ book, project }),
      label: book.title
    })

    if (chapter) {
      items.push({
        href: goToChapter({ book, chapter, project }),
        label: chapter.title
      })
    }
  } else if (entity) {
    items.push({
      href: goToEntity({ entity, project }),
      label: entity.name
    })
  }


  return (
    <div className="flex items-center justify-between w-full px-4 py-2 border-b">
      <div className="flex items-center">
        <Link href={goToProject({ project })}>
          <Button className="h-8 w-8" size="icon" variant="ghost">
            <Home className="h-4 w-4" />
          </Button>
        </Link>

        {items.map((item, index) => (
          <div className="flex items-center" key={index}>
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
            {item.href ? (
              <Link className="text-sm hover:underline" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </div>

      <Button className="h-8 w-8" size="icon" variant="ghost">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )
}
