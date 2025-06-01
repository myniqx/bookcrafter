"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { LocalStorageAdapter } from "@/lib/adapters/local-storage-adapter";
import { ElectronFileAdapter } from "@/lib/adapters/electron-file-adapter";
import type { Book, Chapter, Entity, Project } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useAutosave } from "@/hooks/use-autosave"; // Path updated if hook is in /hooks
import { useApplication } from "@/providers/application-provider";

interface ProjectContextType {
  project: Project;
  loading: boolean;
  error: string | null;
  saveProject: (updatedProject?: Project) => Promise<boolean>;
  updateProject: (updatedProject: Project) => void;
  addBook: (book: Book) => Book | undefined;
  updateBook: (bookSlug: string, updatedBook: Partial<Book>) => void;
  addChapter: (bookSlug: string, chapter: Chapter) => Chapter | undefined;
  updateChapter: (
    bookSlug: string,
    chapterSlug: string,
    updatedChapter: Partial<Chapter>
  ) => void;
  addEntity: (entity: Entity) => Entity | undefined;
  updateEntity: (entitySlug: string, updatedEntity: Partial<Entity>) => void;
  getBook: (bookSlug: string) => Book | null;
  getChapter: (bookSlug: string, chapterSlug: string) => Chapter | null;
  getEntity: (entitySlug: string) => Entity | null;

  hasUnsavedChanges: boolean;
}

// 2. Context Oluşturuluyor
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// 3. Provider Bileşeni
interface ProjectProviderProps {
  projectSlug: string; // Artık projectSlug bir prop olarak alınıyor
  children: React.ReactNode;
}

