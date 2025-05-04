"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseTextToSpeechOptions {
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
  defaultVoiceId?: string
}

export function useTextToSpeech({ onStart, onEnd, onError, defaultVoiceId }: UseTextToSpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [currentVoiceId, setCurrentVoiceId] = useState(defaultVoiceId)

  const audioContext = useRef<AudioContext | null>(null)
  const audioQueue = useRef<string[]>([])
  const isSpeakingRef = useRef(false)

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
      onError?.(err instanceof Error ? err : new Error("Failed to enable audio"))
      setAudioEnabled(false)
      return false
    }
  }, [onError])

  // Process text to speech
  const speak = useCallback(
    async (text: string, voiceId?: string) => {
      if (!audioEnabled) {
        audioQueue.current.push(text)
        const success = await initializeAudio()
        if (!success) return
      }

      if (isSpeakingRef.current) {
        audioQueue.current.push(text)
        return
      }

      const processQueue = async () => {
        if (audioQueue.current.length === 0) {
          isSpeakingRef.current = false
          setIsSpeaking(false)
          return
        }

        const nextText = audioQueue.current.shift()
        if (!nextText) {
          isSpeakingRef.current = false
          setIsSpeaking(false)
          return
        }

        isSpeakingRef.current = true
        setIsSpeaking(true)
        setIsLoading(true)
        onStart?.()

        try {
          const response = await fetch("/api/text-to-speech", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: nextText,
              voiceId: voiceId || currentVoiceId,
            }),
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

          setIsLoading(false)
          await audio.play()
        } catch (err) {
          console.error("Error in text-to-speech:", err)
          onError?.(err instanceof Error ? err : new Error("Failed to play audio"))
          setIsLoading(false)
          isSpeakingRef.current = false
          setIsSpeaking(false)
          processQueue()
        }
      }

      if (!isSpeakingRef.current) {
        audioQueue.current.push(text)
        await processQueue()
      }
    },
    [audioEnabled, initializeAudio, onStart, onError, currentVoiceId],
  )

  // Stop speaking
  const stop = useCallback(() => {
    audioQueue.current = []
    isSpeakingRef.current = false
    setIsSpeaking(false)
    onEnd?.()
  }, [onEnd])

  // Set voice
  const setVoice = useCallback((voiceId: string) => {
    setCurrentVoiceId(voiceId)
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioContext.current && audioContext.current.state !== "closed") {
        audioContext.current.close()
      }
    }
  }, [])

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    audioEnabled,
    initializeAudio,
    setVoice,
    currentVoiceId,
  }
}
