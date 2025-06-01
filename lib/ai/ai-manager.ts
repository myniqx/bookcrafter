import { OpenAIAdapter } from "./openai-adapter"
import { GeminiAdapter } from "./gemini-adapter"
import { OllamaAdapter } from "./ollama-adapter"
import type { AIAdapter } from "./ai-adapter"
import type { AIProvider, AIRequest, AIResponse, AIPromptTemplate } from "../types"

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
        success: false,
        originalText: request.selectedText || "",
        suggestedText: "",
        error: `Unsupported AI provider: ${request.settings.provider}`,
      }
    }

    if (!adapter.validateSettings(request.settings)) {
      return {
        success: false,
        originalText: request.selectedText || "",
        suggestedText: "",
        error: "Invalid AI settings",
      }
    }

    return adapter.generateText(request)
  }

  getDefaultPromptTemplates(): AIPromptTemplate[] {
    return [
      {
        id: "grammar-check",
        name: "Grammar Check",
        description: "Check and correct grammar errors",
        prompt:
          "Please check the following text for grammar errors and provide a corrected version. Only fix grammar issues, don't change the style or meaning.",
        category: "grammar",
        isDefault: true,
      },
      {
        id: "improve-flow",
        name: "Improve Flow",
        description: "Make the text more fluent and readable",
        prompt:
          "Please improve the flow and readability of the following text while maintaining its original meaning and style.",
        category: "style",
        isDefault: true,
      },
      {
        id: "expand-scene",
        name: "Expand Scene",
        description: "Add more detail and description to a scene",
        prompt:
          "Please expand the following scene with more vivid descriptions, sensory details, and character emotions while maintaining the narrative flow.",
        category: "creative",
        isDefault: true,
      },
      {
        id: "dialogue-improvement",
        name: "Improve Dialogue",
        description: "Make dialogue more natural and engaging",
        prompt:
          "Please improve the dialogue in the following text to make it more natural, engaging, and character-appropriate.",
        category: "creative",
        isDefault: true,
      },
      {
        id: "translate-to-english",
        name: "Translate to English",
        description: "Translate text to English",
        prompt: "Please translate the following text to English while maintaining the original tone and meaning.",
        category: "translation",
        isDefault: true,
      },
      {
        id: "translate-to-turkish",
        name: "Translate to Turkish",
        description: "Translate text to Turkish",
        prompt: "Please translate the following text to Turkish while maintaining the original tone and meaning.",
        category: "translation",
        isDefault: true,
      },
    ]
  }
}

export const aiManager = new AIManager()