export function ProjectProvider({ projectSlug, children }: ProjectProviderProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null);
  const router = useRouter(); // router here is fine for potential future navigation logic within the provider
  const { toast } = useToast();
  const { saveAutosave, deleteAutosave } = useAutosave();

  const { isElectron } = useApplication();

  // Get the appropriate adapter based on platform
  const getAdapter = useCallback(() => {
    return isElectron ? new ElectronFileAdapter() : new LocalStorageAdapter();
  }, [isElectron]);

  // Load project
  const loadProject = useCallback(async () => {
    console.log("Loading project:", projectSlug);
    if (!projectSlug) return;

    setLoading(true);
    setError(null);

    try {
      const adapter = getAdapter();
      console.log("Loading project:", projectSlug, "type: ", adapter.type);
      const loadedProject = await adapter.loadProject(projectSlug);
      if (loadedProject) {
        setProject(loadedProject);
      } else {
        setError("Project not found");
      }
    } catch (err) {
      console.error("Error loading project:", err);
      setError("Error loading project");
    } finally {
      setLoading(false);
    }
  }, [projectSlug, getAdapter]);

  // Save project
  const saveProject = useCallback(
    async (updatedProject?: Project) => {
      const projectToSave = updatedProject || project;
      if (!projectToSave) return false;

      try {
        const adapter = getAdapter();
        const success = await adapter.saveProject(projectToSave);
        if (success) {
          // Update local state if we saved a different project
          if (updatedProject) {
            setProject(updatedProject);
          }

          setLastSaveTime(projectToSave.updatedAt)

          // Delete any autosave when manually saving (only in browser mode)
          if (!isElectron) {
            deleteAutosave(projectToSave.slug);
          }

          toast({
            title: "Proje kaydedildi",
            description: isElectron
              ? "Proje dosya sistemine kaydedildi."
              : "Proje tarayıcı depolamasına kaydedildi.",
          });

          return true;
        } else {
          throw new Error("Proje kaydedilemedi");
        }
      } catch (err) {
        console.error("Error saving project:", err);

        toast({
          title: "Proje kaydetme hatası",
          description:
            "Projenizi kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.",
          variant: "destructive",
        });

        return false;
      }
    },
    [project, toast, deleteAutosave, getAdapter, isElectron]
  );

  // Update project
  const updateProject = useCallback(
    (updatedProject: Project) => {
      setProject(updatedProject);
      // Autosave on update (only in browser mode)
      if (!isElectron) {
        saveAutosave(updatedProject);
      }
    },
    [saveAutosave, isElectron]
  );

  // Add book
  const addBook = useCallback(
    (book: Book) => {
      if (!project) return;

      const updatedProject = {
        ...project,
        books: [...project.books, book],
        updatedAt: new Date().toISOString(),
      };

      setProject(updatedProject);
      if (!isElectron) {
        saveAutosave(updatedProject);
      }

      return book;
    },
    [project, saveAutosave, isElectron]
  );

  // Update book
  const updateBook = useCallback(
    (bookSlug: string, updatedBook: Partial<Book>) => {
      if (!project) return;

      const updatedBooks = project.books.map((book) =>
        book.slug === bookSlug ? { ...book, ...updatedBook } : book
      );

      const updatedProject = {
        ...project,
        books: updatedBooks,
        updatedAt: new Date().toISOString(),
      };

      setProject(updatedProject);
      if (!isElectron) {
        saveAutosave(updatedProject);
      }
    },
    [project, saveAutosave, isElectron]
  );

  // Add chapter
  const addChapter = useCallback(
    (bookSlug: string, chapter: Chapter) => {
      if (!project) return;

      const updatedBooks = project.books.map((book) => {
        if (book.slug === bookSlug) {
          return {
            ...book,
            chapters: [...book.chapters, chapter],
          };
        }
        return book;
      });

      const updatedProject = {
        ...project,
        books: updatedBooks,
        updatedAt: new Date().toISOString(),
      };

      setProject(updatedProject);
      if (!isElectron) {
        saveAutosave(updatedProject);
      }

      return chapter;
    },
    [project, saveAutosave, isElectron]
  );

  // Update chapter
  const updateChapter = useCallback(
    (bookSlug: string, chapterSlug: string, updatedChapter: Partial<Chapter>) => {
      if (!project) return;

      const updatedBooks = project.books.map((book) => {
        if (book.slug === bookSlug) {
          const updatedChapters = book.chapters.map((chapter) =>
            chapter.slug === chapterSlug ? { ...chapter, ...updatedChapter } : chapter
          );
          return {
            ...book,
            chapters: updatedChapters,
          };
        }
        return book;
      });

      const updatedProject = {
        ...project,
        books: updatedBooks,
        updatedAt: new Date().toISOString(),
      };

      setProject(updatedProject);
      if (!isElectron) {
        saveAutosave(updatedProject);
      }
    },
    [project, saveAutosave, isElectron]
  );

  // Add entity
  const addEntity = useCallback(
    (entity: Entity) => {
      if (!project) return;

      const updatedProject = {
        ...project,
        entities: [...project.entities, entity],
        updatedAt: new Date().toISOString(),
      };

      setProject(updatedProject);
      if (!isElectron) {
        saveAutosave(updatedProject);
      }

      return entity;
    },
    [project, saveAutosave, isElectron]
  );

  // Update entity
  const updateEntity = useCallback(
    (entitySlug: string, updatedEntity: Partial<Entity>) => {
      if (!project) return;

      const updatedEntities = project.entities.map((entity) =>
        entity.slug === entitySlug ? { ...entity, ...updatedEntity } : entity
      );

      const updatedProject = {
        ...project,
        entities: updatedEntities,
        updatedAt: new Date().toISOString(),
      };

      setProject(updatedProject);
      if (!isElectron) {
        saveAutosave(updatedProject);
      }
    },
    [project, saveAutosave, isElectron]
  );

  // Get book by ID
  const getBook = useCallback(
    (bookSlug: string) => {
      if (!project) return null;
      return project.books.find((book) => book.slug === bookSlug) || null;
    },
    [project]
  );

  // Get chapter by ID
  const getChapter = useCallback(
    (bookSlug: string, chapterSlug: string) => {
      if (!project) return null;
      const book = project.books.find((book) => book.slug === bookSlug);
      if (!book) return null;
      return book.chapters.find((chapter) => chapter.slug === chapterSlug) || null;
    },
    [project]
  );

  // Get entity by ID
  const getEntity = useCallback(
    (entitySlug: string) => {
      if (!project) return null;
      return project.entities.find((entity) => entity.slug === entitySlug) || null;
    },
    [project]
  );

  // Load project on mount or when projectSlug changes
  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const hasUnsavedChanges = lastSaveTime !== project?.updatedAt;

  // Tüm değerleri memoize ediyoruz ki gereksiz render'lar önlensin
  const contextValue = useMemo(
    () => ({
      project: project!,
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
      hasUnsavedChanges,
    }),
    [
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
      hasUnsavedChanges,
    ]
  );

  return !project ? (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-gray-900"></div>
      <button
        className="hidden mt-4 px-4 py-2 bg-red-500 text-white rounded"
        id="reload-button"
        onClick={() => window.location.reload()}
      >
        Tekrar Yükle
      </button>
      <script>
        {`
          setTimeout(() => {
            document.getElementById('reload-button').classList.remove('hidden');
          }, 300000); // 5 minutes in milliseconds
        `}
      </script>
    </div>
  ) : (
    <ProjectContext.Provider value={contextValue}>
      {children}
      </ProjectContext.Provider >
    )
}

// 4. Consumer Hook (Artık bu hook, eski useProject'in yerini alıyor)
export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
