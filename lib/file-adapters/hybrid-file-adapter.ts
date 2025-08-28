import { Book, Chapter, Entity, Project, ProjectMetadata } from '../types'
import { BookMetadata, EntityMetadata, ProjectStructure } from '../types/file-system'

export interface FileSystemAdapter {
  // Project operations
  saveProject: (project: Project) => Promise<boolean>
  loadProject: (slug: string) => Promise<Project | null>
  getProjects: () => Promise<ProjectMetadata[]>
  deleteProject: (slug: string) => Promise<boolean>

  // Incremental operations
  saveChapter: (projectSlug: string, bookId: string, chapterId: string, content: string) => Promise<boolean>
  loadChapter: (projectSlug: string, bookId: string, chapterId: string) => Promise<string | null>
  saveBookMetadata: (projectSlug: string, bookId: string, metadata: BookMetadata) => Promise<boolean>
  saveEntityMetadata: (projectSlug: string, entityId: string, metadata: EntityMetadata) => Promise<boolean>

  // Structure operations
  loadProjectStructure: (projectSlug: string) => Promise<ProjectStructure | null>
}

export class HybridFileAdapter implements FileSystemAdapter {
  private isElectron: boolean
  private electronAdapter?: ElectronFileAdapter
  private webAdapter?: WebFileAdapter

  constructor() {
    // Check if we're in an Electron environment
    this.isElectron = typeof window !== 'undefined' && 
                      typeof (window as any).electronAPI !== 'undefined'
    
    // Also check for common Electron indicators
    if (!this.isElectron) {
      this.isElectron = typeof process !== 'undefined' && 
                       typeof process.versions?.electron !== 'undefined'
    }
  }

  private get adapter() {
    if (this.isElectron) {
      if (!this.electronAdapter) {
        this.electronAdapter = new ElectronFileAdapter()
      }
      return this.electronAdapter
    } else {
      if (!this.webAdapter) {
        this.webAdapter = new WebFileAdapter()
      }
      return this.webAdapter
    }
  }

  // Delegate all methods to the appropriate adapter
  async saveProject(project: Project): Promise<boolean> {
    return this.adapter.saveProject(project)
  }

  async loadProject(slug: string): Promise<Project | null> {
    return this.adapter.loadProject(slug)
  }

  async getProjects(): Promise<ProjectMetadata[]> {
    return this.adapter.getProjects()
  }

  async deleteProject(slug: string): Promise<boolean> {
    return this.adapter.deleteProject(slug)
  }

  async saveChapter(projectSlug: string, bookId: string, chapterId: string, content: string): Promise<boolean> {
    return this.adapter.saveChapter(projectSlug, bookId, chapterId, content)
  }

  async loadChapter(projectSlug: string, bookId: string, chapterId: string): Promise<string | null> {
    return this.adapter.loadChapter(projectSlug, bookId, chapterId)
  }

  async saveBookMetadata(projectSlug: string, bookId: string, metadata: BookMetadata): Promise<boolean> {
    return this.adapter.saveBookMetadata(projectSlug, bookId, metadata)
  }

  async saveEntityMetadata(projectSlug: string, entityId: string, metadata: EntityMetadata): Promise<boolean> {
    return this.adapter.saveEntityMetadata(projectSlug, entityId, metadata)
  }

  async loadProjectStructure(projectSlug: string): Promise<ProjectStructure | null> {
    return this.adapter.loadProjectStructure(projectSlug)
  }
}

// Electron implementation using Node.js file system
class ElectronFileAdapter implements FileSystemAdapter {
  async saveProject(project: Project): Promise<boolean> {
    try {
      const projectPath = await this.getProjectPath(project.metadata.slug)
      const fs = await import('fs/promises')

      // Create project directory
      await fs.mkdir(projectPath, { recursive: true })

      // Save project metadata
      const projectFile = `${projectPath}/project.json`
      await fs.writeFile(projectFile, JSON.stringify(project.metadata, null, 2))

      // Save books
      for (const book of project.books) {
        await this.saveBookStructure(projectPath, book, project.chapters, project.entities)
      }

      // Save standalone entities
      await this.saveEntities(projectPath, project.entities)

      // Save images
      await this.saveImages(projectPath, project.images)

      return true
    } catch (error) {
      console.error('Error saving project:', error)
      return false
    }
  }

