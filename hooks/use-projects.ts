"use client"

import { useCallback, useEffect, useState } from "react"
import { LocalStorageAdapter } from "@/lib/adapters/local-storage-adapter"
import { ElectronFileAdapter } from "@/lib/adapters/electron-file-adapter"
import type { Project, ProjectBase } from "@/lib/types"
import { useApplication } from "@/providers/application-provider"


export function useProjects() {
  const [projects, setProjects] = useState<ProjectBase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isElectron } = useApplication()

  // Get the appropriate adapter based on platform
  const getAdapter = useCallback(() => {
    return isElectron ? new ElectronFileAdapter() : new LocalStorageAdapter()
  }, [isElectron])

  // Load all projects
  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const adapter = getAdapter()
      const projectsList = await adapter.getProjects()
      setProjects(projectsList)
    } catch (err) {
      console.error("Error loading projects:", err)
      setError("Projeler yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }, [getAdapter])

  // Create a new project
  const createProject = useCallback(
    async (project: Project) => {
      try {
        const adapter = getAdapter()
        const success = await adapter.saveProject(project)
        if (success) {
          await loadProjects() // Reload projects list
          return project
        } else {
          throw new Error("Proje kaydedilemedi")
        }
      } catch (err) {
        console.error("Error creating project:", err)
        throw err
      }
    },
    [getAdapter, loadProjects],
  )

  // Delete a project
  const deleteProject = useCallback(
    async (projectId: string) => {
      try {
        const adapter = getAdapter()
        const success = await adapter.deleteProject(projectId)
        if (success) {
          await loadProjects() // Reload projects list
          return true
        } else {
          throw new Error("Proje silinemedi")
        }
      } catch (err) {
        console.error("Error deleting project:", err)
        throw err
      }
    },
    [getAdapter, loadProjects],
  )

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    deleteProject,
  }
}
