import React from "react";
import { Usable } from "react";

// ChapterProvider removed - using stores and hooks instead

const ChapterLayout = (
  {
    children,
    params
  }: {
    params: Usable<{ chapterSlug: string }>
    children: React.ReactNode
  }

) => {
  const { chapterSlug } = React.use(params)

  // TODO: Initialize chapter data in store based on chapterSlug
  console.log('Chapter layout for slug:', chapterSlug)

  return children
}

export default ChapterLayout
