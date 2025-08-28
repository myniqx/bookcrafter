import { useCallback } from 'react'
import { Chapter } from '@/lib/types'
import { useCurrentBookStore, useCurrentChapterStore } from '@/lib/stores'
import { useAddChapterMutation, useDeleteChapterMutation, useUpdateChapterMutation } from './queries/use-chapter-query'

/**
 * Custom hook that combines Zustand store actions with React Query mutations
 * for seamless chapter management with automatic persistence
 */
export function useChapterActions(projectSlug: string) {
  // Store actions
  const { addChapter, updateChapter, removeChapter, setLoading: setBookLoading, setError: setBookError } = useCurrentBookStore()
  const { setChapter, updateChapter: updateCurrentChapter, setError: setChapterError } = useCurrentChapterStore()
  
  // Mutations
  const addChapterMutation = useAddChapterMutation(projectSlug)
  const updateChapterMutation = useUpdateChapterMutation(projectSlug)
  const deleteChapterMutation = useDeleteChapterMutation(projectSlug)

  // Combined add chapter action
  const addChapterWithPersistence = useCallback(async (chapter: Chapter) => {
    try {
      setBookLoading(true)
      setBookError(null)
      
      // Optimistically add to book chapters list
      addChapter(chapter)
      
      // Persist to file system
      await addChapterMutation.mutateAsync(chapter)
      
    } catch (error) {
      // Revert optimistic update on failure
      removeChapter(chapter.slug)
      setBookError(error instanceof Error ? error.message : 'Failed to add chapter')
      throw error
    } finally {
      setBookLoading(false)
    }
  }, [addChapter, removeChapter, addChapterMutation, setBookError, setBookLoading])

  // Combined update chapter action (for metadata)
  const updateChapterWithPersistence = useCallback(async (chapterSlug: string, updates: Partial<Chapter>) => {
    try {
      setBookLoading(true)
      setBookError(null)
      
      // Update both book chapters list and current chapter if it matches
      updateChapter(chapterSlug, updates)
      
      // If this is the current chapter, also update current chapter store
      const currentChapter = useCurrentChapterStore.getState().chapter
      if (currentChapter.slug === chapterSlug) {
        updateCurrentChapter(updates)
      }
      
      // Persist to file system
      await updateChapterMutation.mutateAsync({ chapterSlug, updates })
      
    } catch (error) {
      // On failure, the mutation will handle reverting the cache
      setBookError(error instanceof Error ? error.message : 'Failed to update chapter')
      throw error
    } finally {
      setBookLoading(false)
    }
  }, [updateChapter, updateCurrentChapter, updateChapterMutation, setBookError, setBookLoading])

  // Combined delete chapter action
  const deleteChapterWithPersistence = useCallback(async (chapterSlug: string) => {
    try {
      setBookLoading(true)
      setBookError(null)
      
      // Store the chapter data before removing (for rollback)
      const chapters = useCurrentBookStore.getState().chapters
      const chapterToDelete = chapters.find(c => c.slug === chapterSlug)
      
      // Optimistically remove from store
      removeChapter(chapterSlug)
      
      // Persist deletion to file system
      await deleteChapterMutation.mutateAsync(chapterSlug)
      
    } catch (error) {
      // Revert optimistic delete on failure
      if (chapterToDelete) {
        addChapter(chapterToDelete)
      }
      setBookError(error instanceof Error ? error.message : 'Failed to delete chapter')
      throw error
    } finally {
      setBookLoading(false)
    }
  }, [removeChapter, addChapter, deleteChapterMutation, setBookError, setBookLoading])

  return {
    addChapter: addChapterWithPersistence,
    updateChapter: updateChapterWithPersistence,
    deleteChapter: deleteChapterWithPersistence,
    
    // Loading states
    isAdding: addChapterMutation.isPending,
    isUpdating: updateChapterMutation.isPending,
    isDeleting: deleteChapterMutation.isPending,
    
    // Error states
    addError: addChapterMutation.error,
    updateError: updateChapterMutation.error,
    deleteError: deleteChapterMutation.error
  }
}