  async loadProject(slug: string): Promise<Project | null> {
    try {
      const projectPath = await this.getProjectPath(slug)
      const fs = await import('fs/promises')

      // Load project metadata
      const projectFile = `${projectPath}/project.json`
      const metadataJson = await fs.readFile(projectFile, 'utf-8')
      const metadata = JSON.parse(metadataJson) as ProjectMetadata

      // Load structure
      const structure = await this.loadProjectStructure(slug)
      if (!structure) return null

      // Convert structure back to original format
      const books: Book[] = []
      const chapters: Chapter[] = []
      const entities: Entity[] = []

      // TODO: Convert file structure back to original format
      // This will be implemented in the next step

      return {
        books,
        chapters,
        entities,
        images: [],
        metadata
      }
    } catch (error) {
      console.error('Error loading project:', error)
      return null
    }
  }

  async getProjects(): Promise<ProjectMetadata[]> {
    try {
      const path = await import('path')
      const fs = await import('fs/promises')

      const appRoot = process.cwd()
      const projectsDir = path.join(appRoot, 'projects')

      // Check if projects directory exists
      try {
        await fs.access(projectsDir)
      } catch {
        // Directory doesn't exist, return empty array
        return []
      }

      const entries = await fs.readdir(projectsDir, { withFileTypes: true })
      const projects: ProjectMetadata[] = []

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const projectPath = path.join(projectsDir, entry.name)
          const projectFile = path.join(projectPath, 'project.json')

          try {
            const metadataJson = await fs.readFile(projectFile, 'utf-8')
            const metadata = JSON.parse(metadataJson) as ProjectMetadata

            projects.push(metadata)
          } catch {
            // Skip invalid projects
            continue
          }
        }
      }

      // Sort by updated date (most recent first)
      return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error('Error getting projects:', error)
      return []
    }
  }

  async deleteProject(slug: string): Promise<boolean> {
    try {
      const projectPath = await this.getProjectPath(slug)
      const fs = await import('fs/promises')

      // Remove the entire project directory
      await fs.rm(projectPath, { force: true, recursive: true })

      return true
    } catch (error) {
      console.error('Error deleting project:', error)
      return false
    }
  }

  async saveChapter(projectSlug: string, bookId: string, chapterId: string, content: string): Promise<boolean> {
    try {
      const chapterPath = await this.getChapterPath(projectSlug, bookId, chapterId)
      const fs = await import('fs/promises')

      await fs.mkdir(chapterPath, { recursive: true })
      await fs.writeFile(`${chapterPath}/content.md`, content)

      return true
    } catch (error) {
      console.error('Error saving chapter:', error)
      return false
    }
  }

  async loadChapter(projectSlug: string, bookId: string, chapterId: string): Promise<string | null> {
    try {
      const chapterPath = await this.getChapterPath(projectSlug, bookId, chapterId)
      const fs = await import('fs/promises')

      const content = await fs.readFile(`${chapterPath}/content.md`, 'utf-8')
      return content
    } catch (error) {
      console.error('Error loading chapter:', error)
      return null
    }
  }

  async saveBookMetadata(projectSlug: string, bookId: string, metadata: BookMetadata): Promise<boolean> {
    try {
      const bookPath = await this.getBookPath(projectSlug, bookId)
      const fs = await import('fs/promises')

      await fs.mkdir(bookPath, { recursive: true })
      await fs.writeFile(`${bookPath}/info.json`, JSON.stringify(metadata, null, 2))

      return true
    } catch (error) {
      console.error('Error saving book metadata:', error)
      return false
    }
  }

  async saveEntityMetadata(projectSlug: string, entityId: string, metadata: EntityMetadata): Promise<boolean> {
    try {
      const entityPath = await this.getEntityPath(projectSlug, entityId, metadata.type)
      const fs = await import('fs/promises')

      await fs.mkdir(entityPath, { recursive: true })
      await fs.writeFile(`${entityPath}/info.json`, JSON.stringify(metadata, null, 2))

      return true
    } catch (error) {
      console.error('Error saving entity metadata:', error)
      return false
    }
  }

  async loadProjectStructure(projectSlug: string): Promise<ProjectStructure | null> {
    // TODO: Implement structure loading
    return null
  }

  private async getProjectPath(slug: string): Promise<string> {
    // Use the projects directory in the current application root
    const path = await import('path')
    const fs = await import('fs/promises')

    // Get the application root directory (where package.json is)
    const appRoot = process.cwd()
    const projectsDir = path.join(appRoot, 'projects')

    // Ensure projects directory exists
    await fs.mkdir(projectsDir, { recursive: true })

    return path.join(projectsDir, slug)
  }

  private async getBookPath(projectSlug: string, bookId: string): Promise<string> {
    return `${await this.getProjectPath(projectSlug)}/books/${bookId}`
  }

  private async getChapterPath(projectSlug: string, bookId: string, chapterId: string): Promise<string> {
    return `${await this.getBookPath(projectSlug, bookId)}/chapters/${chapterId}`
  }

  private async getEntityPath(projectSlug: string, entityId: string, type: string): Promise<string> {
    return `${await this.getProjectPath(projectSlug)}/entities/${type}/${entityId}`
  }

  private async saveBookStructure(projectPath: string, book: Book, chapters: Chapter[], entities: Entity[]): Promise<void> {
    // TODO: Implement book structure saving
  }

  private async saveEntities(projectPath: string, entities: Entity[]): Promise<void> {
    // TODO: Implement entities saving
  }

  private async saveImages(projectPath: string, images: any[]): Promise<void> {
    // TODO: Implement images saving
  }
}

