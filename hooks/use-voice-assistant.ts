"use client"

import { useState, useCallback, useEffect } from "react"
import { useSpeechRecognition } from "./use-speech-recognition"
import { useTextToSpeech } from "./use-text-to-speech"
import { useAuth } from "@/contexts/auth-context"
import { createBrowserClient } from "@/lib/supabase"
import type { Message } from "@/lib/ai"

interface UseVoiceAssistantOptions {
  autoStart?: boolean
  continuous?: boolean
  lang?: string
  defaultVoiceId?: string
  onError?: (error: Error) => void
}

export function useVoiceAssistant({
  autoStart = false,
  continuous = true,
  lang = "en-US",
  defaultVoiceId,
  onError,
}: UseVoiceAssistantOptions = {}) {
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()
  const supabase = createBrowserClient()

  // Initialize speech recognition
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isSpeechRecognitionSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous,
    lang,
    onResult: (result, isFinal) => {
      if (isFinal && isActive) {
        handleUserInput(result)
      }
    },
    onError: (err) => {
      setError(err.message)
      onError?.(err)
    },
  })

  // Initialize text-to-speech
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isLoading: isTextToSpeechLoading,
    audioEnabled,
    initializeAudio,
  } = useTextToSpeech({
    defaultVoiceId,
    onError: (err) => {
      setError(err.message)
      onError?.(err)
    },
  })

  // Create a new conversation
  const createConversation = useCallback(async () => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: "New Conversation",
        })
        .select()
        .single()

      if (error) throw error

      setCurrentConversationId(data.id)
      return data.id
    } catch (err) {
      console.error("Error creating conversation:", err)
      setError("Failed to create conversation")
      return null
    }
  }, [user, supabase])

  // Save message to Supabase
  const saveMessage = useCallback(
    async (role: "user" | "assistant", content: string) => {
      if (!user || !currentConversationId) return

      try {
        await supabase.from("messages").insert({
          conversation_id: currentConversationId,
          role,
          content,
        })
      } catch (err) {
        console.error("Error saving message:", err)
      }
    },
    [user, currentConversationId, supabase],
  )

  // Handle user input
  const handleUserInput = useCallback(
    async (input: string) => {
      if (!input.trim() || isProcessing) return

      // Add user message
      const userMessage: Message = { role: "user", content: input }
      setMessages((prev) => [...prev, userMessage])
      setIsProcessing(true)

      // Save user message to Supabase
      if (user && !currentConversationId) {
        const conversationId = await createConversation()
        if (conversationId) {
          await saveMessage("user", input)
        }
      } else if (user && currentConversationId) {
        await saveMessage("user", input)
      }

      try {
        // Process with AI
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            userId: user?.id,
            conversationId: currentConversationId,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to get response")
        }

        const data = await response.json()

        // Add assistant message
        const assistantMessage: Message = { role: "assistant", content: data.response }
        setMessages((prev) => [...prev, assistantMessage])

        // Save assistant message to Supabase
        if (user && currentConversationId) {
          await saveMessage("assistant", data.response)
        }

        // Speak the response
        if (audioEnabled) {
          speak(data.response)
        }
      } catch (err) {
        console.error("Error processing message:", err)
        setError("Failed to process message")
        onError?.(err instanceof Error ? err : new Error("Failed to process message"))
      } finally {
        setIsProcessing(false)
        resetTranscript()
      }
    },
    [
      isProcessing,
      messages,
      user,
      currentConversationId,
      createConversation,
      saveMessage,
      audioEnabled,
      speak,
      resetTranscript,
      onError,
    ],
  )

  // Start the voice assistant
  const start = useCallback(async () => {
    if (!isSpeechRecognitionSupported) {
      setError("Speech recognition is not supported in this browser")
      onError?.(new Error("Speech recognition is not supported in this browser"))
      return
    }

    // Initialize audio
    if (!audioEnabled) {
      await initializeAudio()
    }

    // Start listening
    startListening()
    setIsActive(true)
  }, [isSpeechRecognitionSupported, audioEnabled, initializeAudio, startListening, onError])

  // Stop the voice assistant
  const stop = useCallback(() => {
    stopListening()
    stopSpeaking()
    setIsActive(false)
  }, [stopListening, stopSpeaking])

  // Toggle the voice assistant
  const toggle = useCallback(() => {
    if (isActive) {
      stop()
    } else {
      start()
    }
  }, [isActive, start, stop])

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      start()
    }

    return () => {
      stop()
    }
  }, [autoStart, start, stop])

  return {
    isActive,
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    interimTranscript,
    messages,
    error,
    start,
    stop,
    toggle,
    handleUserInput,
  }
}
