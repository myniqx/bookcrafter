"use client"

import { useState } from "react"
import { Settings, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AIPromptDropdownV2Props {
  selectedText: string
  onTextReplace: (newText: string) => void
  currentChapter?: string
  currentContent?: string
}

export function AIPromptDropdownV2({
  currentChapter,
  currentContent,
  onTextReplace,
  selectedText,
}: AIPromptDropdownV2Props) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleMockAI = (type: string) => {
    setIsProcessing(true)
    
    // Mock AI processing
    setTimeout(() => {
      let newText = selectedText
      
      switch (type) {
        case 'improve':
          newText = `Improved: ${selectedText}`
          break
        case 'expand':
          newText = `${selectedText} (expanded with more details)`
          break
        case 'correct':
          newText = selectedText.replace(/\b\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1))
          break
        default:
          newText = `AI processed: ${selectedText}`
      }
      
      onTextReplace(newText)
      setIsProcessing(false)
    }, 1000)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isProcessing}
          size="icon"
          title="AI Yardımı"
          variant="outline"
        >
          <Sparkles className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>AI Yardımı</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {selectedText ? (
          <>
            <DropdownMenuItem onClick={() => handleMockAI('improve')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Metni İyileştir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMockAI('expand')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Genişlet
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMockAI('correct')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Düzelt
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem disabled>
            Metin seçin
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          AI Ayarları
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}