import type { ExportFormat, ExportOptions, ExportResult, Project } from "../types"
import type { ExportAdapter } from "./export-adapter"

import { JSONExportAdapter } from "./json-export-adapter"
import { PDFExportAdapter } from "./pdf-export-adapter"

export class ExportManager {
  private adapters: Map<ExportFormat, ExportAdapter> = new Map()

  constructor() {
    this.adapters.set("pdf", new PDFExportAdapter())
    this.adapters.set("json", new JSONExportAdapter())
    // TODO: Add DOCX and EPUB adapters
  }

  async export(project: Project, options: ExportOptions): Promise<ExportResult> {
    const adapter = this.adapters.get(options.format)

    if (!adapter) {
      return {
        error: `Export format '${options.format}' is not supported`,
        success: false,
      }
    }

    return adapter.export(project, options)
  }

  getSupportedFormats(): ExportFormat[] {
    return Array.from(this.adapters.keys())
  }
}
