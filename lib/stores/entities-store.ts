import { create } from 'zustand'
import { Entity } from '../types'

interface EntitiesStore {
  // State
  entities: Entity[]
  loading: boolean
  error: string | null

  // Actions
  setEntities: (entities: Entity[]) => void
  addEntity: (entity: Entity) => void
  updateEntity: (entitySlug: string, updates: Partial<Entity>) => void
  removeEntity: (entitySlug: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Getters
  getEntity: (entitySlug: string) => Entity | null
  getEntitiesByType: (type: Entity['type']) => Entity[]

  // Reset
  reset: () => void
}

export const useEntitiesStore = create<EntitiesStore>((set, get) => ({
  addEntity: (entity) => set((state) => ({
    entities: [...state.entities, entity]
  })),
  // Initial state
  entities: [],
  error: null,

  getEntitiesByType: (type) => {
    const state = get()
    return state.entities.filter(entity => entity.type === type)
  },

  // Getters
  getEntity: (entitySlug) => {
    const state = get()
    return state.entities.find(entity => entity.slug === entitySlug) || null
  },

  loading: false,

  removeEntity: (entitySlug) => set((state) => ({
    entities: state.entities.filter(entity => entity.slug !== entitySlug)
  })),

  // Reset store
  reset: () => set({
    entities: [],
    error: null,
    loading: false
  }),
  // Actions
  setEntities: (entities) => set({ entities, error: null }),

  setError: (error) => set({ error }),

  setLoading: (loading) => set({ loading }),

  updateEntity: (entitySlug, updates) => set((state) => ({
    entities: state.entities.map(entity =>
      entity.slug === entitySlug
        ? { ...entity, ...updates, updatedAt: new Date().toISOString() }
        : entity
    )
  }))
}))
