import type { AIRequest, AIResponse, AISettings } from "../types"

export interface AIAdapter {
  provider: string
  generateText: (request: AIRequest) => Promise<AIResponse>
  validateSettings: (settings: AISettings) => boolean
}

export abstract class BaseAIAdapter implements AIAdapter {
  abstract provider: string

  abstract generateText(request: AIRequest): Promise<AIResponse>

  abstract validateSettings(settings: AISettings): boolean

  protected buildPrompt(request: AIRequest): string {
    const { context, prompt, selectedText } = request

    let fullPrompt = `Project: ${context.projectName}\n\n`

    if (context.characters.length > 0) {
      fullPrompt += `Characters: ${context.characters.join(", ")}\n`
    }

    if (context.locations.length > 0) {
      fullPrompt += `Locations: ${context.locations.join(", ")}\n`
    }

    if (context.currentChapter) {
      fullPrompt += `Current Chapter: ${context.currentChapter}\n`
    }

    if (context.currentContent) {
      fullPrompt += `\nCurrent Content:\n${context.currentContent}\n`
    }

    fullPrompt += `\nTask: ${prompt}\n`

    if (selectedText) {
      fullPrompt += `\nSelected Text:\n${selectedText}\n`
    }

    return fullPrompt
  }
}
