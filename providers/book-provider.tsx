"use client"
import { Button } from "@/components/ui/button";
import { Book, Chapter, Project } from "@/lib/types";
import { BookOpen, StepBack } from "lucide-react";
import Link from "next/link";
import { createContext, useMemo } from "react";
import { useProject } from "./project-provider";



interface BookContextType {
  project: Project
  book: Book
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
    project,
    getBook,
    updateBook,
    getChapter,
    updateChapter,
    addChapter,
    hasUnsavedChanges
  } = useProject();

  const value = useMemo(
    () => ({
      project,
      book: getBook(bookSlug)!,
      updateBook: (data: Partial<Book>) => updateBook(bookSlug, data),
      getChapter: (chapterSlug: string) => getChapter(bookSlug, chapterSlug),
      addChapter: (chapter: Chapter) => addChapter(bookSlug, chapter),
      updateChapter: (chapterSlug: string, data: Partial<Chapter>) => updateChapter(bookSlug, chapterSlug, data),
      hasUnsavedChanges
    }),
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
