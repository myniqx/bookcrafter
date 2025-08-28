import { create } from 'zustand'
import { Entity } from '../types'

interface CurrentEntityStore {
  // State - entity is never null when [entitySlug] route is active
  entity: Entity
  loading: boolean
  error: string | null

  // Actions
  setEntity: (entity: Entity) => void
  updateEntity: (updates: Partial<Entity>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Store must be initialized with entity - no null state allowed when [entitySlug] is active
export const useCurrentEntityStore = create<CurrentEntityStore>((set) => ({
  // Initial state - entity will be set immediately on route load
  entity: {} as Entity, // Will be set immediately when [entitySlug] route loads
  loading: false,
  error: null,

  // Actions
  setEntity: (entity) => set({ entity, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  updateEntity: (updates) => set((state) => ({
    entity: {
      ...state.entity,
      ...updates,
      updatedAt: new Date().toISOString()
    }
  }))
}))