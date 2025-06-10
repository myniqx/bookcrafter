"use client"
import { Button } from "@/components/ui/button";
import { Chapter } from "@/lib/types";
import { goToChapter } from "@/lib/utils/navigateTo";
import { BookOpen, StepBack } from "lucide-react";
import Link from "next/link";
import React, { createContext, useContext, useMemo } from "react";
import { BookContextType, useBook } from "./book-provider";


interface ChapterContextType extends
  Omit<BookContextType,
    | "updateChapter"
  > {
  chapter: Chapter
  updateChapter: (data: Partial<Chapter>) => void;
}

interface ChapterProviderProps {
  chapterSlug: string;
  children: React.ReactNode;
}

const ChapterContext = createContext<ChapterContextType | null>(null);

export function ChapterProvider({ chapterSlug, children }: ChapterProviderProps) {
  const {
    getChapter,
    updateChapter,
    ...rest
  } = useBook();

  const value = useMemo(
    () => {
      const chapter = getChapter(chapterSlug)!

      return {
        chapter,
        getChapter,
        updateChapter: (data: Partial<Chapter>) => updateChapter(chapterSlug, data),
      }
    },
    [getChapter, chapterSlug, updateChapter]
  );

  if (!value.chapter) {
    const link = goToChapter({ book: rest.book, project: rest.project })
    return (
      <div className="text-center p-28  rounded-lg bg-muted/20">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">Chapter (slug {chapterSlug}) not found</p>
        <Link href={link}>
          <Button>
            <StepBack className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <ChapterContext.Provider value={{ ...value, ...rest }}>
      {children}
    </ChapterContext.Provider>
  );
}

export function useChapter() {
  const context = useContext(ChapterContext);
  if (!context) {
    throw new Error("useChapter must be used within a ChapterProvider");
  }
  return context;
}
