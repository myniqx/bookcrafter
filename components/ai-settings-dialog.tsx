"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import type { AISettings, AIProvider, OllamaModel } from "@/lib/types"
import { OllamaAdapter } from "@/lib/ai/ollama-adapter"

interface AISettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AISettings
  onSave: (settings: AISettings) => void
}

export function AISettingsDialog({ open, onOpenChange, settings, onSave }: AISettingsDialogProps) {
  const [formData, setFormData] = useState<AISettings>(settings)
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setFormData(settings)
  }, [settings])

  useEffect(() => {
    if (formData.provider === "ollama" && open) {
      loadOllamaModels()
    }
  }, [formData.provider, open])

  const loadOllamaModels = async () => {
    setLoadingModels(true)
    try {
      const adapter = new OllamaAdapter()
      const models = await adapter.getAvailableModels(formData.ollamaUrl)
      setOllamaModels(models)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Ollama models. Make sure Ollama is running.",
        variant: "destructive",
      })
    } finally {
      setLoadingModels(false)
    }
  }

  const handleSave = () => {
    onSave(formData)
    onOpenChange(false)
    toast({
      title: "Settings saved",
      description: "AI settings have been updated successfully.",
    })
  }

  const getModelOptions = () => {
    switch (formData.provider) {
      case "openai":
        return [
          { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
          { value: "gpt-4", label: "GPT-4" },
          { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
        ]
      case "gemini":
        return [
          { value: "gemini-pro", label: "Gemini Pro" },
          { value: "gemini-pro-vision", label: "Gemini Pro Vision" },
        ]
      case "ollama":
        return ollamaModels.map((model) => ({
          value: model.name,
          label: model.name,
        }))
      default:
        return []
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>Configure your AI provider and model settings.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={formData.provider}
              onValueChange={(value: AIProvider) => setFormData({ ...formData, provider: value, model: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.provider !== "ollama" && (
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey || ""}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Enter your API key"
              />
            </div>
          )}

          {formData.provider === "ollama" && (
            <div className="grid gap-2">
              <Label htmlFor="ollamaUrl">Ollama URL</Label>
              <Input
                id="ollamaUrl"
                value={formData.ollamaUrl || "http://localhost:11434"}
                onChange={(e) => setFormData({ ...formData, ollamaUrl: e.target.value })}
                placeholder="http://localhost:11434"
              />
              <Button type="button" variant="outline" size="sm" onClick={loadOllamaModels} disabled={loadingModels}>
                {loadingModels ? "Loading..." : "Refresh Models"}
              </Button>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {getModelOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="temperature">Temperature: {formData.temperature || 0.7}</Label>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={[formData.temperature || 0.7]}
              onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              value={formData.maxTokens || 1000}
              onChange={(e) => setFormData({ ...formData, maxTokens: Number.parseInt(e.target.value) || 1000 })}
              min={1}
              max={4000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
