import type { AIPromptTemplate, AIProvider, AIRequest, AIResponse } from "../types"
import type { AIAdapter } from "./ai-adapter"

import { GeminiAdapter } from "./gemini-adapter"
import { OllamaAdapter } from "./ollama-adapter"
import { OpenAIAdapter } from "./openai-adapter"

export class AIManager {
  private adapters: Map<AIProvider, AIAdapter> = new Map()

  constructor() {
    this.adapters.set("openai", new OpenAIAdapter())
    this.adapters.set("gemini", new GeminiAdapter())
    this.adapters.set("ollama", new OllamaAdapter())
  }

  getAdapter(provider: AIProvider): AIAdapter | undefined {
    return this.adapters.get(provider)
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    const adapter = this.getAdapter(request.settings.provider)

    if (!adapter) {
      return {
        error: `Unsupported AI provider: ${request.settings.provider}`,
        originalText: request.selectedText || "",
        success: false,
        suggestedText: "",
      }
    }

    if (!adapter.validateSettings(request.settings)) {
      return {
        error: "Invalid AI settings",
        originalText: request.selectedText || "",
        success: false,
        suggestedText: "",
      }
    }

    return adapter.generateText(request)
  }

  getDefaultPromptTemplates(): AIPromptTemplate[] {
    return [
      {
        category: "grammar",
        description: "Check and correct grammar errors",
        id: "grammar-check",
        isDefault: true,
        name: "Grammar Check",
        prompt:
          "Please check the following text for grammar errors and provide a corrected version. Only fix grammar issues, don't change the style or meaning.",
      },
      {
        category: "style",
        description: "Make the text more fluent and readable",
        id: "improve-flow",
        isDefault: true,
        name: "Improve Flow",
        prompt:
          "Please improve the flow and readability of the following text while maintaining its original meaning and style.",
      },
      {
        category: "creative",
        description: "Add more detail and description to a scene",
        id: "expand-scene",
        isDefault: true,
        name: "Expand Scene",
        prompt:
          "Please expand the following scene with more vivid descriptions, sensory details, and character emotions while maintaining the narrative flow.",
      },
      {
        category: "creative",
        description: "Make dialogue more natural and engaging",
        id: "dialogue-improvement",
        isDefault: true,
        name: "Improve Dialogue",
        prompt:
          "Please improve the dialogue in the following text to make it more natural, engaging, and character-appropriate.",
      },
      {
        category: "translation",
        description: "Translate text to English",
        id: "translate-to-english",
        isDefault: true,
        name: "Translate to English",
        prompt: "Please translate the following text to English while maintaining the original tone and meaning.",
      },
      {
        category: "translation",
        description: "Translate text to Turkish",
        id: "translate-to-turkish",
        isDefault: true,
        name: "Translate to Turkish",
        prompt: "Please translate the following text to Turkish while maintaining the original tone and meaning.",
      },
    ]
  }
}

export const aiManager = new AIManager()
