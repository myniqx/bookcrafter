"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { Entity } from "@/lib/types"

import { Textarea } from "@/components/ui/textarea"

import { useCurrentChapterStore } from "@/lib/stores"
import { Save } from "lucide-react"
import { AIPromptDropdown } from "./ai-prompt-dropdown"
import { EntityBadgesList } from "./entity-badges-list"
import { Button } from "./ui/button"

// Constants
const SUGGESTION_LIMIT = 10
const DROPDOWN_OFFSET = 20
const DEBOUNCE_DELAY = 150
const MIN_SEARCH_LENGTH = 0

interface MarkdownEditorProps {
  content: string
  currentChapter?: string
  onChange: (content: string) => void
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

// Custom hook for click outside detection
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

// Debounce hook
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

export function MarkdownEditor({
  content,
  currentChapter,
  onChange,
  onProcessedContentChange,
}: MarkdownEditorProps) {
  const { chapter } = useCurrentChapterStore()
  // TODO: Implement full chapter management with new store pattern
  const book = null
  const entities: Entity[] = []
  const saveProject = () => console.warn('Save project not implemented')
  const setEntities = (entities: Entity[]) => console.warn('Set entities not implemented')
  const updateChapter = (updates: any) => console.warn('Update chapter not implemented')

  // State
  const [showEntitySuggestions, setShowEntitySuggestions] = useState(false)
  const [entitySuggestions, setEntitySuggestions] = useState<Entity[]>([])
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ left: 0, top: 0 })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedText, setSelectedText] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Debounced search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY)

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
    setSelectedIndex(0) // Reset selection when suggestions change
  }, [filteredEntitySuggestions])

  // Save functionality with loading state
  const handleSave = useCallback(async () => {
    if (isSaving) return

    try {
      setIsSaving(true)
      updateChapter({ content })

      // Update entity references
      const entityReferences = extractEntityReferences(content, entities || [])
      setEntities(entities => entities?.map((entity) => {
        const references = entityReferences.filter((ref) => ref.entitySlug === entity.slug)

        if (references.length > 0) {
          const updatedUsages = [...(entity.usages || [])]

          // Check if this chapter is already in usages
          const existingUsageIndex = updatedUsages.findIndex(
            (usage) => usage.bookSlug === book.slug && usage.chapterSlug === chapter.slug,
          )

          if (existingUsageIndex >= 0) {
            // Update existing usage
            updatedUsages[existingUsageIndex] = {
              bookSlug: book.slug,
              chapterSlug: chapter.slug,
              count: references.length,
            }
          } else {
            // Add new usage
            updatedUsages.push({
              bookSlug: book.slug,
              chapterSlug: chapter.slug,
              count: references.length,
            })
          }

          return {
            ...entity,
            usages: updatedUsages,
          }
        } else {
          // Remove this chapter from usages if it exists
          const updatedUsages = (entity.usages || []).filter(
            (usage) => !(usage.bookSlug === book.slug && usage.chapterSlug === chapter.slug),
          )

          return {
            ...entity,
            usages: updatedUsages,
          }
        }
      }) || [])

      await saveProject()
    } catch (error) {
      console.error('Error saving project:', error)
    } finally {
      setIsSaving(false)
    }
  }, [content, entities, book.slug, chapter.slug, updateChapter, setEntities, saveProject, isSaving])

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
    onChange(newContent)

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
        setSearchTerm(textBetweenAtAndCursor)

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
    setSearchTerm("")
  }, [onChange, calculateDropdownPosition])

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
        onChange(newContent)

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
    setSearchTerm("")
  }, [content, onChange])

  // Handle keyboard navigation for entity suggestions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault()
          handleSave()
          return
      }
    }

    if (!showEntitySuggestions) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prevIndex) =>
          prevIndex < entitySuggestions.length - 1 ? prevIndex + 1 : prevIndex
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prevIndex) => prevIndex > 0 ? prevIndex - 1 : 0)
        break
      case "Enter":
      case "Tab":
        e.preventDefault()
        if (entitySuggestions[selectedIndex]) {
          handleEntitySelect(entitySuggestions[selectedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setShowEntitySuggestions(false)
        setSearchTerm("")
        break
    }
  }, [showEntitySuggestions, entitySuggestions, selectedIndex, handleEntitySelect, handleSave])

  // Handle text selection for future AI processing
  const handleTextSelection = useCallback(() => {
    if (!textareaRef.current) return

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd

    if (start !== end) {
      setSelectedText(content.substring(start, end))
    } else {
      setSelectedText("")
    }
  }, [content])

  useEffect(() => {
    if (showEntitySuggestions && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }
  }, [selectedIndex, showEntitySuggestions])

  // Handle AI text replacement
  const handleTextReplace = (newText: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd

      if (start !== end) {
        const newContent = content.substring(0, start) + newText + content.substring(end)
        onChange(newContent)

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
  }

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
        </div>
        <div className="flex flex-row gap-2">
          <Button
            disabled={isSaving}
            onClick={handleSave}
            size="icon"
            title="Projeyi Kaydet (Ctrl+S)"
            variant="outline"
          >
            <Save className="h-4 w-4" />
          </Button>
          <AIPromptDropdown
            currentChapter={currentChapter}
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
                className={`p-2 cursor-pointer flex items-center gap-1 border-b border-border/50 last:border-b-0 ${index === selectedIndex
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
    </div>
  )
}

// Helper function to extract entity references from content
function extractEntityReferences(content: string, entities: Entity[]): EntityReference[] {
  const references: EntityReference[] = []

  entities.forEach((entity) => {
    // Match @slug or @slug.property
    const regex = new RegExp(`@${entity.slug}(?:\\.(\\w+))?`, "g")
    let match

    while ((match = regex.exec(content)) !== null) {
      references.push({
        entitySlug: entity.slug,
        property: match[1],
      })
    }
  })

  return references
}
