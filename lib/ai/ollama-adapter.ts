import type { AIRequest, AIResponse, AISettings, OllamaModel } from "../types"

import { BaseAIAdapter } from "./ai-adapter"

export class OllamaAdapter extends BaseAIAdapter {
  provider = "ollama"

  async generateText(request: AIRequest): Promise<AIResponse> {
    const { settings } = request
    const ollamaUrl = settings.ollamaUrl || "http://localhost:11434"

    try {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        body: JSON.stringify({
          model: settings.model || "llama2",
          options: {
            num_predict: settings.maxTokens || 1000,
            temperature: settings.temperature || 0.7,
          },
          prompt: this.buildPrompt(request),
          stream: false,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        originalText: request.selectedText || "",
        success: true,
        suggestedText: data.response || "",
        usage: {
          completionTokens: data.eval_count || 0,
          promptTokens: data.prompt_eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        originalText: request.selectedText || "",
        success: false,
        suggestedText: "",
      }
    }
  }

  async getAvailableModels(ollamaUrl = "http://localhost:11434"): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`)
      if (!response.ok) {
        throw new Error(`Failed to fetch Ollama models: ${response.statusText}`)
      }
      const data = await response.json()
      return data.models || []
    } catch (error) {
      console.error("Error fetching Ollama models:", error)
      return []
    }
  }

  validateSettings(settings: AISettings): boolean {
    return !!settings.model
  }
}
