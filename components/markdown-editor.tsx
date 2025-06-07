"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import type { Entity, Project } from "@/lib/types"

import { Textarea } from "@/components/ui/textarea"

import { AIPromptDropdown } from "./ai-prompt-dropdown"
import { useChapter } from "@/providers/chapter-provider"
import { EntityBadgesList } from "./entity-badges-list"

interface MarkdownEditorProps {
  content: string
  project: Project
  currentChapter?: string
  onChange: (content: string) => void
  onProcessedContentChange: (processed: string) => void
}

export function MarkdownEditor({
  content,
  currentChapter,
  onChange,
  onProcessedContentChange,
  project,
}: MarkdownEditorProps) {
  const { book, chapter, entities } = useChapter()
  const [showEntitySuggestions, setShowEntitySuggestions] = useState(false)
  const [entitySuggestions, setEntitySuggestions] = useState<Entity[]>([])
  const [cursorPosition, setCursorPosition] = useState<{ top: number; left: number }>({ left: 0, top: 0 })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedText, setSelectedText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Process content to replace entity references and apply markdown
  useEffect(() => {
    let processed = content

    // Replace entity references (@slug or @slug.property)
    entities?.forEach((entity) => {
      // Replace @slug with default property
      const defaultProperty = entity.properties.find((p) => p.isDefault)
      if (defaultProperty) {
        const regex = new RegExp(`@${entity.slug}\\b`, "g")
        processed = processed.replace(regex, defaultProperty.value)
      }

      // Replace @slug.property with property value
      entity.properties.forEach((property) => {
        const regex = new RegExp(`@${entity.slug}\\.${property.name}\\b`, "g")
        processed = processed.replace(regex, property.value)
      })
    })

    // Remove comments
    processed = processed.replace(/\/\/.*$/gm, "") // Remove single line comments
    processed = processed.replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments

    onProcessedContentChange(processed)
  }, [content, entities, onProcessedContentChange])

  // Calculate position for the @ dropdown
  const calculateDropdownPosition = useCallback(
    (textarea: HTMLTextAreaElement, atPosition: number) => {
      // Create a mirror div to calculate position
      const mirror = document.createElement("div")
      mirror.style.position = "absolute"
      mirror.style.top = "0"
      mirror.style.left = "0"
      mirror.style.visibility = "hidden"
      mirror.style.whiteSpace = "pre-wrap"
      mirror.style.wordWrap = "break-word"
      mirror.style.width = `${textarea.clientWidth}px`
      mirror.style.padding = window.getComputedStyle(textarea).padding
      mirror.style.font = window.getComputedStyle(textarea).font
      mirror.style.lineHeight = window.getComputedStyle(textarea).lineHeight

      // Get text up to the @ symbol
      const textUpToAt = content.substring(0, atPosition)

      // Create a span for measuring
      const span = document.createElement("span")
      span.textContent = textUpToAt
      mirror.appendChild(span)

      document.body.appendChild(mirror)

      // Get position of the @ symbol
      const rect = textarea.getBoundingClientRect()
      const spanRect = span.getBoundingClientRect()

      // Calculate position relative to textarea
      const top = spanRect.height - textarea.scrollTop + 10 // 10px below the @ symbol
      const left =
        (spanRect.width % mirror.clientWidth) + Number.parseInt(window.getComputedStyle(textarea).paddingLeft)

      document.body.removeChild(mirror)

      return { left, top }
    },
    [content],
  )

  // Handle textarea input to show entity suggestions
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    onChange(newContent)

    // Check if we should show entity suggestions
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
        // Get the search term (text after @)
        const term = textBetweenAtAndCursor
        setSearchTerm(term)

        // Filter entities based on the search term
        const suggestions = entities
          ?.filter(
            (entity) =>
              entity.name.toLowerCase().includes(term.toLowerCase()) ||
              entity.slug.toLowerCase().includes(term.toLowerCase()),
          )
          .slice(0, 10) // Limit to 10 suggestions
          || []

        setEntitySuggestions(suggestions)
        setSelectedIndex(0) // Reset selected index when suggestions change

        // Calculate position for suggestions dropdown
        if (textareaRef.current) {
          const position = calculateDropdownPosition(textareaRef.current, lastAtPos)
          setCursorPosition(position)
        }

        setShowEntitySuggestions(suggestions.length > 0)
        return
      }
    }

    // Hide suggestions if no @ or there's a space after @
    setShowEntitySuggestions(false)
  }

  // Handle entity selection from suggestions
  const handleEntitySelect = (entity: Entity) => {
    if (textareaRef.current) {
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
    }

    setShowEntitySuggestions(false)
  }

  // Handle keyboard navigation for entity suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showEntitySuggestions) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prevIndex) => (prevIndex < entitySuggestions.length - 1 ? prevIndex + 1 : prevIndex))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0))
        break
      case "Enter":
        e.preventDefault()
        if (entitySuggestions[selectedIndex]) {
          handleEntitySelect(entitySuggestions[selectedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setShowEntitySuggestions(false)
        break
    }
  }

  // Handle text selection for AI processing
  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd

      if (start !== end) {
        setSelectedText(content.substring(start, end))
      } else {
        setSelectedText("")
      }
    }
  }

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

  // Scroll selected item into view
  useEffect(() => {
    if (showEntitySuggestions && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" })
      }
    }
  }, [selectedIndex, showEntitySuggestions])

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">Markdown Editor</div>
        <AIPromptDropdown
          currentChapter={currentChapter}
          currentContent={content}
          onTextReplace={handleTextReplace}
          project={project}
          selectedText={selectedText}
        />
      </div>

      <Textarea
        className="w-full h-[calc(100vh-300px)] min-h-[400px] p-2 font-mono text-sm bg-transparent resize-none focus:outline-hidden"
        onChange={handleTextareaInput}
        onKeyDown={handleKeyDown}
        onMouseUp={handleTextSelection}
        onSelect={handleTextSelection}
        placeholder="Metninizi buraya yazın. @tanimlayici veya @tanimlayici.ozellik formatında öğe referansları kullanabilirsiniz. Markdown formatlaması desteklenir."
        ref={textareaRef}
        value={content}
      />

      <EntityBadgesList entities={project.entities} />

      {showEntitySuggestions && (
        <div
          className="absolute z-10 bg-background border rounded-md shadow-md max-h-60 overflow-y-auto w-64"
          ref={suggestionsRef}
          style={{
            left: `${cursorPosition.left}px`,
            top: `${cursorPosition.top}px`,
          }}
        >
          {entitySuggestions.map((entity, index) => (
            <div
              className={`p-2 cursor-pointer flex items-center gap-2 ${
                index === selectedIndex ? "bg-primary/10" : "hover:bg-muted"
              }`}
              key={entity.slug}
              onClick={() => handleEntitySelect(entity)}
            >
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <div>
                <div className="font-medium">{entity.name}</div>
                <div className="text-xs text-muted-foreground">@{entity.slug}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
