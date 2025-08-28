import { create } from 'zustand'
import { Book, Chapter } from '../types'

interface CurrentBookStore {
  // State - book is never null when [bookSlug] route is active
  book: Book
  chapters: Chapter[]
  loading: boolean
  error: string | null

  // Actions
  setBook: (book: Book) => void
  updateBook: (updates: Partial<Book>) => void
  setChapters: (chapters: Chapter[]) => void
  addChapter: (chapter: Chapter) => void
  updateChapter: (chapterSlug: string, updates: Partial<Chapter>) => void
  removeChapter: (chapterSlug: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Getters
  getChapter: (chapterSlug: string) => Chapter | null
}

// Store must be initialized with book - no null state allowed when [bookSlug] is active
export const useCurrentBookStore = create<CurrentBookStore>((set, get) => ({
  // Initial state - book will be set immediately on route load
  book: {} as Book, // Will be set immediately when [bookSlug] route loads
  chapters: [],
  error: null,
  loading: false,

  // Actions
  setBook: (book) => set({ book, error: null }),
  setChapters: (chapters) => set({ chapters }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  // Getters
  getChapter: (chapterSlug) => {
    const state = get()
    return state.chapters.find(chapter => chapter.slug === chapterSlug) || null
  },

  addChapter: (chapter) => set((state) => ({
    chapters: [...state.chapters, chapter]
  })),

  removeChapter: (chapterSlug) => set((state) => ({
    chapters: state.chapters.filter(chapter => chapter.slug !== chapterSlug)
  })),

  updateBook: (updates) => set((state) => ({
    book: {
      ...state.book,
      ...updates,
      updatedAt: new Date().toISOString()
    }
  })),

  updateChapter: (chapterSlug, updates) => set((state) => ({
    chapters: state.chapters.map(chapter =>
      chapter.slug === chapterSlug
        ? { ...chapter, ...updates, updatedAt: new Date().toISOString() }
        : chapter
    )
  }))
}))
