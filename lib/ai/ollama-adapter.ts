import { BaseAIAdapter } from "./ai-adapter"
import type { AIRequest, AIResponse, AISettings, OllamaModel } from "../types"

export class OllamaAdapter extends BaseAIAdapter {
  provider = "ollama"

  async generateText(request: AIRequest): Promise<AIResponse> {
    const { settings } = request
    const ollamaUrl = settings.ollamaUrl || "http://localhost:11434"

    try {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: settings.model || "llama2",
          prompt: this.buildPrompt(request),
          stream: false,
          options: {
            temperature: settings.temperature || 0.7,
            num_predict: settings.maxTokens || 1000,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        originalText: request.selectedText || "",
        suggestedText: data.response || "",
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      }
    } catch (error) {
      return {
        success: false,
        originalText: request.selectedText || "",
        suggestedText: "",
        error: error instanceof Error ? error.message : "Unknown error",
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
