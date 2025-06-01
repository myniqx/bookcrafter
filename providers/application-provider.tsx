"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { APP_NAME } from "@/lib/constants"

interface ApplicationSettings {
  autoSave: boolean
  autoSaveInterval: number
  theme: "light" | "dark" | "system"
  language: "tr" | "en"
  fontSize: number
}

interface ApplicationContextType {
  isElectron: boolean
  appName: string
  appVersion: string
  settings: ApplicationSettings
  updateSettings: (newSettings: Partial<ApplicationSettings>) => void
  platform: "web" | "electron" | "mobile"
}

const defaultSettings: ApplicationSettings = {
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  theme: "system",
  language: "tr",
  fontSize: 14,
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined)

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [isElectron, setIsElectron] = useState(false)
  const [platform, setPlatform] = useState<"web" | "electron" | "mobile">("web")
  const [settings, setSettings] = useState<ApplicationSettings>(defaultSettings)

  useEffect(() => {
    // Check if running in Electron
    const checkElectron = () => {
      if (typeof window !== "undefined") {
        const isElectronApp = !!(window as any).electronAPI
        setIsElectron(isElectronApp)

        if (isElectronApp) {
          setPlatform("electron")
        } else if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          setPlatform("mobile")
        } else {
          setPlatform("web")
        }
      }
    }

    checkElectron()

    // Load settings from localStorage
    const loadSettings = () => {
      if (typeof window !== "undefined") {
        const savedSettings = localStorage.getItem(`${APP_NAME}_settings`)
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings)
            setSettings({ ...defaultSettings, ...parsed })
          } catch (error) {
            console.error("Error loading settings:", error)
          }
        }
      }
    }

    loadSettings()
  }, [])

  const updateSettings = (newSettings: Partial<ApplicationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(`${APP_NAME}_settings`, JSON.stringify(updatedSettings))
    }
  }

  const value: ApplicationContextType = {
    isElectron,
    appName: APP_NAME,
    appVersion: "1.0.0",
    settings,
    updateSettings,
    platform,
  }

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>
}

export function useApplication() {
  const context = useContext(ApplicationContext)
  if (context === undefined) {
    throw new Error("useApplication must be used within an ApplicationProvider")
  }
  return context
}
