import type { AIRequest, AIResponse, AISettings } from "../types"

import { BaseAIAdapter } from "./ai-adapter"

export class GeminiAdapter extends BaseAIAdapter {
  provider = "gemini"

  async generateText(request: AIRequest): Promise<AIResponse> {
    const { settings } = request

    if (!settings.apiKey) {
      return {
        error: "Gemini API key is required",
        originalText: request.selectedText || "",
        success: false,
        suggestedText: "",
      }
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${settings.model || "gemini-pro"}:generateContent?key=${settings.apiKey}`,
        {
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: this.buildPrompt(request),
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: settings.maxTokens || 1000,
              temperature: settings.temperature || 0.7,
            },
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        originalText: request.selectedText || "",
        success: true,
        suggestedText: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
        usage: {
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
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

  validateSettings(settings: AISettings): boolean {
    return !!(settings.apiKey && settings.model)
  }
}
