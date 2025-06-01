"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { TextDiff } from "@/lib/types"
import { applyDiffChanges } from "@/lib/utils/text-diff"

interface AITextDiffModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  originalText: string
  suggestedText: string
  diffs: TextDiff[]
  onApply: (finalText: string) => void
}

export function AITextDiffModal({
  open,
  onOpenChange,
  originalText,
  suggestedText,
  diffs,
  onApply,
}: AITextDiffModalProps) {
  const [acceptedChanges, setAcceptedChanges] = useState<Set<number>>(
    new Set(diffs.map((_, index) => index).filter((index) => diffs[index].type === "insert")),
  )

  const toggleChange = (index: number) => {
    const newAcceptedChanges = new Set(acceptedChanges)
    if (newAcceptedChanges.has(index)) {
      newAcceptedChanges.delete(index)
    } else {
      newAcceptedChanges.add(index)
    }
    setAcceptedChanges(newAcceptedChanges)
  }

  const handleApply = () => {
    const finalText = applyDiffChanges(diffs, acceptedChanges)
    onApply(finalText)
    onOpenChange(false)
  }

  const handleAcceptAll = () => {
    const allInsertions = new Set(diffs.map((_, index) => index).filter((index) => diffs[index].type === "insert"))
    setAcceptedChanges(allInsertions)
  }

  const handleRejectAll = () => {
    setAcceptedChanges(new Set())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Review AI Suggestions</DialogTitle>
          <DialogDescription>
            Review the changes suggested by AI. Click on highlighted text to accept or reject changes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 h-[400px]">
          <div>
            <h4 className="text-sm font-medium mb-2">Original Text</h4>
            <ScrollArea className="h-full border rounded-md p-3">
              <div className="text-sm whitespace-pre-wrap">{originalText}</div>
            </ScrollArea>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Suggested Changes</h4>
            <ScrollArea className="h-full border rounded-md p-3">
              <div className="text-sm">
                {diffs.map((diff, index) => {
                  if (diff.type === "equal") {
                    return (
                      <span key={index} className="text-gray-700">
                        {diff.text}
                      </span>
                    )
                  } else if (diff.type === "delete") {
                    const isAccepted = !acceptedChanges.has(index)
                    return (
                      <span
                        key={index}
                        className={`cursor-pointer rounded px-1 ${
                          isAccepted ? "bg-red-100 text-red-800 line-through" : "bg-red-200 text-red-900"
                        }`}
                        onClick={() => toggleChange(index)}
                        title="Click to toggle deletion"
                      >
                        {diff.text}
                      </span>
                    )
                  } else if (diff.type === "insert") {
                    const isAccepted = acceptedChanges.has(index)
                    return (
                      <span
                        key={index}
                        className={`cursor-pointer rounded px-1 ${
                          isAccepted ? "bg-green-100 text-green-800" : "bg-green-200 text-green-900 opacity-50"
                        }`}
                        onClick={() => toggleChange(index)}
                        title="Click to toggle insertion"
                      >
                        {diff.text}
                      </span>
                    )
                  }
                  return null
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline">{diffs.filter((d) => d.type === "insert").length} insertions</Badge>
          <Badge variant="outline">{diffs.filter((d) => d.type === "delete").length} deletions</Badge>
          <Badge variant="outline">{acceptedChanges.size} changes accepted</Badge>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleRejectAll}>
            Reject All
          </Button>
          <Button type="button" variant="outline" onClick={handleAcceptAll}>
            Accept All
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
