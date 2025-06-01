"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  isTitle?: boolean
  multiline?: boolean
}

export function EditableText({
  value,
  onChange,
  placeholder = "Metin ekleyin...",
  className,
  isTitle = false,
  multiline = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setText(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (text !== value) {
      onChange(text)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      setIsEditing(false)
      if (text !== value) {
        onChange(text)
      }
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      setText(value)
    }
  }

  if (isEditing) {
    if (multiline) {
      return (
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("min-h-[100px]", className)}
          onClick={(e) => e.stopPropagation()}
        />
      )
    }

    return (
      <Input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(isTitle ? "text-3xl font-bold" : "", className)}
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  return (
    <div
      className={cn("group flex items-center gap-2 cursor-text", isTitle ? "text-3xl font-bold" : "", className)}
      onClick={handleEdit}
    >
      <span className={cn(text ? "" : "text-muted-foreground italic")}>{text || placeholder}</span>
      <Pencil
        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
        onClick={handleEdit}
      />
    </div>
  )
}
