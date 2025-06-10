"use client"
import { Button } from "@/components/ui/button";
import { Book, Chapter, ProjectContextType } from "@/lib/types";
import { BookOpen, StepBack } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useMemo } from "react";
import { useProject } from "./project-provider";
import { goToBook } from "@/lib/utils/navigateTo";



export type BookContextType =
  Omit<ProjectContextType,
    | 'updateBook'
    | 'getChapter'
    | 'addChapter'
    | 'chapters'
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
    chapters: allChapters,
    getBook,
    getChapter,
    updateBook,
    updateChapter,
    ...rest
  } = useProject();

  const value = useMemo(
    () => {
      const book = getBook(bookSlug)!;
      const chapters = allChapters.filter((chapter) => chapter.bookSlug === bookSlug) || [];

      return {
        addChapter: (chapter: Chapter) => addChapter({ ...chapter, bookSlug }),
        book,
        chapters,
        getBook,
        getChapter: (chapterSlug: string) => getChapter(bookSlug, chapterSlug),
        updateBook: (data: Partial<Book>) => updateBook(bookSlug, data),
        updateChapter: (chapterSlug: string, data: Partial<Chapter>) => updateChapter(bookSlug, chapterSlug, data),
      }
    },
    [getBook, bookSlug, allChapters, addChapter, getChapter, updateBook, updateChapter]
  );

  if (!value.book) {
    return (
      <div className="text-center p-28  rounded-lg bg-muted/20">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">Book not found</p>
        <Link href={goToBook({ project: rest.project })}>
          <Button>
            <StepBack className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <BookContext.Provider value={{ ...value, ...rest }}>
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
