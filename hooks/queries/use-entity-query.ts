import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { HybridFileAdapter } from '@/lib/file-adapters/hybrid-file-adapter'
import { Entity, Project } from '@/lib/types'
import { EntityMetadata } from '@/lib/types/file-system'

const fileAdapter = new HybridFileAdapter()

// Convert Entity to EntityMetadata for file system
const entityToMetadata = (entity: Entity): EntityMetadata => ({
  slug: entity.slug,
  name: entity.name,
  type: entity.type,
  description: entity.description,
  properties: entity.properties,
  notes: entity.notes,
  imageIds: entity.imageIds,
  usages: entity.usages,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt
})

export const useAddEntityMutation = (projectSlug: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (entity: Entity) => {
      const metadata = entityToMetadata(entity)
      return fileAdapter.saveEntityMetadata(projectSlug, entity.slug, metadata)
    },
    
    onSuccess: (success, entity) => {
      if (success) {
        // Update the project query to include new entity
        queryClient.setQueryData(['project', projectSlug], (oldProject: Project | undefined) => {
          if (!oldProject) return oldProject
          
          return {
            ...oldProject,
            entities: [...oldProject.entities, entity]
          }
        })
        
        // Invalidate entities list
        queryClient.invalidateQueries({ queryKey: ['entities', projectSlug] })
      }
    },
    
    onError: (error) => {
      console.error('Error adding entity:', error)
    }
  })
}

export const useUpdateEntityMutation = (projectSlug: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      entitySlug, 
      updates 
    }: {
      entitySlug: string
      updates: Partial<Entity>
    }) => {
      // Get current entity data from cache to merge with updates
      const project = queryClient.getQueryData(['project', projectSlug]) as Project | undefined
      const currentEntity = project?.entities.find(e => e.slug === entitySlug)
      
      if (!currentEntity) {
        throw new Error(`Entity ${entitySlug} not found`)
      }
      
      const updatedEntity: Entity = {
        ...currentEntity,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      const metadata = entityToMetadata(updatedEntity)
      return fileAdapter.saveEntityMetadata(projectSlug, entitySlug, metadata)
    },
    
    onSuccess: (success, { entitySlug, updates }) => {
      if (success) {
        // Update the project query
        queryClient.setQueryData(['project', projectSlug], (oldProject: Project | undefined) => {
          if (!oldProject) return oldProject
          
          return {
            ...oldProject,
            entities: oldProject.entities.map(entity =>
              entity.slug === entitySlug
                ? { ...entity, ...updates, updatedAt: new Date().toISOString() }
                : entity
            )
          }
        })
        
        // Invalidate entities list
        queryClient.invalidateQueries({ queryKey: ['entities', projectSlug] })
      }
    },
    
    onError: (error) => {
      console.error('Error updating entity:', error)
    }
  })
}

export const useDeleteEntityMutation = (projectSlug: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (entitySlug: string) => {
      // Note: File adapter doesn't have delete entity method yet
      // For now, we'll just remove from project and re-save
      const project = queryClient.getQueryData(['project', projectSlug]) as Project | undefined
      if (!project) throw new Error('Project not found')
      
      const updatedProject: Project = {
        ...project,
        entities: project.entities.filter(entity => entity.slug !== entitySlug)
      }
      
      return fileAdapter.saveProject(updatedProject)
    },
    
    onSuccess: (success, entitySlug) => {
      if (success) {
        // Update the project query
        queryClient.setQueryData(['project', projectSlug], (oldProject: Project | undefined) => {
          if (!oldProject) return oldProject
          
          return {
            ...oldProject,
            entities: oldProject.entities.filter(entity => entity.slug !== entitySlug)
          }
        })
        
        // Invalidate entities list
        queryClient.invalidateQueries({ queryKey: ['entities', projectSlug] })
      }
    },
    
    onError: (error) => {
      console.error('Error deleting entity:', error)
    }
  })
}

// Debounced entity save hook for autosave functionality
export const useDebouncedEntitySave = (
  projectSlug: string,
  entitySlug: string,
  delay: number = 2000
) => {
  const updateEntityMutation = useUpdateEntityMutation(projectSlug)
  
  const debouncedSave = useCallback(
    debounce((updates: Partial<Entity>) => {
      updateEntityMutation.mutate({
        entitySlug,
        updates
      })
    }, delay),
    [projectSlug, entitySlug, updateEntityMutation]
  )
  
  return {
    save: debouncedSave,
    isSaving: updateEntityMutation.isPending,
    error: updateEntityMutation.error
  }
}

// Utility: Get entities by type from project
export const useEntitiesByType = (projectSlug: string, type: Entity['type']) => {
  return useQuery({
    queryKey: ['entities', projectSlug, type],
    queryFn: async () => {
      const project = await fileAdapter.loadProject(projectSlug)
      return project?.entities.filter(entity => entity.type === type) || []
    },
    enabled: !!(projectSlug && type),
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