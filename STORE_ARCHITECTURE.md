# Store Architecture Documentation

## Overview

BookCrafter uses Zustand stores + React Query for state management, with a hybrid file adapter system for persistence.

## Current Store System

### 1. Current Project Store (`useCurrentProjectStore`)

**Purpose**: Manages the currently loaded project's metadata and state

**State** (Route: `/[slug]`):
- `metadata: ProjectMetadata` - Current project metadata (**never null** when route is active)
- `loading: boolean` - Loading state
- `error: string | null` - Error messages

**Actions**:
- `setMetadata(metadata)` - Set current project metadata
- `updateMetadata(updates)` - Update project metadata
- `setLoading(loading)` - Set loading state
- `setError(error)` - Set error message

**Status**: ✅ Complete - **Type safety improved**: no null checks needed in components

### 2. Projects Management (`useProjects` hook)

**Purpose**: Manages the list of all projects, creation, and deletion operations

**Features**:
- ✅ Load project metadata list directly
- ✅ Create new projects with proper structure
- ✅ Delete existing projects
- ❌ **Missing**: Create development fake projects with sample data (2 entities, 2 books, 2 chapters each)

**Status**: ⚠️ Mostly complete - missing fake project generation feature

### 3. Current Book Store (`useCurrentBookStore`)

**Purpose**: Manages currently selected book and its chapters

**State** (Route: `/[slug]/books/[bookSlug]`):
- `book: Book` - Current book (**never null** when route is active)
- `chapters: Chapter[]` - Chapters of current book
- `loading: boolean` - Loading state
- `error: string | null` - Error messages

**Actions**:
- `setBook(book)` - Set current book
- `updateBook(updates)` - Update book data
- `setChapters(chapters)` - Set chapters array
- `addChapter(chapter)` - Add new chapter
- `updateChapter(slug, updates)` - Update specific chapter
- `removeChapter(slug)` - Remove chapter
- `getChapter(slug)` - Get chapter by slug

**Status**: ✅ Complete - **Type safety improved**: no null checks needed in components

### 4. Current Chapter Store (`useCurrentChapterStore`)

**Purpose**: Manages currently edited chapter content and state

**State** (Route: `/[slug]/books/[bookSlug]/chapters/[chapterSlug]`):
- `chapter: Chapter` - Current chapter metadata (**never null** when route is active)
- `content: string` - Chapter content
- `originalContent: string` - Original content for comparison
- `hasUnsavedChanges: boolean` - Unsaved changes flag
- `isSaving: boolean` - Saving state
- `lastSaveTime: string | null` - Last save timestamp
- `error: string | null` - Error messages

**Actions**:
- `setChapter(chapter)` - Set current chapter
- `setContent(content)` - Update content and detect changes
- `updateChapter(updates)` - Update chapter metadata
- `setSaving(isSaving)` - Set saving state
- `setLastSaveTime(time)` - Update last save time
- `markContentAsSaved()` - Mark content as saved

**Status**: ✅ Complete - **Type safety improved**: no null checks needed in components

### 5. Current Entity Store (`useCurrentEntityStore`)

**Purpose**: Manages currently viewed/edited entity state

**State** (Route: `/[slug]/entities/[entitySlug]`):
- `entity: Entity` - Current entity (**never null** when route is active)
- `loading: boolean` - Loading state
- `error: string | null` - Error messages

**Actions**:
- `setEntity(entity)` - Set current entity
- `updateEntity(updates)` - Update entity data
- `setLoading(loading)` - Set loading state
- `setError(error)` - Set error message

**Status**: ✅ Complete - **Type safety improved**: no null checks needed in components

### 6. Entities Store (`useEntitiesStore`)

**Purpose**: Manages all project entities (characters, locations, items, events)
**State**:

- `entities: Entity[]` - All entities array
- `loading: boolean` - Loading state
- `error: string | null` - Error messages

**Actions**:

