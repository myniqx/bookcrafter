// File-based project structure types
import type { ProjectMetadata, EntityType, EntityProperty, Note, EntityUsage } from "../types"

export interface FileSystemProject {
  metadata: ProjectMetadata
  structure: ProjectStructure
}

export interface ProjectStructure {
  books: BookDirectory[]
  entities: EntityDirectory[]
  images: string[]
}

export interface BookDirectory {
  id: string
  folderName: string // UUID-based folder name
  metadata: BookMetadata
  chapters: ChapterDirectory[]
}

export interface ChapterDirectory {
  id: string
  folderName: string // UUID-based folder name  
  metadata: ChapterMetadata
  contentFile: string // Path to content.md
}

export interface EntityDirectory {
  id: string
  type: EntityType
  folderName: string
  metadata: EntityMetadata
}

// File-based metadata interfaces
export interface BookMetadata {
  title: string
  description?: string
  order: number
  status?: "draft" | "completed"
  coverImageId?: string
  createdAt: string
  updatedAt: string
}

export interface ChapterMetadata {
  title: string
  description?: string
  order: number
  imageIds?: string[]
  createdAt: string
  updatedAt: string
}

export interface EntityMetadata {
  name: string
  type: EntityType
  description?: string
  properties: EntityProperty[]
  notes?: Note[]
  usages?: EntityUsage[]
  imageIds?: string[]
  createdAt: string
  updatedAt: string
}

