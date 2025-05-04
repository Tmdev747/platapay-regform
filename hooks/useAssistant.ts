"use client"

import { useState, useCallback } from "react"
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/constants"

export function useAssistant() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (message: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: message,
          systemPrompt: ASSISTANT_SYSTEM_PROMPT,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response")
      }

      const data = await response.json()
      setIsLoading(false)
      return data.response
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setIsLoading(false)
      return null
    }
  }, [])

  return {
    sendMessage,
    isLoading,
    error,
  }
}
