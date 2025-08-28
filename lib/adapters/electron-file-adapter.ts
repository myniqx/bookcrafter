import type { Project, ProjectMetadata } from "../types"
import type { StorageAdapter } from "./adapter"

import { ELECTRON_PATHS } from "../constants"


declare global {
  interface Window {
    electronAPI: {
      env: { NODE_ENV: string, isDev: boolean };
      fs: {
        ensureDir: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
        writeFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>;
        readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
        deleteFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
        deleteDir: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
        listDir: (dirPath: string) => Promise<{ success: boolean; data?: string[]; error?: string }>;
        exists: (filePath: string) => Promise<{ success: boolean; exists?: boolean; error?: string }>;
        getHomePath: () => Promise<{ success: boolean; data?: string; error?: string }>;
        joinPath: (...paths: string[]) => Promise<{ success: boolean; data?: string; error?: string }>;
      };
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

    const homePathResult = await window.electronAPI.fs.getHomePath()
    if (!homePathResult.success || !homePathResult.data) {
      throw new Error("Failed to get home path")
    }

    const joinResult = await window.electronAPI.fs.joinPath(homePathResult.data, ELECTRON_PATHS.APP_FOLDER)
    if (!joinResult.success || !joinResult.data) {
      throw new Error("Failed to join paths")
    }

    this.basePath = joinResult.data

    // Ensure base directory exists
    await window.electronAPI.fs.ensureDir(this.basePath)

    return this.basePath
  }

  private async getProjectsPath(): Promise<string> {
    const basePath = await this.getBasePath()
    const joinResult = await window.electronAPI!.fs.joinPath(basePath, ELECTRON_PATHS.PROJECTS_FOLDER)
    if (!joinResult.success || !joinResult.data) {
      throw new Error("Failed to join projects path")
    }
    const projectsPath = joinResult.data

    const ensureResult = await window.electronAPI!.fs.ensureDir(projectsPath)
    if (!ensureResult.success) {
      throw new Error(`Failed to ensure projects directory: ${ensureResult.error}`)
    }

    return projectsPath
  }

  private async getProjectPath(slug: string): Promise<string> {
    const projectsPath = await this.getProjectsPath()
    const joinResult = await window.electronAPI!.fs.joinPath(projectsPath, slug)
    if (!joinResult.success || !joinResult.data) {
      throw new Error("Failed to join project path")
    }
    return joinResult.data
  }

  async getProjects(): Promise<ProjectMetadata[]> {
    try {
      const projectsPath = await this.getProjectsPath()
      const listResult = await window.electronAPI!.fs.listDir(projectsPath)

      if (!listResult.success || !listResult.data) {
        console.error("Failed to list projects directory:", listResult.error)
        return []
      }

      const projectDirs = listResult.data
      const projects = [] as ProjectMetadata[]

      for (const projectId of projectDirs) {
        const projectPathResult = await window.electronAPI!.fs.joinPath(projectsPath, projectId)
        if (!projectPathResult.success || !projectPathResult.data) continue

        const projectFilePath = await window.electronAPI!.fs.joinPath(projectPathResult.data, "project.json")
        if (!projectFilePath.success || !projectFilePath.data) continue

        const projectDataResult = await window.electronAPI!.fs.readFile(projectFilePath.data)
        if (projectDataResult.success && projectDataResult.data) {
          try {
            const project = JSON.parse(projectDataResult.data) as Project
            projects.push(project.metadata)
          } catch (error) {
            console.error(`Error parsing project ${projectId}:`, error)
          }
        }
      }

      return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error("Error getting projects:", error)
      return [] as ProjectMetadata[]
    }
  }

  async loadProject(slug: string): Promise<Project | null> {
    try {
      const projectPath = await this.getProjectPath(slug)
      const projectFilePathResult = await window.electronAPI!.fs.joinPath(projectPath, "project.json")

      if (!projectFilePathResult.success || !projectFilePathResult.data) {
        console.error("Failed to create project file path")
        return null
      }

      const projectDataResult = await window.electronAPI!.fs.readFile(projectFilePathResult.data)
      if (!projectDataResult.success || !projectDataResult.data) return null

      const project = JSON.parse(projectDataResult.data) as Project

      // Load images if they exist
      if (project.images && project.images.length > 0) {
        const imagesPathResult = await window.electronAPI!.fs.joinPath(projectPath, ELECTRON_PATHS.IMAGES_FOLDER)

        if (imagesPathResult.success && imagesPathResult.data) {
          const imagesPath = imagesPathResult.data

          for (const image of project.images) {
            const extension = image.mimeType.split("/")[1] || "jpg"
            const imagePathResult = await window.electronAPI!.fs.joinPath(imagesPath, `${image.id}.${extension}`)

            if (imagePathResult.success && imagePathResult.data) {
              try {
                const imageDataResult = await window.electronAPI!.fs.readFile(imagePathResult.data)
                if (imageDataResult.success && imageDataResult.data) {
                  image.data = `data:${image.mimeType};base64,${imageDataResult.data}`
                }
              } catch (imageError) {
                console.warn(`Could not load image ${image.id}:`, imageError)
              }
            }
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
      const ensureResult = await window.electronAPI!.fs.ensureDir(projectPath)

      if (!ensureResult.success) {
        console.error("Failed to ensure project directory:", ensureResult.error)
        return false
      }

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
      const projectFilePathResult = await window.electronAPI!.fs.joinPath(projectPath, "project.json")
      if (!projectFilePathResult.success || !projectFilePathResult.data) {
        console.error("Failed to create project file path")
        return false
      }

      const writeResult = await window.electronAPI!.fs.writeFile(
        projectFilePathResult.data,
        JSON.stringify(projectData, null, 2),
      )

      if (!writeResult.success) {
        console.error("Failed to write project file:", writeResult.error)
        return false
      }

      // Save images
      if (project.images && project.images.length > 0) {
        const imagesPathResult = await window.electronAPI!.fs.joinPath(projectPath, ELECTRON_PATHS.IMAGES_FOLDER)
        if (!imagesPathResult.success || !imagesPathResult.data) {
          console.error("Failed to create images path")
          return false
        }

        const imagesPath = imagesPathResult.data
        const ensureImagesResult = await window.electronAPI!.fs.ensureDir(imagesPath)
        if (!ensureImagesResult.success) {
          console.error("Failed to ensure images directory:", ensureImagesResult.error)
          return false
        }

        for (const image of project.images) {
          if (image.data) {
            const extension = image.mimeType.split("/")[1] || "jpg"
            const imagePathResult = await window.electronAPI!.fs.joinPath(imagesPath, `${image.id}.${extension}`)

            if (imagePathResult.success && imagePathResult.data) {
              // Extract base64 data
              const base64Data = image.data.split(",")[1]
              const writeImageResult = await window.electronAPI!.fs.writeFile(imagePathResult.data, base64Data)

              if (!writeImageResult.success) {
                console.error(`Failed to write image ${image.id}:`, writeImageResult.error)
                // Continue with other images even if one fails
              }
            }
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
      const deleteResult = await window.electronAPI!.fs.deleteDir(projectPath)

      if (!deleteResult.success) {
        console.error(`Failed to delete project ${slug}:`, deleteResult.error)
        return false
      }

      return true
    } catch (error) {
      console.error(`Error deleting project ${slug}:`, error)
      return false
    }
  }
}