// Web implementation using IndexedDB
class WebFileAdapter implements FileSystemAdapter {
  private dbName = 'bookcraft-files'
  private version = 2
  private db: IDBDatabase | null = null

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = request.result
        const oldVersion = event.oldVersion

        // Handle migration from version 1 to 2
        if (oldVersion < 2) {
          // Delete and recreate the projects store with correct keyPath
          if (db.objectStoreNames.contains('projects')) {
            db.deleteObjectStore('projects')
          }
          db.createObjectStore('projects', { keyPath: 'metadata.slug' })
        }

        // Create files store if it doesn't exist
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'path' })
        }
      }
    })
  }

  async saveProject(project: Project): Promise<boolean> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['projects'], 'readwrite')
      const store = transaction.objectStore('projects')

      await new Promise<void>((resolve, reject) => {
        const request = store.put(project)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      return true
    } catch (error) {
      console.error('Error saving project:', error)
      return false
    }
  }

  async loadProject(slug: string): Promise<Project | null> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['projects'], 'readonly')
      const store = transaction.objectStore('projects')

      return new Promise((resolve, reject) => {
        const request = store.get(slug)
        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Error loading project:', error)
      return null
    }
  }

  async getProjects(): Promise<ProjectMetadata[]> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['projects'], 'readonly')
      const store = transaction.objectStore('projects')

      return new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => {
          const projects = request.result.map((p: Project) => p.metadata)
          resolve(projects)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Error getting projects:', error)
      return []
    }
  }

  async deleteProject(slug: string): Promise<boolean> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['projects'], 'readwrite')
      const store = transaction.objectStore('projects')

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(slug)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      return true
    } catch (error) {
      console.error('Error deleting project:', error)
      return false
    }
  }

  async saveChapter(projectSlug: string, bookId: string, chapterId: string, content: string): Promise<boolean> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['files'], 'readwrite')
      const store = transaction.objectStore('files')

      const path = `${projectSlug}/books/${bookId}/chapters/${chapterId}/content.md`

      await new Promise<void>((resolve, reject) => {
        const request = store.put({ content, path })
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      return true
    } catch (error) {
      console.error('Error saving chapter:', error)
      return false
    }
  }

  async loadChapter(projectSlug: string, bookId: string, chapterId: string): Promise<string | null> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['files'], 'readonly')
      const store = transaction.objectStore('files')

      const path = `${projectSlug}/books/${bookId}/chapters/${chapterId}/content.md`

      return new Promise((resolve, reject) => {
        const request = store.get(path)
        request.onsuccess = () => {
          const result = request.result
          resolve(result ? result.content : null)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Error loading chapter:', error)
      return null
    }
  }

  async saveBookMetadata(projectSlug: string, bookId: string, metadata: BookMetadata): Promise<boolean> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['files'], 'readwrite')
      const store = transaction.objectStore('files')

      const path = `${projectSlug}/books/${bookId}/info.json`

      await new Promise<void>((resolve, reject) => {
        const request = store.put({ content: JSON.stringify(metadata, null, 2), path })
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      return true
    } catch (error) {
      console.error('Error saving book metadata:', error)
      return false
    }
  }

  async saveEntityMetadata(projectSlug: string, entityId: string, metadata: EntityMetadata): Promise<boolean> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['files'], 'readwrite')
      const store = transaction.objectStore('files')

      const path = `${projectSlug}/entities/${metadata.type}/${entityId}/info.json`

      await new Promise<void>((resolve, reject) => {
        const request = store.put({ content: JSON.stringify(metadata, null, 2), path })
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      return true
    } catch (error) {
      console.error('Error saving entity metadata:', error)
      return false
    }
  }

  async loadProjectStructure(projectSlug: string): Promise<ProjectStructure | null> {
    // TODO: Implement structure loading for web
    return null
  }
}
