import type { Project, ProjectBase } from "../types"
import type { StorageAdapter } from "./adapter"

import { ELECTRON_PATHS } from "../constants"

declare global {
  interface Window {
    electronAPI?: {
      fileSystem: {
        ensureDir: (path: string) => Promise<boolean>
        writeFile: (path: string, data: string) => Promise<boolean>
        readFile: (path: string) => Promise<string | null>
        deleteFile: (path: string) => Promise<boolean>
        deleteDir: (path: string) => Promise<boolean>
        listDir: (path: string) => Promise<string[]>
        exists: (path: string) => Promise<boolean>
        getHomePath: () => Promise<string>
        joinPath: (...paths: string[]) => string
      }
    }
  }
}

export class ElectronFileAdapter implements StorageAdapter {
  type = "electronFile"
  private basePath: string | null = null

  private async getBasePath(): Promise<string> {
    if (this.basePath) return this.basePath

    if (!window.electronAPI) {
      throw new Error("Electron API not available")
    }

    const homePath = await window.electronAPI.fileSystem.getHomePath()
    this.basePath = window.electronAPI.fileSystem.joinPath(homePath, ELECTRON_PATHS.APP_FOLDER)

    // Ensure base directory exists
    await window.electronAPI.fileSystem.ensureDir(this.basePath)

    return this.basePath
  }

  private async getProjectsPath(): Promise<string> {
    const basePath = await this.getBasePath()
    const projectsPath = window.electronAPI!.fileSystem.joinPath(basePath, ELECTRON_PATHS.PROJECTS_FOLDER)
    await window.electronAPI!.fileSystem.ensureDir(projectsPath)
    return projectsPath
  }

  private async getProjectPath(slug: string): Promise<string> {
    const projectsPath = await this.getProjectsPath()
    return window.electronAPI!.fileSystem.joinPath(projectsPath, slug)
  }

  async getProjects(): Promise<ProjectBase[]> {
    try {
      const projectsPath = await this.getProjectsPath()
      const projectDirs = await window.electronAPI!.fileSystem.listDir(projectsPath)

      const projects = [] as ProjectBase[]

      for (const projectId of projectDirs) {
        const projectPath = window.electronAPI!.fileSystem.joinPath(projectsPath, projectId)
        const projectFilePath = window.electronAPI!.fileSystem.joinPath(projectPath, "project.json")

        const projectData = await window.electronAPI!.fileSystem.readFile(projectFilePath)
        if (projectData) {
          try {
            const project = JSON.parse(projectData) as Project
            projects.push({
              name: project.metadata.name,
              slug: project.metadata.slug,
              updatedAt: project.metadata.updatedAt,
            } satisfies ProjectBase)
          } catch (error) {
            console.error(`Error parsing project ${projectId}:`, error)
          }
        }
      }

      return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error("Error getting projects:", error)
      return [] as ProjectBase[]
    }
  }

  async loadProject(slug: string): Promise<Project | null> {
    try {
      const projectPath = await this.getProjectPath(slug)
      const projectFilePath = window.electronAPI!.fileSystem.joinPath(projectPath, "project.json")

      const projectData = await window.electronAPI!.fileSystem.readFile(projectFilePath)
      if (!projectData) return null

      const project = JSON.parse(projectData) as Project

      // Load images if they exist
      if (project.images && project.images.length > 0) {
        const imagesPath = window.electronAPI!.fileSystem.joinPath(projectPath, ELECTRON_PATHS.IMAGES_FOLDER)

        for (const image of project.images) {
          const extension = image.mimeType.split("/")[1] || "jpg"
          const imagePath = window.electronAPI!.fileSystem.joinPath(imagesPath, `${image.id}.${extension}`)

          try {
            const imageData = await window.electronAPI!.fileSystem.readFile(imagePath)
            if (imageData) {
              image.data = `data:${image.mimeType};base64,${imageData}`
            }
          } catch (imageError) {
            console.warn(`Could not load image ${image.id}:`, imageError)
          }
        }
      }

      return project
    } catch (error) {
      console.error(`Error loading project ${slug}:`, error)
      return null
    }
  }

  async saveProject(project: Project): Promise<boolean> {
    try {
      const projectPath = await this.getProjectPath(project.metadata.slug)
      await window.electronAPI!.fileSystem.ensureDir(projectPath)

      // Prepare project data (without base64 image data)
      const projectData = {
        ...project,
        images:
          project.images?.map((img) => ({
            ...img,
            data: undefined, // Remove base64 data from JSON
          })) || [],
      }

      // Save project.json
      const projectFilePath = window.electronAPI!.fileSystem.joinPath(projectPath, "project.json")
      const success = await window.electronAPI!.fileSystem.writeFile(
        projectFilePath,
        JSON.stringify(projectData, null, 2),
      )

      if (!success) return false

      // Save images
      if (project.images && project.images.length > 0) {
        const imagesPath = window.electronAPI!.fileSystem.joinPath(projectPath, ELECTRON_PATHS.IMAGES_FOLDER)
        await window.electronAPI!.fileSystem.ensureDir(imagesPath)

        for (const image of project.images) {
          if (image.data) {
            const extension = image.mimeType.split("/")[1] || "jpg"
            const imagePath = window.electronAPI!.fileSystem.joinPath(imagesPath, `${image.id}.${extension}`)

            // Extract base64 data
            const base64Data = image.data.split(",")[1]
            await window.electronAPI!.fileSystem.writeFile(imagePath, base64Data)
          }
        }
      }

      return true
    } catch (error) {
      console.error(`Error saving project ${project.metadata.slug}:`, error)
      return false
    }
  }

  async deleteProject(slug: string): Promise<boolean> {
    try {
      const projectPath = await this.getProjectPath(slug)
      return await window.electronAPI!.fileSystem.deleteDir(projectPath)
    } catch (error) {
      console.error(`Error deleting project ${slug}:`, error)
      return false
    }
  }
}
