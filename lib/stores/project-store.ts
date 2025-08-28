import { create } from 'zustand'
import { ProjectMetadata } from '../types'

interface ProjectStore {
  // State - metadata is never null when project is loaded
  metadata: ProjectMetadata
  loading: boolean
  error: string | null

  // Actions
  setMetadata: (metadata: ProjectMetadata) => void
  updateMetadata: (updates: Partial<ProjectMetadata>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Store must be initialized with metadata - no null state allowed
export const useCurrentProjectStore = create<ProjectStore>((set) => ({
  error: null,
  loading: false,
  // metadata is initialized when store is created - no default null state
  metadata: {} as ProjectMetadata, // Will be set immediately on route load

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  
  // Actions
  setMetadata: (metadata) => set({ error: null, metadata }),

  updateMetadata: (updates) => set((state) => ({
    metadata: {
      ...state.metadata,
      ...updates,
      updatedAt: new Date().toISOString()
    }
  }))
}))
