import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { HybridFileAdapter } from '@/lib/file-adapters/hybrid-file-adapter'
import { Book, Chapter, Project } from '@/lib/types'
import { BookMetadata } from '@/lib/types/file-system'

const fileAdapter = new HybridFileAdapter()

// Convert Book to BookMetadata for file system
const bookToMetadata = (book: Book): BookMetadata => ({
  slug: book.slug,
  title: book.title,
  description: book.description,
  status: book.status,
  coverImageId: book.coverImageId,
  createdAt: book.createdAt,
  updatedAt: book.updatedAt
})

export const useBookWithChaptersQuery = (projectSlug: string, bookSlug: string) => {
  return useQuery({
    queryKey: ['book-with-chapters', projectSlug, bookSlug],
    queryFn: async () => {
      const project = await fileAdapter.loadProject(projectSlug)
      if (!project) return null
      
      const book = project.books.find(b => b.slug === bookSlug)
      const chapters = project.chapters.filter(c => c.bookSlug === bookSlug)
      
      return book ? { book, chapters } : null
    },
    enabled: !!(projectSlug && bookSlug),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useAddBookMutation = (projectSlug: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (book: Book) => {
      // First save book metadata to file system
      const metadata = bookToMetadata(book)
      const metadataSuccess = await fileAdapter.saveBookMetadata(projectSlug, book.slug, metadata)
      
      if (!metadataSuccess) {
        throw new Error('Failed to save book metadata')
      }
      
      // Then update the project with the new book
      const project = queryClient.getQueryData(['project', projectSlug]) as Project | undefined
      if (!project) {
        throw new Error('Project not found in cache')
      }
      
      const updatedProject: Project = {
        ...project,
        books: [...project.books, book]
      }
      
      const projectSuccess = await fileAdapter.saveProject(updatedProject)
      if (!projectSuccess) {
        throw new Error('Failed to save project')
      }
      
      return book
    },
    
    onSuccess: (book) => {
      // Update the project query
      queryClient.setQueryData(['project', projectSlug], (oldProject: Project | undefined) => {
        if (!oldProject) return oldProject
        
        return {
          ...oldProject,
          books: [...oldProject.books, book]
        }
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['book-with-chapters', projectSlug] })
    },
    
    onError: (error) => {
      console.error('Error adding book:', error)
    }
  })
}

export const useUpdateBookMutation = (projectSlug: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      bookSlug, 
      updates 
    }: {
      bookSlug: string
      updates: Partial<Book>
    }) => {
      // Get current book data from cache
      const project = queryClient.getQueryData(['project', projectSlug]) as Project | undefined
      const currentBook = project?.books.find(b => b.slug === bookSlug)
      
      if (!currentBook) {
        throw new Error(`Book ${bookSlug} not found`)
      }
      
      const updatedBook: Book = {
        ...currentBook,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      // Save book metadata to file system
      const metadata = bookToMetadata(updatedBook)
      const success = await fileAdapter.saveBookMetadata(projectSlug, bookSlug, metadata)
      
      if (!success) {
        throw new Error('Failed to save book metadata')
      }
      
      return { bookSlug, updates: { ...updates, updatedAt: updatedBook.updatedAt } }
    },
    
    onSuccess: ({ bookSlug, updates }) => {
      // Update the project query
      queryClient.setQueryData(['project', projectSlug], (oldProject: Project | undefined) => {
        if (!oldProject) return oldProject
        
        return {
          ...oldProject,
          books: oldProject.books.map(book =>
            book.slug === bookSlug
              ? { ...book, ...updates }
              : book
          )
        }
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['book-with-chapters', projectSlug, bookSlug] })
    },
    
    onError: (error) => {
      console.error('Error updating book:', error)
    }
  })
}

export const useDeleteBookMutation = (projectSlug: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (bookSlug: string) => {
      const project = queryClient.getQueryData(['project', projectSlug]) as Project | undefined
      if (!project) throw new Error('Project not found')
      
      // Remove book and all its chapters
      const updatedProject: Project = {
        ...project,
        books: project.books.filter(book => book.slug !== bookSlug),
        chapters: project.chapters.filter(chapter => chapter.bookSlug !== bookSlug)
      }
      
      const success = await fileAdapter.saveProject(updatedProject)
      if (!success) {
        throw new Error('Failed to save project after book deletion')
      }
      
      return bookSlug
    },
    
    onSuccess: (bookSlug) => {
      // Update the project query
      queryClient.setQueryData(['project', projectSlug], (oldProject: Project | undefined) => {
        if (!oldProject) return oldProject
        
        return {
          ...oldProject,
          books: oldProject.books.filter(book => book.slug !== bookSlug),
          chapters: oldProject.chapters.filter(chapter => chapter.bookSlug !== bookSlug)
        }
      })
      
      // Remove related queries from cache
      queryClient.removeQueries({ queryKey: ['book-with-chapters', projectSlug, bookSlug] })
      
      // Invalidate chapter content queries for this book
      const chapters = queryClient.getQueryData(['project', projectSlug]) as Project | undefined
      chapters?.chapters.forEach(chapter => {
        if (chapter.bookSlug === bookSlug) {
          queryClient.removeQueries({ 
            queryKey: ['chapter-content', projectSlug, bookSlug, chapter.slug] 
          })
        }
      })
    },
    
    onError: (error) => {
      console.error('Error deleting book:', error)
    }
  })
}

// Debounced book save hook for autosave functionality
export const useDebouncedBookSave = (
  projectSlug: string,
  bookSlug: string,
  delay: number = 2000
) => {
  const updateBookMutation = useUpdateBookMutation(projectSlug)
  
  const debouncedSave = useCallback(
    debounce((updates: Partial<Book>) => {
      updateBookMutation.mutate({
        bookSlug,
        updates
      })
    }, delay),
    [projectSlug, bookSlug, updateBookMutation]
  )
  
  return {
    save: debouncedSave,
    isSaving: updateBookMutation.isPending,
    error: updateBookMutation.error
  }
}

// Get book chapters query
export const useBookChaptersQuery = (projectSlug: string, bookSlug: string) => {
  return useQuery({
    queryKey: ['book-chapters', projectSlug, bookSlug],
    queryFn: async () => {
      const project = await fileAdapter.loadProject(projectSlug)
      return project?.chapters.filter(chapter => chapter.bookSlug === bookSlug) || []
    },
    enabled: !!(projectSlug && bookSlug),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}