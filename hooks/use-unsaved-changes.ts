"use client"

import { useState, useEffect, useCallback } from "react"

export function useUnsavedChanges() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Set up beforeunload event handler to warn when closing with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Standard way to show a confirmation dialog when closing the page
        e.preventDefault()
        e.returnValue = "Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istediğinizden emin misiniz?"
        return e.returnValue
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  const setUnsavedChanges = useCallback((value: boolean) => {
    setHasUnsavedChanges(value)
  }, [])

  return { hasUnsavedChanges, setUnsavedChanges }
}
