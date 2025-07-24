"use client";

import { ProjectLoadingState } from "@/components/project-loading-state";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { useAutosave } from "@/hooks/use-autosave";
import { ElectronFileAdapter } from "@/lib/adapters/electron-file-adapter";
import { LocalStorageAdapter } from "@/lib/adapters/local-storage-adapter";
import type {
  AISettings,
  Book,
  Chapter,
  Entity,
  Project,
  ProjectContextType,
  ProjectImage,
  ProjectMetadata
} from "@/lib/types";
import { useApplication } from "@/providers/application-provider";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Context creation
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Provider Props
interface ProjectProviderProps {
  projectSlug: string;
  children: React.ReactNode;
}

export function ProjectProvider({ children, projectSlug }: ProjectProviderProps) {
  // Separate state variables
  const [projectMetadata, setProjectMetadata] = useState<ProjectMetadata | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [aiSettings, setAISettings] = useState<AISettings | undefined>(undefined);

  // Utility states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null);

  const { t } = useLanguage();
  const { toast } = useToast();
  const { deleteAutosave, saveAutosave } = useAutosave();
  const { isElectron } = useApplication();

  // Adapter selection
  const getAdapter = useCallback(() => {
    return isElectron ? new ElectronFileAdapter() : new LocalStorageAdapter();
  }, [isElectron]);

  // Metadata update helper
  const updateMetadataTimestamp = useCallback(() => {
    if (projectMetadata) {
      const updatedMetadata = {
        ...projectMetadata,
        updatedAt: new Date().toISOString(),
      };
      setProjectMetadata(updatedMetadata);
      return updatedMetadata;
    }
    return null;
  }, [projectMetadata]);

  // Flattened save format creation
  const createSaveFormat = useCallback((): Project | null => {
    if (!projectMetadata) return null;

    return {
      aiSettings,
      books,
      chapters,
      entities,
      images,
      metadata: projectMetadata,
    } satisfies Project;
  }, [projectMetadata, aiSettings, books, chapters, entities, images]);

  // Stable autosave function (not wrapped in useCallback to avoid dependency issues)
  const triggerAutosave = useRef(() => {
    if (!isElectron) {
      const saveData = createSaveFormat();
      if (saveData) {
        saveAutosave(saveData as Project);
      }
    }
  });

  // Update the ref when dependencies change
  useEffect(() => {
    triggerAutosave.current = () => {
      if (!isElectron) {
        const saveData = createSaveFormat();
        if (saveData) {
          saveAutosave(saveData as Project);
        }
      }
    };
  }, [isElectron, createSaveFormat, saveAutosave]);

  // Debounced autosave
  const debouncedAutosave = useMemo(
    () => debounce(() => triggerAutosave.current(), 1000), // Wait 1 second
    []
  );

  // Project loading
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
        setProjectMetadata(loadedProject.metadata);
        setBooks(loadedProject.books || []);
        setChapters(loadedProject.chapters || []);
        setEntities(loadedProject.entities || []);
        setImages(loadedProject.images || []);
        setAISettings(loadedProject.aiSettings);
        setLastSaveTime(loadedProject.metadata.updatedAt);
      } else {
        setError(t("project_load_failed"));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error loading project:", err);
      setError(t("project_load_failed"));

      toast({
        description: errorMessage,
        title: t("project_loading_error"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [projectSlug, getAdapter, t, toast]);

  // Project saving
  const saveProject = useCallback(async () => {
    const saveData = createSaveFormat();
    if (!saveData) return false;

    try {
      const adapter = getAdapter();
      const success = await adapter.saveProject(saveData);

      if (success) {
        setLastSaveTime(saveData.metadata.updatedAt);

        // Clean autosave (browser mode only)
        if (!isElectron) {
          deleteAutosave(saveData.metadata.slug);
        }

        toast({
          description: isElectron
            ? t("project_saved_electron")
            : t("project_saved_browser"),
          title: t("project_saved"),
        });

        return true;
      } else {
        throw new Error("Project save failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error saving project:", errorMessage);
      toast({
        description: t("project_save_failed"),
        title: t("project_save_error"),
        variant: "destructive",
      });
      return false;
    }
  }, [createSaveFormat, getAdapter, isElectron, deleteAutosave, toast, t]);

  // Project Metadata Operations
  const updateProjectMetadata = useCallback((updatedMetadata: Partial<ProjectMetadata>) => {
    if (!projectMetadata) return;

    const newMetadata = {
      ...projectMetadata,
      ...updatedMetadata,
      updatedAt: new Date().toISOString(),
    };

    setProjectMetadata(newMetadata);
    debouncedAutosave();
  }, [projectMetadata, debouncedAutosave]);

  // Book Operations
  const addBook = useCallback((book: Book) => {
    setBooks(prev => [...prev, book]);
    updateMetadataTimestamp();
    debouncedAutosave();
    return book;
  }, [updateMetadataTimestamp, debouncedAutosave]);

  const updateBook = useCallback((bookSlug: string, updatedBook: Partial<Book>) => {
    setBooks(prev => prev.map(book =>
      book.slug === bookSlug ? { ...book, ...updatedBook } : book
    ));
    updateMetadataTimestamp();
    debouncedAutosave();
  }, [updateMetadataTimestamp, debouncedAutosave]);

  const deleteBook = useCallback((bookSlug: string) => {
    const chaptersToDelete = chapters.filter(chapter => chapter.bookSlug === bookSlug);
    const chapterSlugs = chaptersToDelete.map(chapter => chapter.slug);

    // Delete book
    setBooks(prev => prev.filter(book => book.slug !== bookSlug));

    // Delete related chapters
    setChapters(prev => prev.filter(chapter => chapter.bookSlug !== bookSlug));

    // Clean book and chapter references from entities' usages
    setEntities(prev => prev.map(entity => ({
      ...entity,
      usages: entity.usages?.filter(usage =>
        usage.bookSlug !== bookSlug && !chapterSlugs.includes(usage.chapterSlug)
      ) || []
    })));

    // Notify user
    toast({
      title: t("book_deleted_with_chapters", { count: chaptersToDelete.length }),
      variant: "default",
    });

    updateMetadataTimestamp();
    debouncedAutosave();
  }, [chapters, updateMetadataTimestamp, debouncedAutosave, toast, t]);

  const getBook = useCallback((bookSlug: string) => {
    return books.find(book => book.slug === bookSlug) || null;
  }, [books]);

  // Chapter Operations
  const addChapter = useCallback((chapter: Chapter) => {
    if (!chapter.bookSlug)
      throw new Error("Chapter must have a book slug");

    setChapters(prev => [...prev, chapter]);
    updateMetadataTimestamp();
    debouncedAutosave();

    toast({
      description: t("chapter_created_description", { title: chapter.title }),
      title: t("chapter_created"),
      variant: "success",
    });

    return chapter;
  }, [updateMetadataTimestamp, debouncedAutosave, toast, t]);

  const updateChapter = useCallback((bookSlug: string, chapterSlug: string, updatedChapter: Partial<Chapter>) => {
    setChapters(prev => prev.map(chapter =>
      chapter.slug === chapterSlug && chapter.bookSlug === bookSlug ? { ...chapter, ...updatedChapter } : chapter
    ));
    updateMetadataTimestamp();
    debouncedAutosave();
  }, [updateMetadataTimestamp, debouncedAutosave]);

  const deleteChapter = useCallback((bookSlug: string, chapterSlug: string) => {
    setChapters(prev =>
      prev.filter(chapter => chapter.slug !== chapterSlug && chapter.bookSlug !== bookSlug));

    // Clean chapter references from entities' usages
    setEntities(prev => prev.map(entity => ({
      ...entity,
      usages: entity.usages?.filter(usage => usage.chapterSlug !== chapterSlug) || []
    })));

    updateMetadataTimestamp();
    debouncedAutosave();
  }, [updateMetadataTimestamp, debouncedAutosave]);

  const getChapter = useCallback((bookSlug: string, chapterSlug: string) => {
    return chapters.find(chapter => chapter.slug === chapterSlug && chapter.bookSlug === bookSlug) || null;
  }, [chapters]);

  const getChaptersForBook = useCallback((bookSlug: string) => {
    return chapters.filter(chapter => chapter.bookSlug === bookSlug) || [];
  }, [chapters]);

  // Entity Operations
  const addEntity = useCallback((entity: Entity) => {
    setEntities(prev => [...prev, entity]);
    updateMetadataTimestamp();
    debouncedAutosave();
    return entity;
  }, [updateMetadataTimestamp, debouncedAutosave]);

  const updateEntity = useCallback((entitySlug: string, updatedEntity: Partial<Entity>) => {
    setEntities(prev => prev.map(entity =>
      entity.slug === entitySlug ? { ...entity, ...updatedEntity } : entity
    ));
    updateMetadataTimestamp();
    debouncedAutosave();
  }, [updateMetadataTimestamp, debouncedAutosave]);

  const deleteEntity = useCallback((entitySlug: string) => {
    // Delete entity
    setEntities(prev => prev.filter(entity => entity.slug !== entitySlug));

    // Clean entity references from other entities' usages
    setEntities(prev => prev.map(entity => ({
      ...entity,
      usages: entity.usages?.filter(usage =>
        !(usage.bookSlug && usage.chapterSlug) // Keep only valid usages
      ) || []
    })));

    toast({
      description: t("entity_references_cleaned"),
      title: t("entity_deleted"),
    });

    updateMetadataTimestamp();
    debouncedAutosave();
  }, [updateMetadataTimestamp, debouncedAutosave, toast, t]);

  const getEntity = useCallback((entitySlug: string) => {
    return entities.find(entity => entity.slug === entitySlug) || null;
  }, [entities]);

  // Image Operations
  const addProjectImage = useCallback((image: ProjectImage) => {
    setImages(prev => [...prev, image]);
    updateMetadataTimestamp();
    debouncedAutosave();
    return image;
  }, [updateMetadataTimestamp, debouncedAutosave]);

  const updateProjectImage = useCallback((imageId: string, updatedImage: Partial<ProjectImage>) => {
    setImages(prev => prev.map(image =>
      image.id === imageId ? { ...image, ...updatedImage } : image
    ));
    updateMetadataTimestamp();
    debouncedAutosave();
  }, [updateMetadataTimestamp, debouncedAutosave]);

  const deleteProjectImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(image => image.id !== imageId));

    // Clean image references
    if (projectMetadata?.coverImageId === imageId) {
      setProjectMetadata(prev => prev ? { ...prev, coverImageId: undefined } : null);
    }
    if (projectMetadata?.backgroundImageId === imageId) {
      setProjectMetadata(prev => prev ? { ...prev, backgroundImageId: undefined } : null);
    }

    // Remove from entities' imageIds
    setEntities(prev => prev.map(entity => ({
      ...entity,
      imageIds: entity.imageIds?.filter(id => id !== imageId)
    })));

    // Remove from chapters' imageIds
    setChapters(prev => prev.map(chapter => ({
      ...chapter,
      imageIds: chapter.imageIds?.filter(id => id !== imageId)
    })));

    toast({
      description: t("image_references_cleaned"),
      title: t("image_deleted"),
    });

    updateMetadataTimestamp();
    debouncedAutosave();
  }, [projectMetadata, updateMetadataTimestamp, debouncedAutosave, toast, t]);

  const getProjectImage = useCallback((imageId: string) => {
    return images.find(image => image.id === imageId) || null;
  }, [images]);

  // AI Settings Operations
  const updateAISettings = useCallback((settings: AISettings) => {
    setAISettings(settings);
    updateMetadataTimestamp();
    debouncedAutosave();
  }, [updateMetadataTimestamp, debouncedAutosave]);

  // Load project on mount
  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // Change detection
  const hasUnsavedChanges = useMemo(() => {
    return lastSaveTime !== projectMetadata?.updatedAt;
  }, [lastSaveTime, projectMetadata?.updatedAt]);

  // Show loading state if project is not loaded
  if (!projectMetadata) {
    return <ProjectLoadingState error={error} onRetry={loadProject} />;
  }

  // Context value
  const contextValue = {
    addBook,
    addChapter,
    addEntity,
    addProjectImage,
    aiSettings,
    books,
    chapters,
    deleteBook,
    deleteChapter,
    deleteEntity,
    deleteProjectImage,
    entities,
    error,
    getBook,
    getChapter,
    getChaptersForBook,
    getEntity,
    getProjectImage,
    hasUnsavedChanges,
    images,
    lastSaveTime,
    loading,
    project: projectMetadata,
    saveProject,
    setEntities,
    updateAISettings,
    updateBook,
    updateChapter,
    updateEntity,
    updateProjectImage,
    updateProjectMetadata,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

// Consumer Hook
export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
