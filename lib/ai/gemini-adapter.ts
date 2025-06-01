import { BaseAIAdapter } from "./ai-adapter"
import type { AIRequest, AIResponse, AISettings } from "../types"

export class GeminiAdapter extends BaseAIAdapter {
  provider = "gemini"

  async generateText(request: AIRequest): Promise<AIResponse> {
    const { settings } = request

    if (!settings.apiKey) {
      return {
        success: false,
        originalText: request.selectedText || "",
        suggestedText: "",
        error: "Gemini API key is required",
      }
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${settings.model || "gemini-pro"}:generateContent?key=${settings.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
              temperature: settings.temperature || 0.7,
              maxOutputTokens: settings.maxTokens || 1000,
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        originalText: request.selectedText || "",
        suggestedText: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
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
