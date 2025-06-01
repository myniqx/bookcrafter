"use client"

import ReactMarkdown from "react-markdown"

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none h-full">
      {content ? (
        <ReactMarkdown>{content}</ReactMarkdown>
      ) : (
        <span className="text-muted-foreground">Önizleme burada görünecek...</span>
      )}
    </div>
  )
}
