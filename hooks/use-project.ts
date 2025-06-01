"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LocalStorageAdapter } from "@/lib/adapters/local-storage-adapter"
import { ElectronFileAdapter } from "@/lib/adapters/electron-file-adapter"
import type { Book, Chapter, Entity, Project } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { useAutosave } from "./use-autosave"
import { useApplication } from "@/providers/application-provider"

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { saveAutosave, deleteAutosave } = useAutosave()
  const { isElectron } = useApplication()

  // Get the appropriate adapter based on platform
  const getAdapter = useCallback(() => {
    return isElectron ? new ElectronFileAdapter() : new LocalStorageAdapter()
  }, [isElectron])

  // Load project
  const loadProject = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      const adapter = getAdapter()
      const loadedProject = await adapter.loadProject(projectId)
      if (loadedProject) {
        setProject(loadedProject)
      } else {
        setError("Project not found")
      }
    } catch (err) {
      console.error("Error loading project:", err)
      setError("Error loading project")
    } finally {
      setLoading(false)
    }
  }, [projectId, getAdapter])

  // Save project
  const saveProject = useCallback(
    async (updatedProject?: Project) => {
      const projectToSave = updatedProject || project
      if (!projectToSave) return false

      try {
        const adapter = getAdapter()
        const success = await adapter.saveProject(projectToSave)
        if (success) {
          // Update local state if we saved a different project
          if (updatedProject) {
            setProject(updatedProject)
          }

          // Delete any autosave when manually saving (only in browser mode)
          if (!isElectron) {
            deleteAutosave(projectToSave.id)
          }

          toast({
            title: "Proje kaydedildi",
            description: isElectron ? "Proje dosya sistemine kaydedildi." : "Proje tarayıcı depolamasına kaydedildi.",
          })

          return true
        } else {
          throw new Error("Proje kaydedilemedi")
        }
      } catch (err) {
        console.error("Error saving project:", err)

        toast({
          title: "Proje kaydetme hatası",
          description: "Projenizi kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.",
          variant: "destructive",
        })

        return false
      }
    },
    [project, toast, deleteAutosave, getAdapter, isElectron],
  )

  // Update project
  const updateProject = useCallback(
    (updatedProject: Project) => {
      setProject(updatedProject)
      // Autosave on update (only in browser mode)
      if (!isElectron) {
        saveAutosave(updatedProject)
      }
    },
    [saveAutosave, isElectron],
  )

  // Add book
  const addBook = useCallback(
    (book: Book) => {
      if (!project) return

      const updatedProject = {
        ...project,
        books: [...project.books, book],
        updatedAt: new Date().toISOString(),
      }

      setProject(updatedProject)
      if (!isElectron) {
        saveAutosave(updatedProject)
      }

      return book
    },
    [project, saveAutosave, isElectron],
  )

  // Update book
  const updateBook = useCallback(
    (bookId: string, updatedBook: Partial<Book>) => {
      if (!project) return

      const updatedBooks = project.books.map((book) => (book.id === bookId ? { ...book, ...updatedBook } : book))

      const updatedProject = {
        ...project,
        books: updatedBooks,
        updatedAt: new Date().toISOString(),
      }

      setProject(updatedProject)
      if (!isElectron) {
        saveAutosave(updatedProject)
      }
    },
    [project, saveAutosave, isElectron],
  )

  // Add chapter
  const addChapter = useCallback(
    (bookId: string, chapter: Chapter) => {
      if (!project) return

      const updatedBooks = project.books.map((book) => {
        if (book.id === bookId) {
          return {
            ...book,
            chapters: [...book.chapters, chapter],
          }
        }
        return book
      })

      const updatedProject = {
        ...project,
        books: updatedBooks,
        updatedAt: new Date().toISOString(),
      }

      setProject(updatedProject)
      if (!isElectron) {
        saveAutosave(updatedProject)
      }

      return chapter
    },
    [project, saveAutosave, isElectron],
  )

  // Update chapter
  const updateChapter = useCallback(
    (bookId: string, chapterId: string, updatedChapter: Partial<Chapter>) => {
      if (!project) return

      const updatedBooks = project.books.map((book) => {
        if (book.id === bookId) {
          const updatedChapters = book.chapters.map((chapter) =>
            chapter.id === chapterId ? { ...chapter, ...updatedChapter } : chapter,
          )
          return {
            ...book,
            chapters: updatedChapters,
          }
        }
        return book
      })

      const updatedProject = {
        ...project,
        books: updatedBooks,
        updatedAt: new Date().toISOString(),
      }

      setProject(updatedProject)
      if (!isElectron) {
        saveAutosave(updatedProject)
      }
    },
    [project, saveAutosave, isElectron],
  )

  // Add entity
  const addEntity = useCallback(
    (entity: Entity) => {
      if (!project) return

      const updatedProject = {
        ...project,
        entities: [...project.entities, entity],
        updatedAt: new Date().toISOString(),
      }

      setProject(updatedProject)
      if (!isElectron) {
        saveAutosave(updatedProject)
      }

      return entity
    },
    [project, saveAutosave, isElectron],
  )

  // Update entity
  const updateEntity = useCallback(
    (entityId: string, updatedEntity: Partial<Entity>) => {
      if (!project) return

      const updatedEntities = project.entities.map((entity) =>
        entity.id === entityId ? { ...entity, ...updatedEntity } : entity,
      )

      const updatedProject = {
        ...project,
        entities: updatedEntities,
        updatedAt: new Date().toISOString(),
      }

      setProject(updatedProject)
      if (!isElectron) {
        saveAutosave(updatedProject)
      }
    },
    [project, saveAutosave, isElectron],
  )

  // Get book by ID
  const getBook = useCallback(
    (bookId: string) => {
      if (!project) return null
      return project.books.find((book) => book.id === bookId) || null
    },
    [project],
  )

  // Get chapter by ID
  const getChapter = useCallback(
    (bookId: string, chapterId: string) => {
      if (!project) return null
      const book = project.books.find((book) => book.id === bookId)
      if (!book) return null
      return book.chapters.find((chapter) => chapter.id === chapterId) || null
    },
    [project],
  )

  // Get entity by ID
  const getEntity = useCallback(
    (entityId: string) => {
      if (!project) return null
      return project.entities.find((entity) => entity.id === entityId) || null
    },
    [project],
  )

  // Load project on mount
  useEffect(() => {
    loadProject()
  }, [loadProject])

  return {
    project,
    loading,
    error,
    saveProject,
    updateProject,
    addBook,
    updateBook,
    addChapter,
    updateChapter,
    addEntity,
    updateEntity,
    getBook,
    getChapter,
    getEntity,
  }
}
