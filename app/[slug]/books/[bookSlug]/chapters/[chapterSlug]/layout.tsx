import React from "react";
import { Usable } from "react";

import { ChapterProvider } from "@/providers/chapter-provider";


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

  return (
    <ChapterProvider chapterSlug={chapterSlug}>
      {children}
    </ChapterProvider>
  )
}

export default ChapterLayout
