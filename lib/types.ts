// Core data types for the application

export type AdapterType = "localStorage" | "jsonFile" | "compressedFile" | "directorySync"

export interface ProjectImage {
  id: string
  name: string
  type: "cover" | "background" | "chapter" | "entity"
  data: string // base64 encoded image data
  mimeType: string
  size: number
  createdAt: string
}

export interface ProjectBase {
  slug: string
  name: string
  updatedAt: string
}

export interface Project extends ProjectBase {
  description?: string
  createdAt: string
  adapterType: AdapterType
  books: Book[]
  entities: Entity[]
  images: ProjectImage[]
  coverImageId?: string
  backgroundImageId?: string
  aiSettings?: AISettings
}


export interface Book {
  slug: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  chapters: Chapter[]
  coverImageId?: string
  status?: "draft" | "completed"
}

export interface Chapter {
  slug: string
  title: string
  description?: string
  number?: number
  content?: string
  createdAt: string
  updatedAt: string
  imageIds?: string[]
}

export type EntityType = "character" | "location" | "item" | "event"

export interface Entity {
  name: string
  slug: string
  type: EntityType
  description?: string
  createdAt: string
  updatedAt: string
  properties: EntityProperty[]
  notes?: Note[]
  usages?: EntityUsage[]
  imageIds?: string[]
}

export interface EntityProperty {
  id: string
  name: string
  value: string
  isDefault?: boolean
}

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  completed?: boolean
  completedIn?: {
    bookId: string
    chapterId: string
  }
}

export interface EntityUsage {
  bookId: string
  chapterId: string
  count: number
}

export interface EntityReference {
  entityId: string
  property?: string
}

export interface ChapterStatistics {
  paragraphCount: number
  wordCount: number
  characterCount: number
  entityUsage: {
    entityName: string
    entitySlug: string
    count: number
  }[]
}

// Export types
export type ExportFormat = "pdf" | "docx" | "epub" | "json"

export interface ExportOptions {
  format: ExportFormat
  pageSize?: "A4" | "A5" | "Letter" | "Legal"
  chapterStartsOnRight?: boolean
  pageNumberAlignment?: "left" | "center" | "right"
  includeImages?: boolean
  includeCover?: boolean
  includeTableOfContents?: boolean
  fontSize?: number
  fontFamily?: string
  margins?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export interface ExportResult {
  success: boolean
  data?: Blob
  filename?: string
  error?: string
}

// AI Types
export type AIProvider = "openai" | "gemini" | "ollama" | "anthropic"

export interface AISettings {
  provider: AIProvider
  apiKey?: string
  model: string
  temperature?: number
  maxTokens?: number
  ollamaUrl?: string
}

export interface AIPromptTemplate {
  id: string
  name: string
  description: string
  prompt: string
  category: "grammar" | "style" | "creative" | "translation" | "custom"
  isDefault: boolean
}

export interface AIRequest {
  prompt: string
  selectedText?: string
  context: {
    projectName: string
    currentChapter?: string
    characters: string[]
    locations: string[]
    currentContent?: string
  }
  settings: AISettings
}

export interface AIResponse {
  success: boolean
  originalText: string
  suggestedText: string
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface TextDiff {
  type: "equal" | "delete" | "insert"
  text: string
}

export interface OllamaModel {
  name: string
  model: string
  size: number
  digest: string
  details: {
    format: string
    family: string
    families: string[]
    parameter_size: string
    quantization_level: string
  }
  modified_at: string
}
