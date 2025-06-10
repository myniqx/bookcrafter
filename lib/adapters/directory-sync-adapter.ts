import type { Project, ProjectBase } from "../types"
import type { StorageAdapter } from "./adapter"

export class DirectorySyncAdapter implements StorageAdapter {
  type = "directorySync"
  private directoryHandle: FileSystemDirectoryHandle | null = null
  private projectsCache: Map<string, Project> = new Map()

  async saveProject(project: Project): Promise<boolean> {
    // Update cache
    this.projectsCache.set(project.metadata.slug, project)

    if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
      throw new Error("Directory API desteklenmiyor")
    }

    try {
      // Request directory access if not already granted
      if (!this.directoryHandle) {
        this.directoryHandle = await (window as { showDirectoryPicker: (options: { mode: "readwrite" }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker({
          mode: "readwrite",
        })
      }

      // Create project folder
      const projectFolderName = `${project.metadata.slug}`
      const projectFolder = await this.directoryHandle!.getDirectoryHandle(projectFolderName, { create: true })

      // Save project data
      const projectData = {
        ...project,
        images: project.images.map((img) => ({
          ...img,
          data: undefined, // Remove base64 data from JSON
        })),
      }

      const projectFileHandle = await projectFolder.getFileHandle("project.json", { create: true })
      const projectWritable = await projectFileHandle.createWritable()
      await projectWritable.write(JSON.stringify(projectData, null, 2))
      await projectWritable.close()

      // Create images folder and save images
      if (project.images.length > 0) {
        const imagesFolder = await projectFolder.getDirectoryHandle("images", { create: true })

        for (const image of project.images) {
          // Convert base64 to blob
          const base64Data = image.data.split(",")[1]
          const binaryString = atob(base64Data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }

          const extension = image.mimeType.split("/")[1] || "jpg"
          const imageFileHandle = await imagesFolder.getFileHandle(`${image.id}.${extension}`, { create: true })
          const imageWritable = await imageFileHandle.createWritable()
          await imageWritable.write(bytes)
          await imageWritable.close()
        }
      }

      return true
    } catch (error) {
      console.error("Directory sync error:", error)
      throw new Error("Klasör senkronizasyonu sırasında hata oluştu")
    }
  }

  async getProjects(): Promise<ProjectBase[]> {
    return Array.from(this.projectsCache.values()).map((project) => ({
      name: project.metadata.name,
      slug: project.metadata.slug,
      updatedAt: project.metadata.updatedAt,
    }))
  }

  async loadProject(slug: string): Promise<Project | null> {
    // Check cache first
    if (this.projectsCache.has(slug)) {
      return this.projectsCache.get(slug) || null
    }

    if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
      throw new Error("Directory API desteklenmiyor")
    }

    try {
      // Request directory access
      const directoryHandle = await (window as { showDirectoryPicker: (options: { mode: "read" }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker({
        mode: "read",
      })

      // Find project folder
      let projectFolder: FileSystemDirectoryHandle | null = null;

      try {
        projectFolder = await directoryHandle.getDirectoryHandle(slug);
      } catch (error) {
        // If the directory doesn't exist, getDirectoryHandle will throw
        console.error("Error finding project folder:", error);
      }

      if (!projectFolder) {
        alert("Proje klasörü bulunamadı")
        return null
      }

      // Read project.json
      const projectFileHandle = await projectFolder.getFileHandle("project.json")
      const projectFile = await projectFileHandle.getFile()
      const projectJson = await projectFile.text()
      const project = JSON.parse(projectJson) as Project

      // Load images if they exist
      try {
        const imagesFolder = await projectFolder.getDirectoryHandle("images")

        for (const image of project.images) {
          const extension = image.mimeType.split("/")[1] || "jpg"
          try {
            const imageFileHandle = await imagesFolder.getFileHandle(`${image.id}.${extension}`)
            const imageFile = await imageFileHandle.getFile()
            const arrayBuffer = await imageFile.arrayBuffer()
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
            image.data = `data:${image.mimeType};base64,${base64}`
          } catch (imageError) {
            console.warn(`Image ${image.id} could not be loaded:`, imageError)
          }
        }
      } catch (imagesFolderError) {
        console.warn("Images folder not found:", imagesFolderError)
      }

      this.projectsCache.set(slug, project)
      return project
    } catch (error) {
      console.error("Directory load error:", error)
      return null
    }
  }

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projectsCache.values())
  }

  async deleteProject(slug: string): Promise<boolean> {
    this.projectsCache.delete(slug)

    if (typeof window !== "undefined") {
      alert(`Proje önbellek listesinden kaldırıldı. "${slug}" slug'li proje klasörünü manuel olarak silmeniz gerekiyor.`)
    }

    return true
  }
}