- `setEntities(entities)` - Set entities array
- `addEntity(entity)` - Add new entity
- `updateEntity(slug, updates)` - Update entity
- `removeEntity(slug)` - Remove entity
- `getEntity(slug)` - Get entity by slug
- `getEntitiesByType(type)` - Get entities by type

**Status**: ✅ Complete

### 7. UI Store (`useUIStore`)

**Purpose**: Manages UI state like editor interactions
**State**:

- `selectedText: string` - Currently selected text
- `showEntitySuggestions: boolean` - Show entity autocomplete
- `entitySearchTerm: string` - Search term for entities
- `selectedEntityIndex: number` - Selected suggestion index

**Status**: ✅ Complete

## React Query Hooks

### Project Queries (`hooks/queries/use-project-query.ts`)

- `useProjectsQuery()` - Load all projects list
- `useProjectQuery(slug)` - Load full project data
- `useSaveProjectMutation()` - Save project
- `useDeleteProjectMutation()` - Delete project

**Status**: ✅ Complete

### Chapter Queries (`hooks/queries/use-chapter-query.ts`)

- `useChapterContentQuery(projectSlug, bookId, chapterId)` - Load chapter content
- `useSaveChapterMutation()` - Save chapter content
- `useSaveBookMetadataMutation()` - Save book metadata
- `useDebouncedChapterSave()` - Debounced chapter saving

**Status**: ⚠️ Incomplete (missing useCallback import)

### Custom Hooks (`hooks/use-projects.ts`)

- `useProjects()` - Legacy project management hook
- Provides: `createProject()`, `deleteProject()`, `loadProjects()`

**Status**: ✅ Complete

## Adapter System

### Current Implementation

**File**: `lib/file-adapters/hybrid-file-adapter.ts`
**Purpose**: Route to appropriate adapter based on environment

```typescript
class HybridFileAdapter implements FileSystemAdapter {
	private isElectron: boolean;
	private electronAdapter?: ElectronFileAdapter;
	private webAdapter?: WebFileAdapter; // ❌ MISSING!
}
```

### Adapter Interface (`FileSystemAdapter`)

```typescript
interface FileSystemAdapter {
	// Project operations
	saveProject: (project: Project) => Promise<boolean>;
	loadProject: (slug: string) => Promise<Project | null>;
	getProjects: () => Promise<ProjectMetadata[]>;
	deleteProject: (slug: string) => Promise<boolean>;

	// Incremental operations
	saveChapter: (
		projectSlug: string,
		bookId: string,
		chapterId: string,
		content: string
	) => Promise<boolean>;
	loadChapter: (
		projectSlug: string,
		bookId: string,
		chapterId: string
	) => Promise<string | null>;
	saveBookMetadata: (
		projectSlug: string,
		bookId: string,
		metadata: BookMetadata
	) => Promise<boolean>;
	saveEntityMetadata: (
		projectSlug: string,
		entityId: string,
		metadata: EntityMetadata
	) => Promise<boolean>;

	// Structure operations
	loadProjectStructure: (
		projectSlug: string
	) => Promise<ProjectStructure | null>;
}
```

### Available Adapters

1. **ElectronFileAdapter** - ✅ Complete (for Electron app)
2. **LocalStorageAdapter** - ❓ Status unknown (for web browser)
3. **JsonFileAdapter** - ❓ Status unknown
4. **CompressedFileAdapter** - ❓ Status unknown
5. **DirectorySyncAdapter** - ❓ Status unknown
6. **WebFileAdapter** - ❌ MISSING! (needed by HybridFileAdapter)

## Critical Missing Pieces

### 1. WebFileAdapter Class

The `HybridFileAdapter` tries to instantiate `WebFileAdapter` but this class doesn't exist.
**Location**: Should be in `lib/file-adapters/web-file-adapter.ts`
**Purpose**: Handle web-based file operations (probably delegate to LocalStorageAdapter)

### 2. Data Synchronization

Stores are isolated - no automatic sync between:

- Project data loaded via React Query
- Individual store states
- File adapter persistence

### 3. CRUD Operations Integration

Many components still have placeholder TODO comments for:

