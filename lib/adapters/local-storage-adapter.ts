import type { Project, ProjectBase } from "@/lib/types"

import { StorageAdapter } from "./adapter"

export class LocalStorageAdapter implements StorageAdapter {
  private readonly PROJECTS_KEY = "bookcraft_projects"
  private readonly PROJECT_PREFIX = "bookcraft_project_"
  private readonly AUTOSAVE_PREFIX = "bookcraft_autosave_"

  type = "localStorage"

  constructor() {
    // Initialize storage if needed
    if (typeof window !== "undefined" && !localStorage.getItem(this.PROJECTS_KEY)) {
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify([]))
    }
  }

  // Get all projects (just IDs and basic info)
  async getProjects(): Promise<ProjectBase[]> {
    if (typeof window === "undefined") return []

    try {
      const projectsJson = localStorage.getItem(this.PROJECTS_KEY)
      return projectsJson ? JSON.parse(projectsJson) : []
    } catch (error) {
      console.error("Error getting projects:", error)
      return []
    }
  }

  // Load a specific project
  async loadProject(slug: string): Promise<Project | null> {
    if (typeof window === "undefined") return null

    try {
      const projectJson = localStorage.getItem(`${this.PROJECT_PREFIX}${slug}`)
      return projectJson ? JSON.parse(projectJson) : null
    } catch (error) {
      console.error(`Error loading project ${slug}:`, error)
      return null
    }
  }

  // Save a project
  async saveProject(project: Project): Promise<boolean> {
    if (typeof window === "undefined") return false

    try {
      // Update the project
      localStorage.setItem(`${this.PROJECT_PREFIX}${project.metadata.slug}`, JSON.stringify(project))

      // Update the projects list
      const projects = await this.getProjects()
      const existingIndex = projects.findIndex((p) => p.slug === project.metadata.slug)

      if (existingIndex >= 0) {
        projects[existingIndex] = {
          name: project.metadata.name,
          slug: project.metadata.slug,
          updatedAt: project.metadata.updatedAt,
        }
      } else {
        projects.push({
          name: project.metadata.name,
          slug: project.metadata.slug,
          updatedAt: project.metadata.updatedAt,
        })
      }

      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects))
      return true
    } catch (error) {
      console.error(`Error saving project ${project.metadata.slug}:`, error)
      return false
    }
  }

  // Delete a project
  async deleteProject(slug: string): Promise<boolean> {
    if (typeof window === "undefined") return false

    try {
      // Remove the project
      localStorage.removeItem(`${this.PROJECT_PREFIX}${slug}`)

      // Update the projects list
      const projects = await this.getProjects()
      const updatedProjects = projects.filter((p) => p.slug !== slug)
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(updatedProjects))

      // Remove any autosaves
      localStorage.removeItem(`${this.AUTOSAVE_PREFIX}${slug}`)

      return true
    } catch (error) {
      console.error(`Error deleting project ${slug}:`, error)
      return false
    }
  }

  // Save autosave data
  async saveAutosave(project: Project): Promise<boolean> {
    if (typeof window === "undefined") return false

    try {
      localStorage.setItem(`${this.AUTOSAVE_PREFIX}${project.metadata.slug}`, JSON.stringify(project))
      return true
    } catch (error) {
      console.error(`Error saving autosave for project ${project.metadata.slug}:`, error)
      return false
    }
  }

  // Get autosave data
  async getAutosave(slug: string): Promise<Project | null> {
    if (typeof window === "undefined") return null

    try {
      const autosaveJson = localStorage.getItem(`${this.AUTOSAVE_PREFIX}${slug}`)
      return autosaveJson ? JSON.parse(autosaveJson) : null
    } catch (error) {
      console.error(`Error getting autosave for project ${slug}:`, error)
      return null
    }
  }

  // Delete autosave data
  async deleteAutosave(slug: string): Promise<boolean> {
    if (typeof window === "undefined") return false

    try {
      localStorage.removeItem(`${this.AUTOSAVE_PREFIX}${slug}`)
      return true
    } catch (error) {
      console.error(`Error deleting autosave for project ${slug}:`, error)
      return false
    }
  }
}
