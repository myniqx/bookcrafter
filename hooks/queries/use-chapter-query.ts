import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { HybridFileAdapter } from '@/lib/file-adapters/hybrid-file-adapter'
import { BookMetadata, ChapterMetadata } from '@/lib/types/file-system'
import { Chapter, Project } from '@/lib/types'

const fileAdapter = new HybridFileAdapter()

export const useChapterContentQuery = (projectSlug: string, bookId: string, chapterId: string) => {
  return useQuery({
    queryKey: ['chapter-content', projectSlug, bookId, chapterId],
    queryFn: () => fileAdapter.loadChapter(projectSlug, bookId, chapterId),
    enabled: !!(projectSlug && bookId && chapterId),
    staleTime: Infinity, // Chapter content doesn't change unless we save it
  })
}

export const useSaveChapterMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      projectSlug, 
      bookId, 
      chapterId, 
      content 
    }: {
      projectSlug: string
      bookId: string
      chapterId: string
      content: string
    }) => fileAdapter.saveChapter(projectSlug, bookId, chapterId, content),
    
    onSuccess: (_, { projectSlug, bookId, chapterId, content }) => {
      // Update the chapter content cache
      queryClient.setQueryData(['chapter-content', projectSlug, bookId, chapterId], content)
    },
  })
}

export const useSaveBookMetadataMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      projectSlug, 
      bookId, 
      metadata 
    }: {
      projectSlug: string
      bookId: string
      metadata: BookMetadata
    }) => fileAdapter.saveBookMetadata(projectSlug, bookId, metadata),
    
    onSuccess: (_, { projectSlug, bookId }) => {
      // Invalidate project structure to refetch it
      queryClient.invalidateQueries({ queryKey: ['project-structure', projectSlug] })
    },
  })
}

// Debounced chapter save hook
export const useDebouncedChapterSave = (
  projectSlug: string,
  bookId: string,
  chapterId: string,
  delay: number = 2000
) => {
  const saveChapterMutation = useSaveChapterMutation()
  
  const debouncedSave = useCallback(
    debounce((content: string) => {
      saveChapterMutation.mutate({
        projectSlug,
        bookId,
        chapterId,
        content
      })
    }, delay),
    [projectSlug, bookId, chapterId, saveChapterMutation]
  )
  
  return {
    save: debouncedSave,
    isSaving: saveChapterMutation.isPending,
    error: saveChapterMutation.error
  }
}

export const useAddChapterMutation = (projectSlug: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (chapter: Chapter) => {
      // First create empty chapter content file
      const contentSuccess = await fileAdapter.saveChapter(
        projectSlug, 
        chapter.bookSlug || '', 
        chapter.slug, 
        chapter.content || ''
      )
      
      if (!contentSuccess) {
        throw new Error('Failed to create chapter content file')
      }
      
      // Then update the project with the new chapter
      const project = queryClient.getQueryData(['project', projectSlug]) as Project | undefined
      if (!project) {
        throw new Error('Project not found in cache')
      }
      
      const updatedProject: Project = {
        ...project,
        chapters: [...project.chapters, chapter]
      }
      
      const projectSuccess = await fileAdapter.saveProject(updatedProject)
      if (!projectSuccess) {
        throw new Error('Failed to save project with new chapter')
      }
      
      return chapter
    },
    
    onSuccess: (chapter) => {
      // Update the project query
      queryClient.setQueryData(['project', projectSlug], (oldProject: Project | undefined) => {
        if (!oldProject) return oldProject
        
        return {
          ...oldProject,
          chapters: [...oldProject.chapters, chapter]
        }
      })
      
      // Set initial chapter content in cache
      queryClient.setQueryData(
        ['chapter-content', projectSlug, chapter.bookSlug, chapter.slug], 
        chapter.content || ''
      )
    },
    
    onError: (error) => {
      console.error('Error adding chapter:', error)
    }
  })
}

