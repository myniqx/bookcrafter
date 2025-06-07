"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { Book, Chapter, Entity, Project } from "@/lib/types";
import { goToChapter } from "@/lib/utils/navigateTo";
import { BookOpen, StepBack } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useMemo } from "react";
import { useBook } from "./book-provider";


interface ChapterContextType {
  project: Project
  book: Book
  chapter: Chapter
  entities: Entity[] | undefined
  updateChapter: (data: Partial<Chapter>) => void;
  hasUnsavedChanges: boolean;
}

interface ChapterProviderProps {
  chapterSlug: string;
  children: React.ReactNode;
}

const ChapterContext = createContext<ChapterContextType | null>(null);

export function ChapterProvider({ chapterSlug, children }: ChapterProviderProps) {
  const {
    book,
    getChapter,
    hasUnsavedChanges,
    project,
    updateChapter
  } = useBook();

  const value = useMemo(
    () => {
      const chapter = getChapter(chapterSlug)!

      const entities = project.entities && project.entities.length > 0
        ? project.entities
        : undefined

      return {
        book,
        chapter,
        entities,
        hasUnsavedChanges,
        project,
        updateChapter: (data: Partial<Chapter>) => updateChapter(chapterSlug, data)
      }
    },
    [getChapter, chapterSlug, project, book, hasUnsavedChanges, updateChapter]
  );

  if (!value.chapter) {
    const link = goToChapter({  book, project })
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
    <ChapterContext.Provider value={value}>
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
