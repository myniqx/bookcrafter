"use client"

import { useEffect, useState } from "react"

import type { AIProvider, AISettings, OllamaModel } from "@/lib/types"

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
import { OllamaAdapter } from "@/lib/ai/ollama-adapter"

interface AISettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AISettings
  onSave: (settings: AISettings) => void
}

export function AISettingsDialog({ onOpenChange, onSave, open, settings }: AISettingsDialogProps) {
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
        description: "Failed to load Ollama models. Make sure Ollama is running.",
        title: "Error",
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
      description: "AI settings have been updated successfully.",
      title: "Settings saved",
    })
  }

  const getModelOptions = () => {
    switch (formData.provider) {
      case "openai":
        return [
          { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
          { label: "GPT-4", value: "gpt-4" },
          { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
        ]
      case "gemini":
        return [
          { label: "Gemini Pro", value: "gemini-pro" },
          { label: "Gemini Pro Vision", value: "gemini-pro-vision" },
        ]
      case "ollama":
        return ollamaModels.map((model) => ({
          label: model.name,
          value: model.name,
        }))
      default:
        return []
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>Configure your AI provider and model settings.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              onValueChange={(value: AIProvider) => setFormData({ ...formData, model: "", provider: value })}
              value={formData.provider}
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
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Enter your API key"
                type="password"
                value={formData.apiKey || ""}
              />
            </div>
          )}

          {formData.provider === "ollama" && (
            <div className="grid gap-2">
              <Label htmlFor="ollamaUrl">Ollama URL</Label>
              <Input
                id="ollamaUrl"
                onChange={(e) => setFormData({ ...formData, ollamaUrl: e.target.value })}
                placeholder="http://localhost:11434"
                value={formData.ollamaUrl || "http://localhost:11434"}
              />
              <Button disabled={loadingModels} onClick={loadOllamaModels} size="sm" type="button" variant="outline">
                {loadingModels ? "Loading..." : "Refresh Models"}
              </Button>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, model: value })} value={formData.model}>
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
              max={2}
              min={0}
              onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
              step={0.1}
              value={[formData.temperature || 0.7]}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              max={4000}
              min={1}
              onChange={(e) => setFormData({ ...formData, maxTokens: Number.parseInt(e.target.value) || 1000 })}
              type="number"
              value={formData.maxTokens || 1000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} type="button">
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
