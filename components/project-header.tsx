"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCurrentProjectStore } from "@/lib/stores"

export function ProjectHeader() {
  const projectMetadata = useCurrentProjectStore(state => state.metadata)
  const hasUnsavedChanges = false // Mock for now

  if (!projectMetadata) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button className="rounded-full" size="icon" variant="ghost">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {projectMetadata.name}
            {hasUnsavedChanges && <span className="text-red-500">*</span>}
          </h1>
          <div className="text-muted-foreground mt-1">
            {projectMetadata.description || "No description"}
          </div>
        </div>
      </div>
    </div>
  )
}
