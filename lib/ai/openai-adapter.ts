import { BaseAIAdapter } from "./ai-adapter"
import type { AIRequest, AIResponse, AISettings } from "../types"

export class OpenAIAdapter extends BaseAIAdapter {
  provider = "openai"

  async generateText(request: AIRequest): Promise<AIResponse> {
    const { settings } = request

    if (!settings.apiKey) {
      return {
        success: false,
        originalText: request.selectedText || "",
        suggestedText: "",
        error: "OpenAI API key is required",
      }
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model || "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: this.buildPrompt(request),
            },
          ],
          temperature: settings.temperature || 0.7,
          max_tokens: settings.maxTokens || 1000,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        originalText: request.selectedText || "",
        suggestedText: data.choices[0]?.message?.content || "",
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
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

  validateSettings(settings: AISettings): boolean {
    return !!(settings.apiKey && settings.model)
  }
}
