"use client"

import { useState } from "react"

import { Settings, Sparkles } from "lucide-react"

import type { AIPromptTemplate, AISettings, Project } from "@/lib/types"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { aiManager } from "@/lib/ai/ai-manager"
import { generateTextDiff } from "@/lib/utils/text-diff"

import { AISettingsDialog } from "./ai-settings-dialog"
import { AITextDiffModal } from "./ai-text-diff-modal"
import { useProject } from "@/providers/project-provider"

interface AIPromptDropdownProps {
  selectedText: string
  onTextReplace: (newText: string) => void
  currentChapter?: string
  currentContent?: string
}

export function AIPromptDropdown({
  currentChapter,
  currentContent,
  onTextReplace,
  selectedText,
}: AIPromptDropdownProps) {
  const { aiSettings, entities, project, updateAISettings } = useProject()
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
      aiSettings || {
        maxTokens: 1000,
        model: "gpt-3.5-turbo",
        provider: "openai",
        temperature: 0.7,
      }
    )
  }

  const buildContext = () => {
    const characters = entities.filter((e) => e.type === "character").map((e) => e.name)

    const locations = entities.filter((e) => e.type === "location").map((e) => e.name)

    return {
      characters,
      currentChapter,
      currentContent,
      locations,
      projectName: project.name,
    }
  }

  const executePrompt = async (prompt: string) => {
    if (!selectedText.trim()) {
      toast({
        description: "Please select some text to apply AI suggestions.",
        title: "No text selected",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await aiManager.generateText({
        context: buildContext(),
        prompt,
        selectedText,
        settings: getAISettings(),
      })

      if (!response.success) {
        toast({
          description: response.error || "Failed to generate AI response",
          title: "AI Error",
          variant: "destructive",
        })
        return
      }

      const diffs = generateTextDiff(selectedText, response.suggestedText)
      setAiResponse({
        diffs,
        originalText: response.originalText,
        suggestedText: response.suggestedText,
      })
      setDiffModalOpen(true)
    } catch (error) {
      console.log('Error executing prompt:', error)
      toast({
        description: "An unexpected error occurred",
        title: "Error",
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
    updateAISettings({ ...aiSettings, ...settings })
    toast({
      description: "AI settings have been updated.",
      title: "Settings saved",
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
          <Button className="gap-2" disabled={!selectedText.trim() || loading} size="sm" variant="outline">
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
                  className="cursor-pointer"
                  key={prompt.id}
                  onClick={() => executePrompt(prompt.prompt)}
                >
                  {prompt.name}
                </DropdownMenuItem>
              ))}
            </div>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={() => setCustomPromptOpen(true)}>
            Custom Prompt...
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            AI Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Prompt Dialog */}
      <Dialog onOpenChange={setCustomPromptOpen} open={customPromptOpen}>
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
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter your custom prompt here..."
                rows={4}
                value={customPrompt}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCustomPromptOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button disabled={!customPrompt.trim()} onClick={handleCustomPromptSubmit}>
              Apply Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Settings Dialog */}
      <AISettingsDialog
        onOpenChange={setSettingsOpen}
        onSave={handleSettingsSave}
        open={settingsOpen}
        settings={getAISettings()}
      />

      {/* Text Diff Modal */}
      {aiResponse && (
        <AITextDiffModal
          diffs={aiResponse.diffs}
          onApply={onTextReplace}
          onOpenChange={setDiffModalOpen}
          open={diffModalOpen}
          originalText={aiResponse.originalText}
          suggestedText={aiResponse.suggestedText}
        />
      )}
    </>
  )
}
