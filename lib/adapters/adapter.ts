import type { Project, ProjectBase } from "../types"
import { LocalStorageAdapter } from "./local-storage-adapter"
import { JsonFileAdapter } from "./json-file-adapter"
import { CompressedFileAdapter } from "./compressed-file-adapter"
import { DirectorySyncAdapter } from "./directory-sync-adapter"

// Base adapter interface
export interface StorageAdapter {
  type: string
  saveProject: (project: Project) => Promise<boolean>
  loadProject: (slug: string) => Promise<Project | null>
  getProjects: () => Promise<ProjectBase[]>
  deleteProject: (slug: string) => Promise<boolean>
}

// Factory function to create the appropriate adapter
export function createAdapter(type: string): StorageAdapter {
  switch (type) {
    case "localStorage":
      return new LocalStorageAdapter()
    case "jsonFile":
      return new JsonFileAdapter()
    case "compressedFile":
      return new CompressedFileAdapter()
    case "directorySync":
      return new DirectorySyncAdapter()
    default:
      throw new Error(`Unsupported adapter type: ${type}`)
  }
}
