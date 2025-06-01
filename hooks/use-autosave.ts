"use client"

import { useCallback } from "react"
import type { Project } from "@/lib/types"
import { LocalStorageAdapter } from "@/lib/adapters/local-storage-adapter"

// Default adapter for autosave
const defaultAdapter = new LocalStorageAdapter()

export function useAutosave() {
  const saveAutosave = useCallback(async (project: Project) => {
    try {
      await defaultAdapter.saveAutosave(project)
    } catch (error) {
      console.error("Autosave failed:", error)
    }
  }, [])

  const getAutosave = useCallback(async (projectId: string): Promise<Project | null> => {
    try {
      return await defaultAdapter.getAutosave(projectId)
    } catch (error) {
      console.error("Failed to get autosave:", error)
      return null
    }
  }, [])

  const deleteAutosave = useCallback(async (projectId: string) => {
    try {
      await defaultAdapter.deleteAutosave(projectId)
    } catch (error) {
      console.error("Failed to delete autosave:", error)
    }
  }, [])

  return {
    saveAutosave,
    getAutosave,
    deleteAutosave,
  }
}
