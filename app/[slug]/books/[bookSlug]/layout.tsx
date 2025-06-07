"use client"
import React, { Usable } from "react"

import { BookProvider } from "@/providers/book-provider"


const BookLayout = ({ children, params }: {
  children: React.ReactNode,
  params: Usable<{ bookSlug: string }>
}) => {
  const { bookSlug } = React.use(params)

  return (
    <BookProvider bookSlug={bookSlug}>
      {children}
    </BookProvider>
  )
}

export default BookLayout
