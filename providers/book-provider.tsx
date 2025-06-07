"use client"
import { Button } from "@/components/ui/button";
import { Book, Chapter, Entity, Project } from "@/lib/types";
import { BookOpen, StepBack } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useMemo } from "react";
import { useProject } from "./project-provider";
import { goToChapter } from "@/lib/utils/navigateTo";

interface ChapterWithHref extends Chapter {
  href: string;
}


interface BookContextType {
  project: Project
  book: Book
  chapters: ChapterWithHref[] | undefined
  entities: Entity[] | undefined
  updateBook: (data: Partial<Book>) => void;
  getChapter: (chapterSlug: string) => Chapter | null;
  addChapter: (chapter: Chapter) => Chapter | undefined;
  updateChapter: (chapterSlug: string, data: Partial<Chapter>) => void;
  hasUnsavedChanges: boolean;
}

interface BookProviderProps {
  bookSlug: string;
  children: React.ReactNode;
}

const BookContext = createContext<BookContextType | null>(null);

export function BookProvider({ bookSlug, children }: BookProviderProps) {
  const {
    addChapter,
    getBook,
    getChapter,
    hasUnsavedChanges,
    project,
    updateBook,
    updateChapter
  } = useProject();

  const value = useMemo(
    () => {
      const book = getBook(bookSlug)!;
      const chapters =
        book.chapters && book.chapters.length > 0
          ? book.chapters.map((chapter) => ({
            ...chapter,
            href: goToChapter({ book, chapter, project })
          }))
          : undefined

      const entities = project.entities && project.entities.length > 0
        ? project.entities
        : undefined

      return {
        addChapter: (chapter: Chapter) => addChapter(bookSlug, chapter),
        book,
        chapters,
        entities,
        getChapter: (chapterSlug: string) => getChapter(bookSlug, chapterSlug),
        hasUnsavedChanges,
        project,
        updateBook: (data: Partial<Book>) => updateBook(bookSlug, data),
        updateChapter: (chapterSlug: string, data: Partial<Chapter>) => updateChapter(bookSlug, chapterSlug, data)
      }
    },
    [
      project,
      bookSlug,
      getBook,
      updateBook,
      getChapter,
      updateChapter,
      addChapter,
      hasUnsavedChanges
    ]
  );

  if (!value.book) {
    return (
      <div className="text-center p-28  rounded-lg bg-muted/20">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">Book not found</p>
        <Link href={`/${project.slug}/book`}>
          <Button>
            <StepBack className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
}

export function useBook() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBook must be used within a BookProvider");
  }
  return context;
}
