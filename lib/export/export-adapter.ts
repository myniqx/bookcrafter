import type { ExportOptions, ExportResult, Project } from "../types"

export interface ExportAdapter {
  type: string
  export: (project: Project, options: ExportOptions) => Promise<ExportResult>
}

export abstract class BaseExportAdapter implements ExportAdapter {
  abstract type: string
  abstract export(project: Project, options: ExportOptions): Promise<ExportResult>

  protected generateFilename(project: Project, format: string): string {
    const sanitizedName = project.metadata.name.replace(/[^a-zA-Z0-9]/g, "_")
    const timestamp = new Date().toISOString().split("T")[0]
    return `${sanitizedName}_${timestamp}.${format}`
  }

  protected getImageById(project: Project, imageId: string) {
    return project.images.find((img) => img.id === imageId)
  }

  protected formatContent(content: string): string {
    // Basic content formatting
    return content
      .replace(/\n\n+/g, "\n\n") // Normalize paragraph breaks
      .replace(/\s+$/gm, "") // Remove trailing spaces
      .trim()
  }
}
