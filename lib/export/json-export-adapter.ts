import type { ExportOptions, ExportResult, Project } from "../types"

import { BaseExportAdapter } from "./export-adapter"

export class JSONExportAdapter extends BaseExportAdapter {
  type = "json"

  async export(project: Project, options: ExportOptions): Promise<ExportResult> {
    try {
      const exportData = {
        ...project,
        exportedAt: new Date().toISOString(),
        exportOptions: options,
      }

      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })

      return {
        data: blob,
        filename: this.generateFilename(project, "json"),
        success: true,
      }
    } catch (error) {
      console.error("JSON export error:", error)
      return {
        error: "JSON oluşturulurken hata oluştu",
        success: false,
      }
    }
  }
}
