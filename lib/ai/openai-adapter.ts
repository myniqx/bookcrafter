import type { AIRequest, AIResponse, AISettings } from "../types"

import { BaseAIAdapter } from "./ai-adapter"

export class OpenAIAdapter extends BaseAIAdapter {
  provider = "openai"

  async generateText(request: AIRequest): Promise<AIResponse> {
    const { settings } = request

    if (!settings.apiKey) {
      return {
        error: "OpenAI API key is required",
        originalText: request.selectedText || "",
        success: false,
        suggestedText: "",
      }
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        body: JSON.stringify({
          max_tokens: settings.maxTokens || 1000,
          messages: [
            {
              content: this.buildPrompt(request),
              role: "user",
            },
          ],
          model: settings.model || "gpt-3.5-turbo",
          temperature: settings.temperature || 0.7,
        }),
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        originalText: request.selectedText || "",
        success: true,
        suggestedText: data.choices[0]?.message?.content || "",
        usage: {
          completionTokens: data.usage?.completion_tokens || 0,
          promptTokens: data.usage?.prompt_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
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
