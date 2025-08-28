import { useCallback } from 'react'
import { Entity } from '@/lib/types'
import { useEntitiesStore } from '@/lib/stores'
import { useAddEntityMutation, useUpdateEntityMutation, useDeleteEntityMutation } from './queries/use-entity-query'

/**
 * Custom hook that combines Zustand store actions with React Query mutations
 * for seamless entity management with automatic persistence
 */
export function useEntitiesActions(projectSlug: string) {
  // Store actions
  const { addEntity, updateEntity, removeEntity, setError, setLoading } = useEntitiesStore()
  
  // Mutations
  const addEntityMutation = useAddEntityMutation(projectSlug)
  const updateEntityMutation = useUpdateEntityMutation(projectSlug) 
  const deleteEntityMutation = useDeleteEntityMutation(projectSlug)

  // Combined add entity action
  const addEntityWithPersistence = useCallback(async (entity: Entity) => {
    try {
      setLoading(true)
      setError(null)
      
      // Optimistically update store first
      addEntity(entity)
      
      // Then persist to file system
      await addEntityMutation.mutateAsync(entity)
      
    } catch (error) {
      // Revert optimistic update on failure
      removeEntity(entity.slug)
      setError(error instanceof Error ? error.message : 'Failed to add entity')
      throw error
    } finally {
      setLoading(false)
    }
  }, [addEntity, removeEntity, addEntityMutation, setError, setLoading])

  // Combined update entity action
  const updateEntityWithPersistence = useCallback(async (entitySlug: string, updates: Partial<Entity>) => {
    try {
      setLoading(true)
      setError(null)
      
      // Optimistically update store first
      updateEntity(entitySlug, updates)
      
      // Then persist to file system
      await updateEntityMutation.mutateAsync({ entitySlug, updates })
      
    } catch (error) {
      // On failure, the mutation will handle reverting the cache
      setError(error instanceof Error ? error.message : 'Failed to update entity')
      throw error
    } finally {
      setLoading(false)
    }
  }, [updateEntity, updateEntityMutation, setError, setLoading])

  // Combined delete entity action
  const deleteEntityWithPersistence = useCallback(async (entitySlug: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Store the entity data before removing (for rollback)
      const entities = useEntitiesStore.getState().entities
      const entityToDelete = entities.find(e => e.slug === entitySlug)
      
      // Optimistically remove from store first
      removeEntity(entitySlug)
      
      // Then persist to file system
      await deleteEntityMutation.mutateAsync(entitySlug)
      
    } catch (error) {
      // Revert optimistic delete on failure
      if (entityToDelete) {
        addEntity(entityToDelete)
      }
      setError(error instanceof Error ? error.message : 'Failed to delete entity')
      throw error
    } finally {
      setLoading(false)
    }
  }, [removeEntity, addEntity, deleteEntityMutation, setError, setLoading])

  return {
    addEntity: addEntityWithPersistence,
    updateEntity: updateEntityWithPersistence,
    deleteEntity: deleteEntityWithPersistence,
    
    // Loading states
    isAdding: addEntityMutation.isPending,
    isUpdating: updateEntityMutation.isPending,
    isDeleting: deleteEntityMutation.isPending,
    
    // Error states
    addError: addEntityMutation.error,
    updateError: updateEntityMutation.error,
    deleteError: deleteEntityMutation.error
  }
}