- Save operations
- Entity updates
- Chapter content persistence
- Unsaved changes detection

### 4. Error Boundary

No error handling for failed adapter operations or store state corruption.

## Next Steps

1. **Create WebFileAdapter** - Implement missing adapter class
2. **Fix Runtime Errors** - Resolve `useShallow` and other import issues
3. **Integrate Data Flow** - Connect stores with React Query and adapters
4. **Implement Save Operations** - Complete all CRUD functionality
5. **Add Error Handling** - Robust error boundaries and user feedback
6. **Test Adapter Switching** - Ensure Electron vs Web detection works

## Store Files & Paths

### Store Files:
- **Current Project**: `/lib/stores/project-store.ts`
- **Current Book**: `/lib/stores/current-book-store.ts` 
- **Current Chapter**: `/lib/stores/current-chapter-store.ts`
- **Current Entity**: `/lib/stores/current-entity-store.ts`
- **Entities List**: `/lib/stores/entities-store.ts`
- **UI State**: `/lib/stores/ui-store.ts`
- **Index**: `/lib/stores/index.ts`

### Query Hooks:
- **Project Operations**: `/hooks/queries/use-project-query.ts`
- **Chapter Operations**: `/hooks/queries/use-chapter-query.ts` ✅ **Extended**
- **Entities Operations**: `/hooks/queries/use-entity-query.ts` ✅ **Complete**
- **Books Operations**: `/hooks/queries/use-book-query.ts` ✅ **Complete**

### Action Hooks (Store + Persistence Integration):
- **Entity Actions**: `/hooks/use-entities-actions.ts` ✅ **Complete**
- **Book Actions**: `/hooks/use-book-actions.ts` ✅ **Complete**  
- **Chapter Actions**: `/hooks/use-chapter-actions.ts` ✅ **Complete**

### File Adapters:
- **Main Interface**: `/lib/file-adapters/hybrid-file-adapter.ts`
- **Types**: `/lib/types/file-system.ts`

## 🚧 CRITICAL MISSING PERSISTENCE OPERATIONS

### ❌ **Phase 1: Entity CRUD Operations**
**File**: `hooks/queries/use-entity-query.ts` (TO CREATE)

**Missing Mutations:**
```typescript
// 1. Add Entity
useAddEntityMutation() 
// Input: Entity → Output: Update stores + file system

// 2. Update Entity  
useUpdateEntityMutation()
// Input: entitySlug, updates → Output: Update stores + file system

// 3. Delete Entity
useDeleteEntityMutation() 
// Input: entitySlug → Output: Update stores + file system

// 4. Autosave Entity
useDebouncedEntitySave()
// Auto-save entity changes with debouncing
```

### ❌ **Phase 2: Book CRUD Operations**
**File**: `hooks/queries/use-book-query.ts` (TO CREATE)

**Missing Mutations:**
```typescript
// 1. Add Book
useAddBookMutation()
// Input: Book → Output: Create book structure + Update stores

// 2. Update Book
useUpdateBookMutation() 
// Input: bookSlug, updates → Output: Update stores + metadata

// 3. Delete Book  
useDeleteBookMutation()
// Input: bookSlug → Output: Delete book + chapters + Update stores

// 4. Load Book with Chapters
useBookWithChaptersQuery()
// Load complete book data including chapters
```

### ❌ **Phase 3: Chapter CRUD Operations** 
**File**: `hooks/queries/use-chapter-query.ts` (EXTEND EXISTING)

**Missing Mutations:**
```typescript
// 1. Add Chapter ❌ MISSING
useAddChapterMutation()
// Input: Chapter → Output: Create chapter files + Update stores

// 2. Delete Chapter ❌ MISSING  
useDeleteChapterMutation()
// Input: chapterSlug → Output: Delete chapter files + Update stores

// 3. Reorder Chapters ❌ MISSING
useReorderChaptersMutation()
// Input: bookSlug, newOrder → Output: Update chapter numbers
```

### ❌ **Phase 4: Autosave Integration**
**Files**: All store files (EXTEND)

