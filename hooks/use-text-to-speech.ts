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
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Function to enable audio - must be called from a user interaction handler
  const enableAudio = useCallback(() => {
    // Create and play a silent audio to unlock audio capabilities
    try {
      const audio = new Audio()
      audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"

      // Play and immediately pause to unlock audio
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audio.pause()
            setAudioEnabled(true)
            console.log("Audio enabled successfully")
          })
          .catch((error) => {
            console.error("Failed to enable audio:", error)
            if (onError) onError(new Error("Could not enable audio. Please check browser permissions."))
          })
      }
    } catch (error) {
      console.error("Error enabling audio:", error)
      if (onError && error instanceof Error) {
        onError(error)
      }
    }
  }, [onError])

  const speak = useCallback(
    async (text: string) => {
      if (!text) return

      // If audio isn't enabled yet, don't try to play and return early
      if (!audioEnabled) {
        console.warn("Attempted to speak before audio was enabled")
        if (onError) onError(new Error("Audio is not enabled. Please enable audio first."))
        return Promise.reject(new Error("Audio is not enabled"))
      }

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

        // Try to play the audio with error handling
        try {
          const playPromise = audio.play()

          // Modern browsers return a promise from play()
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Audio playback blocked:", error)
              if (onError) onError(new Error("Audio playback blocked by browser. Please enable audio first."))
              // Clean up
              URL.revokeObjectURL(audioUrl)
              audioRef.current = null
            })
          }

          return playPromise // Return the promise so caller can handle it
        } catch (playError) {
          console.error("Error playing audio:", playError)
          if (onError) onError(new Error("Failed to play audio. Browser may be blocking autoplay."))
          // Clean up
          URL.revokeObjectURL(audioUrl)
          audioRef.current = null
          throw playError
        }
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
    [onStart, onEnd, onError, audioEnabled],
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
    audioEnabled,
    enableAudio,
  }
}
