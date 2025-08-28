# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookCraft is a Next.js-based Electron application for book writing and world building. It helps writers create, organize, and manage book projects, characters, locations, and other entities with AI-powered assistance.

## Development Commands

```bash
# Development
npm run dev                # Start Next.js development server (port 3000)
npm run electron-dev       # Start Electron with hot-reload Next.js app
npm run electron           # Run Electron in development mode

# Building
npm run build              # Build Next.js app for production
npm run build-electron     # Build Next.js + run Electron
npm run dist               # Build and create distributable packages
npm run dist-win           # Build Windows installer
npm run dist-linux         # Build Linux AppImage
npm run dist-mac           # Build macOS DMG

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Run ESLint with auto-fix
```

## Architecture Overview

### Data Layer
- **Storage Adapters** (`lib/adapters/`): Pluggable storage system supporting localStorage, JSON files, compressed files, and directory sync
- **Types** (`lib/types.ts`): Comprehensive TypeScript definitions for Project, Book, Chapter, Entity, and related data structures
- **Provider Pattern**: React context-based state management with `ProjectProvider` as the main data orchestrator

### UI Architecture
- **shadcn/ui components** (`components/ui/`): Reusable UI component library
- **Custom Components** (`components/`): Application-specific components
- **App Router**: Next.js 13+ app directory structure with nested routing
- **Theme System**: Built on next-themes with Tailwind CSS dark mode support

### AI Integration
- **AI Adapters** (`lib/ai/`): Support for OpenAI, Gemini, Anthropic, and Ollama
- **AI Manager**: Centralized AI request handling with context awareness
- **Prompts**: Template-based prompt system for different writing tasks

### Export System
- **Export Adapters** (`lib/export/`): Pluggable export system for PDF, DOCX, EPUB, and JSON formats
- **Export Manager**: Handles export configuration and execution

## Key Technical Patterns

### Entity Reference System
The app uses an `@entity` or `@entity.property` syntax to reference characters, locations, etc. in chapter content. The system tracks entity usage across chapters automatically.

### Flattened Data Structure
- Books contain metadata only
- Chapters are stored separately with `bookSlug` references
- Entities track their usage across book/chapter combinations
- Images are project-scoped with reference IDs

### Autosave & Persistence
- Debounced autosave (1-second delay) for web version
- Real-time saving for Electron version
- Unsaved changes detection based on timestamps
- Multiple storage adapter support

### Provider Architecture
The `ProjectProvider` centralizes all CRUD operations and maintains:
- Separate state for each data type (books, chapters, entities, images)
- Automatic timestamp updates on changes  
- Cascading deletes (book deletion removes chapters and entity references)
- Toast notifications for user feedback

## Development Notes

### Path Aliases
- `@/*` maps to the project root for clean imports

### ESLint Configuration  
- Uses flat config format with TypeScript support
- Includes perfectionist plugin for import/object sorting
- Excludes `components/ui/` (generated shadcn components)

### Electron Integration
- Main process in `electron/main.js`
- Uses `ElectronFileAdapter` for file system operations
- Conditional adapter selection based on environment

### Testing
No test framework is currently configured. When adding tests, check package.json and existing project patterns first.