export const useDeleteChapterMutation = (projectSlug: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (chapterSlug: string) => {
      const project = queryClient.getQueryData(['project', projectSlug]) as Project | undefined
      if (!project) throw new Error('Project not found')
      
      const chapterToDelete = project.chapters.find(c => c.slug === chapterSlug)
      if (!chapterToDelete) throw new Error('Chapter not found')
      
      // Remove chapter from project
      const updatedProject: Project = {
        ...project,
        chapters: project.chapters.filter(chapter => chapter.slug !== chapterSlug)
      }
      
      const success = await fileAdapter.saveProject(updatedProject)
      if (!success) {
        throw new Error('Failed to save project after chapter deletion')
      }
      
      return { chapterSlug, bookSlug: chapterToDelete.bookSlug }
    },
    
    onSuccess: ({ chapterSlug, bookSlug }) => {
      // Update the project query
      queryClient.setQueryData(['project', projectSlug], (oldProject: Project | undefined) => {
        if (!oldProject) return oldProject
        
        return {
          ...oldProject,
          chapters: oldProject.chapters.filter(chapter => chapter.slug !== chapterSlug)
        }
      })
      
      // Remove chapter content from cache
      queryClient.removeQueries({ 
        queryKey: ['chapter-content', projectSlug, bookSlug, chapterSlug] 
      })
    },
    
    onError: (error) => {
      console.error('Error deleting chapter:', error)
    }
  })
}

export const useUpdateChapterMutation = (projectSlug: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      chapterSlug, 
      updates 
    }: {
      chapterSlug: string
      updates: Partial<Chapter>
    }) => {
      // Get current chapter data from cache
      const project = queryClient.getQueryData(['project', projectSlug]) as Project | undefined
      const currentChapter = project?.chapters.find(c => c.slug === chapterSlug)
      
      if (!currentChapter) {
        throw new Error(`Chapter ${chapterSlug} not found`)
      }
      
      const updatedChapter: Chapter = {
        ...currentChapter,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      // If content is being updated, save it to file system
      if (updates.content !== undefined) {
        const contentSuccess = await fileAdapter.saveChapter(
          projectSlug,
          currentChapter.bookSlug || '',
          chapterSlug,
          updates.content
        )
        
        if (!contentSuccess) {
          throw new Error('Failed to save chapter content')
        }
      }
      
      return { chapterSlug, updates: { ...updates, updatedAt: updatedChapter.updatedAt } }
    },
    
    onSuccess: ({ chapterSlug, updates }) => {
      // Update the project query
      queryClient.setQueryData(['project', projectSlug], (oldProject: Project | undefined) => {
        if (!oldProject) return oldProject
        
        return {
          ...oldProject,
          chapters: oldProject.chapters.map(chapter =>
            chapter.slug === chapterSlug
              ? { ...chapter, ...updates }
              : chapter
          )
        }
      })
      
      // Update chapter content cache if content was updated
      if (updates.content !== undefined) {
        const chapter = oldProject?.chapters.find(c => c.slug === chapterSlug)
        if (chapter) {
          queryClient.setQueryData(
            ['chapter-content', projectSlug, chapter.bookSlug, chapterSlug], 
            updates.content
          )
        }
      }
    },
    
    onError: (error) => {
      console.error('Error updating chapter:', error)
    }
  })
}

// Debounced chapter metadata save hook (separate from content)
export const useDebouncedChapterMetadataSave = (
  projectSlug: string,
  chapterSlug: string,
  delay: number = 2000
) => {
  const updateChapterMutation = useUpdateChapterMutation(projectSlug)
  
  const debouncedSave = useCallback(
    debounce((updates: Partial<Chapter>) => {
      updateChapterMutation.mutate({
        chapterSlug,
        updates
      })
    }, delay),
    [projectSlug, chapterSlug, updateChapterMutation]
  )
  
  return {
    save: debouncedSave,
    isSaving: updateChapterMutation.isPending,
    error: updateChapterMutation.error
  }
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