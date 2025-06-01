"use client"
import { BookProvider } from "@/providers/book-provider"
import React, { Usable } from "react"


export default ({ children, params }: {
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
