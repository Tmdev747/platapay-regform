"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { VOICE_SYSTEM_PROMPT } from "@/lib/constants"

export function useTextToSpeech() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audioContext = useRef<AudioContext | null>(null)
  const audioQueue = useRef<string[]>([])
  const isSpeaking = useRef(false)

  // Initialize audio context
  const initializeAudio = useCallback(async () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      if (audioContext.current.state === "suspended") {
        await audioContext.current.resume()
      }

      setAudioEnabled(true)
      return true
    } catch (err) {
      console.error("Failed to initialize audio:", err)
      setError("Failed to enable audio. Please check your browser permissions.")
      setAudioEnabled(false)
      return false
    }
  }, [])

  // Process text to speech using Eleven Labs
  const speakText = useCallback(
    async (text: string) => {
      if (!audioEnabled) {
        audioQueue.current.push(text)
        const success = await initializeAudio()
        if (!success) return
      }

      if (isSpeaking.current) {
        audioQueue.current.push(text)
        return
      }

      const processQueue = async () => {
        if (audioQueue.current.length === 0) {
          isSpeaking.current = false
          return
        }

        const nextText = audioQueue.current.shift()
        if (!nextText) {
          isSpeaking.current = false
          return
        }

        isSpeaking.current = true
        setIsLoading(true)

        try {
          const response = await fetch("/api/text-to-speech", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: nextText }),
          })

          if (!response.ok) {
            throw new Error("Failed to convert text to speech")
          }

          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl)
            processQueue()
          }

          await audio.play()
          setIsLoading(false)
        } catch (err) {
          console.error("Error in text-to-speech:", err)
          setError("Failed to play audio")
          setIsLoading(false)
          isSpeaking.current = false
        }
      }

      if (!isSpeaking.current) {
        audioQueue.current.push(text)
        await processQueue()
      }
    },
    [audioEnabled, initializeAudio],
  )

  // Send message to AI and get voice response
  const sendVoiceMessage = useCallback(
    async (message: string) => {
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
            systemPrompt: VOICE_SYSTEM_PROMPT,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to get response")
        }

        const data = await response.json()
        setIsLoading(false)

        if (data.response) {
          await speakText(data.response)
        }

        return data.response
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
        setIsLoading(false)
        return null
      }
    },
    [speakText],
  )

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContext.current && audioContext.current.state !== "closed") {
        audioContext.current.close()
      }
    }
  }, [])

  return {
    sendVoiceMessage,
    speakText,
    initializeAudio,
    isLoading,
    error,
    audioEnabled,
    setAudioEnabled,
  }
}
