"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { AIPromptTemplate, AISettings, Project } from "@/lib/types"
import { aiManager } from "@/lib/ai/ai-manager"
import { generateTextDiff } from "@/lib/utils/text-diff"
import { AISettingsDialog } from "./ai-settings-dialog"
import { AITextDiffModal } from "./ai-text-diff-modal"

interface AIPromptDropdownProps {
  selectedText: string
  onTextReplace: (newText: string) => void
  project: Project
  currentChapter?: string
  currentContent?: string
}

export function AIPromptDropdown({
  selectedText,
  onTextReplace,
  project,
  currentChapter,
  currentContent,
}: AIPromptDropdownProps) {
  const [customPromptOpen, setCustomPromptOpen] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [diffModalOpen, setDiffModalOpen] = useState(false)
  const [aiResponse, setAiResponse] = useState<{
    originalText: string
    suggestedText: string
    diffs: any[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const defaultPrompts = aiManager.getDefaultPromptTemplates()

  const getAISettings = (): AISettings => {
    return (
      project.aiSettings || {
        provider: "openai",
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        maxTokens: 1000,
      }
    )
  }

  const buildContext = () => {
    const characters = project.entities.filter((e) => e.type === "character").map((e) => e.name)

    const locations = project.entities.filter((e) => e.type === "location").map((e) => e.name)

    return {
      projectName: project.name,
      currentChapter,
      characters,
      locations,
      currentContent,
    }
  }

  const executePrompt = async (prompt: string) => {
    if (!selectedText.trim()) {
      toast({
        title: "No text selected",
        description: "Please select some text to apply AI suggestions.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await aiManager.generateText({
        prompt,
        selectedText,
        context: buildContext(),
        settings: getAISettings(),
      })

      if (!response.success) {
        toast({
          title: "AI Error",
          description: response.error || "Failed to generate AI response",
          variant: "destructive",
        })
        return
      }

      const diffs = generateTextDiff(selectedText, response.suggestedText)
      setAiResponse({
        originalText: response.originalText,
        suggestedText: response.suggestedText,
        diffs,
      })
      setDiffModalOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCustomPromptSubmit = () => {
    if (customPrompt.trim()) {
      executePrompt(customPrompt)
      setCustomPromptOpen(false)
      setCustomPrompt("")
    }
  }

  const handleSettingsSave = (settings: AISettings) => {
    // This would typically update the project's AI settings
    // For now, we'll just show a success message
    toast({
      title: "Settings saved",
      description: "AI settings have been updated.",
    })
  }

  const groupedPrompts = defaultPrompts.reduce(
    (acc, prompt) => {
      if (!acc[prompt.category]) {
        acc[prompt.category] = []
      }
      acc[prompt.category].push(prompt)
      return acc
    },
    {} as Record<string, AIPromptTemplate[]>,
  )

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={!selectedText.trim() || loading} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {loading ? "Processing..." : "AI Assistant"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>

          {Object.entries(groupedPrompts).map(([category, prompts]) => (
            <div key={category}>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground capitalize">{category}</DropdownMenuLabel>
              {prompts.map((prompt) => (
                <DropdownMenuItem
                  key={prompt.id}
                  onClick={() => executePrompt(prompt.prompt)}
                  className="cursor-pointer"
                >
                  {prompt.name}
                </DropdownMenuItem>
              ))}
            </div>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCustomPromptOpen(true)} className="cursor-pointer">
            Custom Prompt...
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            AI Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Prompt Dialog */}
      <Dialog open={customPromptOpen} onOpenChange={setCustomPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom AI Prompt</DialogTitle>
            <DialogDescription>Enter a custom prompt to apply to the selected text.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter your custom prompt here..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomPromptOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomPromptSubmit} disabled={!customPrompt.trim()}>
              Apply Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Settings Dialog */}
      <AISettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={getAISettings()}
        onSave={handleSettingsSave}
      />

      {/* Text Diff Modal */}
      {aiResponse && (
        <AITextDiffModal
          open={diffModalOpen}
          onOpenChange={setDiffModalOpen}
          originalText={aiResponse.originalText}
          suggestedText={aiResponse.suggestedText}
          diffs={aiResponse.diffs}
          onApply={onTextReplace}
        />
      )}
    </>
  )
}
