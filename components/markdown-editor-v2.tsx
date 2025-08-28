"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Save } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useCurrentChapterStore, useEntitiesStore, useUIStore } from "@/lib/stores"
import { useDebouncedChapterSave } from "@/hooks/queries/use-chapter-query"
import { Entity } from "@/lib/types"
import { EntityBadgesList } from "./entity-badges-list"
import { AIPromptDropdownV2 } from "./ai-prompt-dropdown-v2"

// Constants
const SUGGESTION_LIMIT = 10
const DROPDOWN_OFFSET = 20
const DEBOUNCE_DELAY = 150
const MIN_SEARCH_LENGTH = 0

interface MarkdownEditorV2Props {
  projectSlug: string
  bookId: string
  chapterId: string
  onProcessedContentChange: (processed: string) => void
}

interface CursorPosition {
  top: number
  left: number
}

interface EntityReference {
  entitySlug: string
  property?: string
}

// Custom hooks
const useClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, callback])
}

const useDebounce = <T = unknown>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function MarkdownEditorV2({
  bookId,
  chapterId,
  onProcessedContentChange,
  projectSlug,
}: MarkdownEditorV2Props) {
  // Zustand stores - selective subscriptions for performance
  const content = useCurrentChapterStore(state => state.content)
  const chapter = useCurrentChapterStore(state => state.chapter)
  const hasUnsavedChanges = useCurrentChapterStore(state => state.hasUnsavedChanges)
  const setContent = useCurrentChapterStore(state => state.setContent)

  const entities = useEntitiesStore(state => state.entities)

  const selectedText = useUIStore(state => state.selectedText)
  const showEntitySuggestions = useUIStore(state => state.showEntitySuggestions)
  const entitySearchTerm = useUIStore(state => state.entitySearchTerm)
  const selectedEntityIndex = useUIStore(state => state.selectedEntityIndex)

  const setSelectedText = useUIStore(state => state.setSelectedText)
  const setShowEntitySuggestions = useUIStore(state => state.setShowEntitySuggestions)
  const setEntitySearchTerm = useUIStore(state => state.setEntitySearchTerm)
  const setSelectedEntityIndex = useUIStore(state => state.setSelectedEntityIndex)

  // Real autosave functionality
  const { save: saveChapter, isSaving, error } = useDebouncedChapterSave(
    projectSlug, 
    bookId, 
    chapterId, 
    1500 // 1.5 second delay
  )

  // Local state
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ left: 0, top: 0 })
  const [entitySuggestions, setEntitySuggestions] = useState<Entity[]>([])

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Debounced search term for better performance
  const debouncedSearchTerm = useDebounce(entitySearchTerm, DEBOUNCE_DELAY)

  // Click outside to close suggestions
  useClickOutside(suggestionsRef, () => {
    setShowEntitySuggestions(false)
  })

  // Memoized entity regex patterns for better performance
  const entityRegexPatterns = useMemo(() => {
    if (!entities) return []

    return entities.map(entity => ({
      defaultRegex: new RegExp(`@${entity.slug}\\b`, "g"),
      entity,
      propertyRegexes: entity.properties.map(property => ({
        property,
        regex: new RegExp(`@${entity.slug}\\.${property.name}\\b`, "g")
      }))
    }))
  }, [entities])

  // Memoized filtered entity suggestions
  const filteredEntitySuggestions = useMemo(() => {
    if (!entities || debouncedSearchTerm.length < MIN_SEARCH_LENGTH) {
      return entities?.slice(0, SUGGESTION_LIMIT) || []
    }

    return entities
      .filter(entity =>
        entity.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        entity.slug.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
      .slice(0, SUGGESTION_LIMIT)
  }, [entities, debouncedSearchTerm])

  // Update suggestions when filtered results change
  useEffect(() => {
    setEntitySuggestions(filteredEntitySuggestions)
    setSelectedEntityIndex(0) // Reset selection when suggestions change
  }, [filteredEntitySuggestions, setSelectedEntityIndex])

  // Auto-save content when it changes
  useEffect(() => {
    if (hasUnsavedChanges && content) {
      saveChapter(content)
    }
  }, [content, hasUnsavedChanges, saveChapter])

  // Manual save functionality
  const handleManualSave = useCallback(() => {
    if (content) {
      saveChapter(content)
    }
  }, [content, saveChapter])

  // Process content to replace entity references and apply markdown
  useEffect(() => {
    let processed = content

    // Use memoized regex patterns for better performance
    entityRegexPatterns.forEach(({ defaultRegex, entity, propertyRegexes }) => {
      // Replace @slug with default property
      const defaultProperty = entity.properties.find((p) => p.isDefault)
      if (defaultProperty) {
        processed = processed.replace(defaultRegex, defaultProperty.value)
      }

      // Replace @slug.property with property value
      propertyRegexes.forEach(({ property, regex }) => {
        processed = processed.replace(regex, property.value)
      })
    })

    // Remove comments
    processed = processed.replace(/\/\/.*$/gm, "") // Remove single line comments
    processed = processed.replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments

    onProcessedContentChange(processed)
  }, [content, entityRegexPatterns, onProcessedContentChange])

  const calculateDropdownPosition = useCallback(
    (textarea: HTMLTextAreaElement, atPosition: number): CursorPosition => {
      try {
        const textareaStyle = window.getComputedStyle(textarea)

        // Get text up to the @ symbol
        const textUpToAt = content.substring(0, atPosition)

        // Calculate relative position
        let lineHeight = parseInt(textareaStyle.lineHeight) || 0
        if (!lineHeight || isNaN(lineHeight)) {
          const fontSize = parseInt(textareaStyle.fontSize) || 16
          lineHeight = Math.ceil(fontSize * 1.4)
        }
        const paddingLeft = parseInt(textareaStyle.paddingLeft) || 0
        const paddingTop = parseInt(textareaStyle.paddingTop) || 0

        // Estimate cursor position
        const lines = textUpToAt.split('\n')
        const currentLine = lines.length - 1
        const currentLineText = lines[currentLine] || ''

        const top = (currentLine * lineHeight) + paddingTop + (lineHeight * 3) + DROPDOWN_OFFSET - textarea.scrollTop
        const left = paddingLeft + (currentLineText.length * 8) // Rough character width estimation

        return { left, top }
      } catch (error) {
        console.error('Error calculating dropdown position:', error)
        return { left: 0, top: 30 } // Fallback position
      }
    },
    [content]
  )

  // Handle textarea input with improved @ detection
  const handleTextareaInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)

    const textarea = e.target
    const cursorPos = textarea.selectionStart
    const textBeforeCursor = newContent.substring(0, cursorPos)

    // Find the last @ symbol before cursor
    const lastAtPos = textBeforeCursor.lastIndexOf("@")

    if (lastAtPos !== -1 && lastAtPos < cursorPos) {
      // Check if there's a space or newline between the @ and the cursor
      const textBetweenAtAndCursor = textBeforeCursor.substring(lastAtPos + 1)
      const hasSpaceOrNewline = /[\s\n]/.test(textBetweenAtAndCursor)

      if (!hasSpaceOrNewline) {
        // Set search term for debounced filtering
        setEntitySearchTerm(textBetweenAtAndCursor)

        // Calculate position for suggestions dropdown
        try {
          const position = calculateDropdownPosition(textarea, lastAtPos)
          setCursorPosition(position)
          setShowEntitySuggestions(true)
        } catch (error) {
          console.error('Error showing entity suggestions:', error)
          setShowEntitySuggestions(false)
        }
        return
      }
    }

    // Hide suggestions if no @ or there's a space after @
    setShowEntitySuggestions(false)
    setEntitySearchTerm("")
  }, [setContent, calculateDropdownPosition, setEntitySearchTerm, setShowEntitySuggestions])

  // Handle entity selection from suggestions
  const handleEntitySelect = useCallback((entity: Entity) => {
    if (!textareaRef.current) return

    try {
      const cursorPos = textareaRef.current.selectionStart
      const textBeforeCursor = content.substring(0, cursorPos)
      const lastAtPos = textBeforeCursor.lastIndexOf("@")

      if (lastAtPos !== -1) {
        // Replace the @searchTerm with @entity.slug
        const newContent = content.substring(0, lastAtPos) + `@${entity.slug}` + content.substring(cursorPos)
        setContent(newContent)

        // Set cursor position after the inserted entity reference
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPos = lastAtPos + entity.slug.length + 1
            textareaRef.current.focus()
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
          }
        }, 0)
      }
    } catch (error) {
      console.error('Error selecting entity:', error)
    }

    setShowEntitySuggestions(false)
    setEntitySearchTerm("")
  }, [content, setContent, setShowEntitySuggestions, setEntitySearchTerm])

  // Handle keyboard navigation for entity suggestions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault()
          handleManualSave()
          return
      }
    }

    if (!showEntitySuggestions) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedEntityIndex(prevIndex =>
          prevIndex < entitySuggestions.length - 1 ? prevIndex + 1 : prevIndex
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedEntityIndex(prevIndex => prevIndex > 0 ? prevIndex - 1 : 0)
        break
      case "Enter":
      case "Tab":
        e.preventDefault()
        if (entitySuggestions[selectedEntityIndex]) {
          handleEntitySelect(entitySuggestions[selectedEntityIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setShowEntitySuggestions(false)
        setEntitySearchTerm("")
        break
    }
  }, [showEntitySuggestions, entitySuggestions, selectedEntityIndex, handleEntitySelect, handleManualSave, setSelectedEntityIndex, setShowEntitySuggestions, setEntitySearchTerm])

  // Handle text selection for AI processing
  const handleTextSelection = useCallback(() => {
    if (!textareaRef.current) return

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd

    if (start !== end) {
      setSelectedText(content.substring(start, end))
    } else {
      setSelectedText("")
    }
  }, [content, setSelectedText])

  // Scroll selected entity into view
  useEffect(() => {
    if (showEntitySuggestions && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedEntityIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }
  }, [selectedEntityIndex, showEntitySuggestions])

  // Handle AI text replacement
  const handleTextReplace = useCallback((newText: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd

      if (start !== end) {
        const newContent = content.substring(0, start) + newText + content.substring(end)
        setContent(newContent)

        // Reset selection
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPos = start + newText.length
            textareaRef.current.focus()
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
          }
        }, 0)
      }
    }
  }, [content, setContent])

  return (
    <div className="relative flex flex-col gap-2" ref={editorContainerRef}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">
          Markdown Editor
          {selectedText && (
            <span className="ml-2 text-xs bg-primary/10 px-2 py-1 rounded">
              {selectedText.length} karakter seçili
            </span>
          )}
          {hasUnsavedChanges && (
            <span className="ml-2 text-xs bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded">
              Kaydedilmemiş değişiklikler
            </span>
          )}
        </div>
        <div className="flex flex-row gap-2">
          <Button
            disabled={isSaving}
            onClick={handleManualSave}
            size="icon"
            title="Projeyi Kaydet (Ctrl+S)"
            variant="outline"
          >
            <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
          </Button>
          <AIPromptDropdownV2
            currentChapter={chapter?.title}
            currentContent={content}
            onTextReplace={handleTextReplace}
            selectedText={selectedText}
          />
        </div>
      </div>

      <Textarea
        className="w-full h-[calc(100vh-300px)] min-h-[400px] p-2 font-mono text-sm bg-transparent resize-none focus:outline-hidden"
        onChange={handleTextareaInput}
        onKeyDown={handleKeyDown}
        onMouseUp={handleTextSelection}
        onSelect={handleTextSelection}
        placeholder="Metninizi buraya yazın. @tanımlayıcı veya @tanımlayıcı.özellik formatında öğe referansları kullanabilirsiniz. Markdown formatlaması desteklenir."
        ref={textareaRef}
        value={content}
      />

      <EntityBadgesList entities={entities} />

      {showEntitySuggestions && entitySuggestions.length > 0 && (
        <div
          className="absolute z-10 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto w-64"
          ref={suggestionsRef}
          style={{
            left: `${cursorPosition.left}px`,
            top: `${cursorPosition.top}px`,
          }}
        >
          {entitySuggestions.map((entity, index) => {
            const value = entity.properties.find(p => p.isDefault)?.value
            const trimmedValue = value && value.length > 30 ? value.substring(0, 30) + '...' : value

            return (
              <div
                className={`p-2 cursor-pointer flex items-center gap-1 border-b border-border/50 last:border-b-0 ${index === selectedEntityIndex
                  ? "bg-primary/10 border-primary/20"
                  : "hover:bg-muted/50"
                  }`}
                key={entity.slug}
                onClick={() => handleEntitySelect(entity)}
              >
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    <span className="text-xs text-muted-foreground truncate mr-3">
                      @{entity.slug}
                    </span>
                    {entity.name}
                  </div>
                  {trimmedValue && (
                    <div className="text-xs text-muted-foreground/70 truncate mt-1">
                      {trimmedValue}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">
          Kaydetme hatası: {error.message}
        </div>
      )}
    </div>
  )
}
