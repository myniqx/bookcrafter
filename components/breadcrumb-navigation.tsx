"use client"
import React from "react"

import { ChevronRight, Home, Settings } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { goToBook, goToChapter, goToEntity, goToProject } from "@/lib/utils/navigateTo"
import { useCurrentProjectStore, useCurrentBookStore, useEntitiesStore } from "@/lib/stores"

interface BreadcrumbItem {
  label: string
  href?: string
}


export function BreadcrumbNavigation() {
  const { metadata: project } = useCurrentProjectStore()
  const { book, getChapter } = useCurrentBookStore()
  const { getEntity } = useEntitiesStore()
  const { bookSlug, chapterSlug, entitySlug } = useParams()
  
  const chapter = bookSlug && chapterSlug && getChapter(chapterSlug as string)
  const entity = entitySlug && getEntity(entitySlug as string)

  if (!project) {
    return null
  }

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
    <div className="flex items-center justify-between w-full px-4 py-2">
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
