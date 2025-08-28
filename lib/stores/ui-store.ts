import { create } from 'zustand'

interface UIStore {
  // Editor state
  selectedText: string
  showEntitySuggestions: boolean
  entitySearchTerm: string
  selectedEntityIndex: number

  // Actions
  setSelectedText: (text: string) => void
  setShowEntitySuggestions: (show: boolean) => void
  setEntitySearchTerm: (term: string) => void
  setSelectedEntityIndex: (index: number) => void

  // Reset
  resetEditorState: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  entitySearchTerm: '',
  // Reset
  resetEditorState: () => set({
    entitySearchTerm: '',
    selectedEntityIndex: 0,
    selectedText: '',
    showEntitySuggestions: false
  }),
  selectedEntityIndex: 0,
  // Initial state
  selectedText: '',

  setEntitySearchTerm: (entitySearchTerm) => set({ entitySearchTerm }),
  setSelectedEntityIndex: (selectedEntityIndex) => set({ selectedEntityIndex }),
  // Actions
  setSelectedText: (selectedText) => set({ selectedText }),
  setShowEntitySuggestions: (showEntitySuggestions) => set({ showEntitySuggestions }),

  showEntitySuggestions: false
}))