**Missing Autosave:**
```typescript
// 1. Entity Autosave
// Auto-save entity property changes

// 2. Book Metadata Autosave  
// Auto-save book title, description changes

// 3. Chapter Metadata Autosave
// Auto-save chapter title, description changes

// 4. Global Unsaved Changes Detection
// Track unsaved changes across all stores
```

### ❌ **Phase 5: Store-Mutation Integration**
**Files**: All store files (EXTEND)

**Missing Integration:**
```typescript
// Current: Store actions only update local state
addEntity: (entity) => set(state => ({ entities: [...state.entities, entity] }))

// Required: Store actions trigger mutations
addEntity: (entity) => {
  // 1. Update local state
  // 2. Trigger mutation to persist
  // 3. Handle loading/error states
}
```

## 🎯 Implementation Priority

### **High Priority (Phase 1-2)**
1. **Entity Operations** - Most used feature
2. **Chapter Add/Delete** - Basic content creation  
3. **Autosave Chapter Content** - Data loss prevention

### **Medium Priority (Phase 3-4)**  
4. **Book Operations** - Project structure management
5. **Entity Autosave** - User experience improvement
6. **Unsaved Changes Detection** - Data loss prevention

### **Low Priority (Phase 5)**
7. **Store-Mutation Deep Integration** - Architecture cleanup
8. **Advanced Features** - Chapter reordering, etc.

## Data Flow Architecture

```
UI Components
     ↕️
Zustand Stores (Local State) ❌ Missing: Mutation triggers
     ↕️  
React Query (Cache & Mutations) ❌ Missing: Entity/Book mutations
     ↕️
HybridFileAdapter (Router) ✅ Available: All CRUD methods
     ↕️
Specific Adapters (LocalStorage/Electron/etc) ✅ Working
     ↕️
Persistence Layer (Files/LocalStorage/etc) ✅ Working
```

**Current Status**: ✅ **COMPLETE** - Full bidirectional data flow with automatic persistence.

## ✅ Implementation Complete!

### **What's Now Available:**

#### **1. Complete CRUD Mutations** 
- ✅ **Entities**: Add, Update, Delete + Autosave
- ✅ **Books**: Add, Update, Delete + Metadata autosave  
- ✅ **Chapters**: Add, Update, Delete + Content autosave

#### **2. Persistence Integration**
- ✅ **File System**: All operations persist via HybridFileAdapter
- ✅ **Optimistic Updates**: UI updates immediately, then persists
- ✅ **Error Handling**: Failed operations rollback automatically
- ✅ **Loading States**: Real-time feedback for all operations

#### **3. Autosave Features**
- ✅ **Chapter Content**: 1.5s debounced autosave in editor
- ✅ **Entity Properties**: 2s debounced autosave for all changes
- ✅ **Book Metadata**: 2s debounced autosave for title/description

#### **4. Store Integration**
- ✅ **Action Hooks**: Seamless store + mutation integration
- ✅ **Cache Management**: React Query cache sync with stores
- ✅ **Type Safety**: No null checks needed in components

### **How to Use:**

```typescript
// Entity operations with automatic persistence
const { addEntity, updateEntity, deleteEntity } = useEntitiesActions(projectSlug)

// Book operations with automatic persistence  
const { addBook, updateBook, deleteBook } = useBookActions(projectSlug)

// Chapter operations with automatic persistence
const { addChapter, updateChapter, deleteChapter } = useChapterActions(projectSlug)

// Autosave hooks for real-time saving
const { save: saveEntity } = useDebouncedEntitySave(projectSlug, entitySlug)
const { save: saveChapter } = useDebouncedChapterSave(projectSlug, bookId, chapterId)
```

### **Architecture Benefits:**
- 🚀 **Performance**: Optimistic updates + debounced persistence
- 🔒 **Reliability**: Automatic error handling and rollback
- 🎯 **Developer Experience**: Simple API, type-safe operations
- 📱 **User Experience**: Real-time saving, no data loss
