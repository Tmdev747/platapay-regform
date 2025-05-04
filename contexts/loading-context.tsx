"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface LoadingContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  setLoadingWithTimeout: (timeout?: number) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const startLoading = () => setIsLoading(true)

  const stopLoading = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsLoading(false)
  }

  const setLoadingWithTimeout = (timeout = 10000) => {
    startLoading()

    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set new timeout to automatically stop loading after specified time
    const id = setTimeout(() => {
      setIsLoading(false)
      setTimeoutId(null)
    }, timeout)

    setTimeoutId(id)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, setLoadingWithTimeout }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}
