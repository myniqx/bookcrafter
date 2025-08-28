import { useCallback } from 'react'
import { Book } from '@/lib/types'
import { useCurrentBookStore } from '@/lib/stores'
import { useAddBookMutation, useUpdateBookMutation, useDeleteBookMutation } from './queries/use-book-query'

/**
 * Custom hook that combines Zustand store actions with React Query mutations
 * for seamless book management with automatic persistence
 */
export function useBookActions(projectSlug: string) {
  // Store actions
  const { setBook, updateBook, setError, setLoading } = useCurrentBookStore()
  
  // Mutations
  const addBookMutation = useAddBookMutation(projectSlug)
  const updateBookMutation = useUpdateBookMutation(projectSlug) 
  const deleteBookMutation = useDeleteBookMutation(projectSlug)

  // Combined add book action
  const addBookWithPersistence = useCallback(async (book: Book) => {
    try {
      setLoading(true)
      setError(null)
      
      // Persist to file system first (no optimistic update for book creation)
      await addBookMutation.mutateAsync(book)
      
      // Update current book store if this is the active book
      setBook(book)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add book')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setBook, addBookMutation, setError, setLoading])

  // Combined update book action
  const updateBookWithPersistence = useCallback(async (bookSlug: string, updates: Partial<Book>) => {
    try {
      setLoading(true)
      setError(null)
      
      // Optimistically update store first
      updateBook(updates)
      
      // Then persist to file system
      await updateBookMutation.mutateAsync({ bookSlug, updates })
      
    } catch (error) {
      // On failure, the mutation will handle reverting the cache
      setError(error instanceof Error ? error.message : 'Failed to update book')
      throw error
    } finally {
      setLoading(false)
    }
  }, [updateBook, updateBookMutation, setError, setLoading])

  // Combined delete book action
  const deleteBookWithPersistence = useCallback(async (bookSlug: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Persist deletion to file system
      await deleteBookMutation.mutateAsync(bookSlug)
      
      // Note: Store will be reset when navigating away from book route
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete book')
      throw error
    } finally {
      setLoading(false)
    }
  }, [deleteBookMutation, setError, setLoading])

  return {
    addBook: addBookWithPersistence,
    updateBook: updateBookWithPersistence,
    deleteBook: deleteBookWithPersistence,
    
    // Loading states
    isAdding: addBookMutation.isPending,
    isUpdating: updateBookMutation.isPending,
    isDeleting: deleteBookMutation.isPending,
    
    // Error states
    addError: addBookMutation.error,
    updateError: updateBookMutation.error,
    deleteError: deleteBookMutation.error
  }
}