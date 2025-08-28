"use client"
import React, { Usable } from "react"

// BookProvider removed - using stores and hooks instead

const BookLayout = ({ children, params }: {
  children: React.ReactNode,
  params: Usable<{ bookSlug: string }>
}) => {
  const { bookSlug } = React.use(params)

  // TODO: Initialize book data in store based on bookSlug
  console.log('Book layout for slug:', bookSlug)

  return children
}

export default BookLayout
