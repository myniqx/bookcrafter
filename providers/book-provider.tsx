"use client"
import { Button } from "@/components/ui/button";
import { Book, Chapter } from "@/lib/types";
import { BookOpen, StepBack } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useMemo } from "react";
import { ProjectContextType, useProject } from "./project-provider";



export type BookContextType =
  Omit<ProjectContextType,
    | 'updateBook'
    | 'getChapter'
    | 'addChapter'
  >
  & {
    book: Book
    chapters: Chapter[]
    updateBook: (data: Partial<Book>) => void;
    getChapter: (chapterSlug: string) => Chapter | null;
    addChapter: (chapter: Chapter) => Chapter | undefined;
    updateChapter: (chapterSlug: string, data: Partial<Chapter>) => void;
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
    project,
    updateBook,
    updateChapter,
    ...rest
  } = useProject();

  const value = useMemo(
    (): BookContextType => {
      const book = getBook(bookSlug)!;
      const chapters = book.chapters || []

      return {
        addChapter: (chapter: Chapter) => addChapter(bookSlug, chapter),
        book,
        chapters,
        getBook,
        getChapter: (chapterSlug: string) => getChapter(bookSlug, chapterSlug),
        project,
        updateBook: (data: Partial<Book>) => updateBook(bookSlug, data),
        updateChapter: (chapterSlug: string, data: Partial<Chapter>) => updateChapter(bookSlug, chapterSlug, data),
        ...rest
      }
    },
    [getBook, bookSlug, project, rest, addChapter, getChapter, updateBook, updateChapter]
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
