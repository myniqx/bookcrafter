"use client"
import React, { Usable, useEffect } from "react"

import { useCurrentBookStore, useCurrentProjectStore } from "@/lib/stores"
import { useProjectQuery } from "@/hooks/queries/use-project-query"

const BookLayout = ({ children, params }: {
  children: React.ReactNode,
  params: Usable<{ bookSlug: string }>
}) => {
  const { bookSlug } = React.use(params)
  const { setBook, setChapters } = useCurrentBookStore()
  const { metadata: project } = useCurrentProjectStore()
  const { data: fullProject } = useProjectQuery(project?.slug || '')

  // Initialize book data in store based on bookSlug
  useEffect(() => {
    if (fullProject && bookSlug) {
      // Find the book
      const book = fullProject.books.find(b => b.slug === bookSlug)
      if (book) {
        setBook(book)
        
        // Filter and set chapters for this book
        const bookChapters = fullProject.chapters.filter(ch => ch.bookSlug === bookSlug)
        setChapters(bookChapters)
      }
    }
  }, [fullProject, bookSlug, setBook, setChapters])

  return children
}

export default BookLayout
