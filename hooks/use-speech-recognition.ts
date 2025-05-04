"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseSpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  onResult?: (transcript: string, isFinal: boolean) => void
  onEnd?: () => void
  onError?: (error: Error) => void
}

// Define SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new (): SpeechRecognition
}

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition
  new (): SpeechRecognition
}

export function useSpeechRecognition({
  continuous = true,
  interimResults = true,
  lang = "en-US",
  onResult,
  onEnd,
  onError,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isSupported, setIsSupported] = useState<boolean | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Check if speech recognition is supported
  useEffect(() => {
    const supported = "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    setIsSupported(supported)
  }, [])

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (!isSupported) return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = lang

    recognition.onresult = (event) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript)
        onResult?.(finalTranscript, true)
      }

      if (interimTranscript) {
        setInterimTranscript(interimTranscript)
        onResult?.(interimTranscript, false)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      onEnd?.()
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      onError?.(new Error(event.error))
    }

    return recognition
  }, [isSupported, continuous, interimResults, lang, onResult, onEnd, onError])

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.(new Error("Speech recognition is not supported in this browser"))
      return
    }

    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition()
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        setTranscript("")
        setInterimTranscript("")
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        onError?.(error instanceof Error ? error : new Error("Failed to start speech recognition"))
      }
    }
  }, [isSupported, initRecognition, onError])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}
