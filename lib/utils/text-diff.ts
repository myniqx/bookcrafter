import { diffWords } from "diff"

import type { TextDiff } from "../types"

/**
 * Generate text differences between original and suggested text
 */
export function generateTextDiff(originalText: string, suggestedText: string): TextDiff[] {
  const differences = diffWords(originalText, suggestedText)

  return differences.map((part) => {
    if (part.added) {
      return { text: part.value, type: "insert" }
    } else if (part.removed) {
      return { text: part.value, type: "delete" }
    } else {
      return { text: part.value, type: "equal" }
    }
  })
}

/**
 * Apply selected changes from diffs to create final text
 */
export function applyDiffChanges(diffs: TextDiff[], acceptedChanges: Set<number>): string {
  let result = ""

  diffs.forEach((diff, index) => {
    if (diff.type === "equal") {
      // Always include unchanged text
      result += diff.text
    } else if (diff.type === "delete") {
      // Include deleted text only if the change is NOT accepted
      if (!acceptedChanges.has(index)) {
        result += diff.text
      }
    } else if (diff.type === "insert") {
      // Include inserted text only if the change IS accepted
      if (acceptedChanges.has(index)) {
        result += diff.text
      }
    }
  })

  return result
}
