"use client"

import { useState, useRef, useCallback } from "react"

interface UseTextToSpeechProps {
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
}

export function useTextToSpeech({ onStart, onEnd, onError }: UseTextToSpeechProps = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = useCallback(
    async (text: string) => {
      if (!text) return

      try {
        setIsLoading(true)

        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }

        // Call the text-to-speech API
        const response = await fetch("/api/text-to-speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errorData.error || "Failed to generate speech")
        }

        // Get the audio blob
        const audioBlob = await response.blob()

        // Create an object URL for the audio blob
        const audioUrl = URL.createObjectURL(audioBlob)

        // Create an audio element
        const audio = new Audio(audioUrl)
        audioRef.current = audio

        // Set up event handlers
        audio.onplay = () => {
          setIsSpeaking(true)
          if (onStart) onStart()
        }

        audio.onended = () => {
          setIsSpeaking(false)
          if (onEnd) onEnd()
          // Clean up the object URL
          URL.revokeObjectURL(audioUrl)
          audioRef.current = null
        }

        audio.onerror = (event) => {
          console.error("Audio playback error:", event)
          setIsSpeaking(false)
          if (onError) onError(new Error("Error playing audio"))
          // Clean up the object URL
          URL.revokeObjectURL(audioUrl)
          audioRef.current = null
        }

        // Play the audio
        await audio.play()
      } catch (error) {
        console.error("Error generating speech:", error)
        if (onError && error instanceof Error) {
          onError(error)
        }
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [onStart, onEnd, onError],
  )

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsSpeaking(false)
      if (onEnd) onEnd()
    }
  }, [onEnd])

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
  }
}
