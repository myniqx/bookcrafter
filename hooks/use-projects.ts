"use client"

import { useCallback, useEffect, useState } from "react"
import { HybridFileAdapter } from "@/lib/file-adapters/hybrid-file-adapter"
import type { Project, ProjectMetadata } from "@/lib/types"
import { useCurrentProjectStore } from "@/lib/stores"

const fileAdapter = new HybridFileAdapter()

export function useProjects() {
  const [projects, setProjects] = useState<ProjectMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setMetadata = useCurrentProjectStore(state => state.setMetadata)

  // Load all projects
  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const projectsList = await fileAdapter.getProjects()
      setProjects(projectsList)
    } catch (err) {
      console.error("Error loading projects:", err)
      setError("Projeler yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new project and initialize it in stores
  const createProject = useCallback(
    async (projectData: {
      name: string
      description?: string
    }) => {
      try {
        const now = new Date().toISOString()
        const slug = slugify(projectData.name)

        // Create project structure
        const project: Project = {
          books: [],
          chapters: [],
          entities: [],
          images: [],
          metadata: {
            adapterType: 'localStorage', // Default adapter type - actual adapter is determined by HybridFileAdapter
            createdAt: now,
            description: projectData.description,
            name: projectData.name,
            slug,
            updatedAt: now
          }
        }

        // Save project using file adapter
        const success = await fileAdapter.saveProject(project)

        if (success) {
          // Initialize project in store
          setMetadata(project.metadata)

          // Create project directory structure if needed
          await createProjectDirectory(slug)

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
    [setMetadata, loadProjects],
  )

  // Delete a project
  const deleteProject = useCallback(
    async (projectId: string) => {
      try {
        const success = await fileAdapter.deleteProject(projectId)
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
    [loadProjects],
  )

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return {
    createProject,
    deleteProject,
    error,
    loading,
    loadProjects,
    projects,
  }
}

// Helper functions
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Create project directory structure
async function createProjectDirectory(projectSlug: string): Promise<void> {
  try {
    // Check if we're in Electron environment
    if (typeof window !== 'undefined' && 'electronAPI' in window) {
      // In Electron, create actual directories
      const electronAPI = (window as any).electronAPI
      if (electronAPI?.createProjectDirectory) {
        await electronAPI.createProjectDirectory(projectSlug)
      }
    } else {
      // In browser, we simulate directory structure in IndexedDB
      // This is handled by the HybridFileAdapter
      console.log(`Creating project directory structure for: ${projectSlug}`)
    }
  } catch (error) {
    console.error('Error creating project directory:', error)
    // Don't throw error as this is not critical for project creation
  }
}
