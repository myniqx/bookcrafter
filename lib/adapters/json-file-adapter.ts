import type { Project, ProjectBase } from "../types"
import type { StorageAdapter } from "./adapter"

export class JsonFileAdapter implements StorageAdapter {
  type = "jsonFile"

  // In-memory cache of projects
  private projectsCache: Map<string, Project> = new Map()

  async saveProject(project: Project): Promise<boolean> {
    // Update cache
    this.projectsCache.set(project.metadata.slug, project)

    // Create a JSON file for download
    if (typeof window !== "undefined") {
      const jsonString = JSON.stringify(project, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${project.metadata.slug}.json`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    return true
  }

  async loadProject(slug: string): Promise<Project | null> {
    // Check cache first
    if (this.projectsCache.has(slug)) {
      return this.projectsCache.get(slug) || null
    }

    // If not in cache, we need to ask the user to upload the file
    if (typeof window !== "undefined") {
      return new Promise((resolve) => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = "application/json"

        input.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0]
          if (!file) {
            resolve(null)
            return
          }

          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string
              const project = JSON.parse(content) as Project

              // Validate that this is the correct project
              if (project.metadata.slug === slug) {
                this.projectsCache.set(slug, project)
                resolve(project)
              } else {
                alert("Yüklenen dosya istenen proje ile eşleşmiyor.")
                resolve(null)
              }
            } catch (error) {
              console.error("JSON dosyası yüklenirken hata oluştu:", error)
              resolve(null)
            }
          }

          reader.readAsText(file)
        }

        input.click()
      })
    }

    return null
  }

  async getProjects(): Promise<ProjectBase[]> {
    // For JSON file adapter, we can only list projects that are in the cache
    return Array.from(this.projectsCache.values()).map((project) => ({
      name: project.metadata.name,
      slug: project.metadata.slug,
      updatedAt: project.metadata.updatedAt,
    }))
  }

  async deleteProject(slug: string): Promise<boolean> {
    // Remove from cache
    this.projectsCache.delete(slug)

    // Inform the user that they should delete the JSON file manually
    if (typeof window !== "undefined") {
      alert(
        `Proje önbellek listesinden kaldırıldı. "${slug}" slug'li projenin JSON dosyasını manuel olarak silmeniz gerekiyor.`,
      )
    }

    return true
  }
}
