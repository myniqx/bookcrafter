import { BaseExportAdapter } from "./export-adapter"
import type { Project, ExportOptions, ExportResult } from "../types"

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
        success: true,
        data: blob,
        filename: this.generateFilename(project, "json"),
      }
    } catch (error) {
      console.error("JSON export error:", error)
      return {
        success: false,
        error: "JSON oluşturulurken hata oluştu",
      }
    }
  }
}
