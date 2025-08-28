import { create } from 'zustand'
import { Chapter } from '../types'

interface CurrentChapterStore {
  // State - chapter is never null when [chapterSlug] route is active
  chapter: Chapter
  content: string
  originalContent: string
  hasUnsavedChanges: boolean
  isSaving: boolean
  lastSaveTime: string | null
  error: string | null

  // Actions
  setChapter: (chapter: Chapter) => void
  setContent: (content: string) => void
  updateChapter: (updates: Partial<Chapter>) => void
  setSaving: (isSaving: boolean) => void
  setLastSaveTime: (time: string) => void
  setError: (error: string | null) => void

  // Content operations
  markContentAsSaved: () => void
}

// Store must be initialized with chapter - no null state allowed when [chapterSlug] is active  
export const useCurrentChapterStore = create<CurrentChapterStore>((set, get) => ({
  // Initial state - chapter will be set immediately on route load
  chapter: {} as Chapter, // Will be set immediately when [chapterSlug] route loads
  content: '',
  originalContent: '',
  hasUnsavedChanges: false,
  isSaving: false,
  lastSaveTime: null,
  error: null,

  // Actions
  setChapter: (chapter) => {
    const content = chapter.content || ''
    set({
      chapter,
      content,
      error: null,
      hasUnsavedChanges: false,
      originalContent: content
    })
  },

  setContent: (content) => {
    const state = get()
    set({
      content,
      hasUnsavedChanges: content !== state.originalContent
    })
  },

  setError: (error) => set({ error }),
  setLastSaveTime: (time) => set({ lastSaveTime: time }),
  setSaving: (isSaving) => set({ isSaving }),

  // Content operations
  markContentAsSaved: () => set((state) => ({
    hasUnsavedChanges: false,
    lastSaveTime: new Date().toISOString(),
    originalContent: state.content
  })),

  updateChapter: (updates) => set((state) => ({
    chapter: {
      ...state.chapter,
      ...updates,
      updatedAt: new Date().toISOString()
    }
  }))
}))
