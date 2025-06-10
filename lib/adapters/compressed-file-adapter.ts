import JSZip from "jszip"

import type { Project, ProjectBase } from "../types"
import type { StorageAdapter } from "./adapter"

export class CompressedFileAdapter implements StorageAdapter {
  type = "compressedFile"

  // In-memory cache of projects
  private projectsCache: Map<string, Project> = new Map()

  async saveProject(project: Project): Promise<boolean> {
    // Update cache
    this.projectsCache.set(project.metadata.slug, project)

    // Create a compressed file with project data and images
    if (typeof window !== "undefined") {
      try {
        const zip = new JSZip()

        // Add project data (without images to avoid duplication)
        const projectData = {
          ...project,
          images: project.images.map((img) => ({
            ...img,
            data: undefined, // Remove base64 data from JSON
          })),
        }

        zip.file("project.json", JSON.stringify(projectData, null, 2))

        // Add images folder
        const imagesFolder = zip.folder("images")
        if (imagesFolder) {
          for (const image of project.images) {
            // Convert base64 to blob
            const base64Data = image.data.split(",")[1]
            const binaryString = atob(base64Data)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }

            const extension = image.mimeType.split("/")[1] || "jpg"
            imagesFolder.file(`${image.id}.${extension}`, bytes)
          }
        }

        // Generate and download the zip file
        const content = await zip.generateAsync({ type: "blob" })
        const url = URL.createObjectURL(content)

        const a = document.createElement("a")
        a.href = url
        a.download = `${project.metadata.slug}.bookcraft`
        document.body.appendChild(a)
        a.click()

        // Clean up
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        return true
      } catch (error) {
        console.error("Compressed file creation error:", error)
        throw new Error("Sıkıştırılmış dosya oluşturulurken hata oluştu")
      }
    }

    return false
  }

  async loadProject(slug: string): Promise<Project | null> {
    // Check cache first
    if (this.projectsCache.has(slug)) {
      return this.projectsCache.get(slug) || null
    }

    // If not in cache, ask user to upload the compressed file
    if (typeof window !== "undefined") {
      return new Promise((resolve) => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".bookcraft,.zip"

        input.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0]
          if (!file) {
            resolve(null)
            return
          }

          try {
            const zip = new JSZip()
            const contents = await zip.loadAsync(file)

            // Read project.json
            const projectFile = contents.file("project.json")
            if (!projectFile) {
              alert("Geçersiz proje dosyası: project.json bulunamadı")
              resolve(null)
              return
            }

            const projectJson = await projectFile.async("string")
            const project = JSON.parse(projectJson) as Project

            // Validate project ID
            if (project.metadata.slug !== slug) {
              alert("Yüklenen dosya istenen proje ile eşleşmiyor.")
              resolve(null)
              return
            }

            // Load images
            const imagesFolder = contents.folder("images")
            if (imagesFolder) {
              const imageFiles = Object.keys(contents.files).filter((name) => name.startsWith("images/"))

              for (const imageFile of imageFiles) {
                const file = contents.file(imageFile)
                if (file) {
                  const imageData = await file.async("base64")
                  const fileName = imageFile.replace("images/", "").split(".")[0]

                  // Find corresponding image in project data
                  const imageIndex = project.images.findIndex((img) => img.id === fileName)
                  if (imageIndex >= 0) {
                    project.images[imageIndex].data = `data:${project.images[imageIndex].mimeType};base64,${imageData}`
                  }
                }
              }
            }

            this.projectsCache.set(slug, project)
            resolve(project)
          } catch (error) {
            console.error("Compressed file loading error:", error)
            alert("Dosya yüklenirken hata oluştu")
            resolve(null)
          }
        }

        input.click()
      })
    }

    return null
  }

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projectsCache.values())
  }

  async getProjects(): Promise<ProjectBase[]> {
    return Array.from(this.projectsCache.values()).map((project) => ({
      name: project.metadata.name,
      slug: project.metadata.slug,
      updatedAt: project.metadata.updatedAt,
    }))
  }

  async deleteProject(slug: string): Promise<boolean> {
    this.projectsCache.delete(slug)

    if (typeof window !== "undefined") {
      alert(
        `Proje önbellek listesinden kaldırıldı. "${slug}" slug'li projenin .bookcraft dosyasını manuel olarak silmeniz gerekiyor.`,
      )
    }

    return true
  }
}
