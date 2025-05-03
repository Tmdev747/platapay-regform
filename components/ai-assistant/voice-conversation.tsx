"use client"

import { useState, useEffect, useCallback } from "react"
import { Mic, MicOff, VolumeX, Loader2 } from "lucide-react"
import { useRealTimeVoice } from "@/hooks/use-real-time-voice"
import { useStreamingTTS } from "@/hooks/use-streaming-tts"
import { getResponseForQuery } from "./assistant-knowledge"

interface VoiceConversationProps {
  currentStep: number
  onMessageReceived?: (message: { role: string; content: string }) => void
  audioEnabled?: boolean
}

export function VoiceConversation({ currentStep, onMessageReceived, audioEnabled = false }: VoiceConversationProps) {
  const [isActive, setIsActive] = useState(false)
  const [conversationActive, setConversationActive] = useState(false)
  const [statusMessage, setStatusMessage] = useState("Click to start voice conversation")
  const [visualFeedback, setVisualFeedback] = useState<"idle" | "listening" | "processing" | "speaking">("idle")

  // Initialize real-time voice hook
  const {
    isListening,
    isProcessing: isProcessingVoice,
    permissionGranted,
    startListening,
    stopListening,
  } = useRealTimeVoice({
    onSpeechDetected: (text) => {
      if (onMessageReceived) {
        onMessageReceived({ role: "user", content: text })
      }
      handleUserSpeech(text)
      setVisualFeedback("processing")
    },
    onSpeechStart: () => {
      setVisualFeedback("listening")
      setStatusMessage("Listening...")
    },
    onSpeechEnd: () => {
      setStatusMessage("Processing...")
    },
    onError: (error) => {
      console.error("Voice error:", error)
      setStatusMessage(`Error: ${error.message}`)
      setVisualFeedback("idle")
    },
    autoStopTimeout: 1500, // 1.5 seconds of silence to trigger processing
  })

  // Initialize streaming TTS hook
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isLoading: isLoadingTTS,
  } = useStreamingTTS({
    onStart: () => {
      setVisualFeedback("speaking")
      setStatusMessage("Speaking...")
    },
    onEnd: () => {
      if (conversationActive) {
        setVisualFeedback("idle")
        setStatusMessage("Listening for your response...")
      }
    },
    onError: (error) => {
      console.error("TTS error:", error)
      setStatusMessage(`Audio error: ${error.message}`)
    },
  })

  // Handle user speech
  const handleUserSpeech = useCallback(
    (text: string) => {
      if (!text.trim()) return

      try {
        // Get AI response
        const assistantResponse = getResponseForQuery(text, currentStep)

        // Add to conversation
        if (onMessageReceived) {
          onMessageReceived({ role: "assistant", content: assistantResponse })
        }

        // Speak the response if audio is enabled
        if (audioEnabled) {
          speak(assistantResponse).catch((error) => {
            console.error("Error speaking in voice conversation:", error)
          })
        }
      } catch (error) {
        console.error("Error processing speech:", error)
        setStatusMessage("Error processing your request")
      }
    },
    [currentStep, speak, audioEnabled, onMessageReceived],
  )

  // Toggle voice conversation
  const toggleVoiceConversation = useCallback(() => {
    if (!isActive) {
      // Starting conversation
      setIsActive(true)
      setStatusMessage("Initializing voice conversation...")

      // Check if audio is enabled
      if (!audioEnabled) {
        setStatusMessage("Audio needs to be enabled for voice conversation")
        return
      }

      // Start listening
      startListening()
      setConversationActive(true)
      setStatusMessage("Listening...")
    } else {
      // Stopping conversation
      stopListening()
      stopSpeaking()
      setIsActive(false)
      setConversationActive(false)
      setStatusMessage("Voice conversation ended")
      setVisualFeedback("idle")
    }
  }, [isActive, audioEnabled, startListening, stopListening, stopSpeaking])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isListening) stopListening()
      if (isSpeaking) stopSpeaking()
    }
  }, [isListening, isSpeaking, stopListening, stopSpeaking])

  // Start listening automatically when audio is enabled
  useEffect(() => {
    if (audioEnabled && !isActive && !isListening) {
      // Small delay to ensure everything is initialized
      const timer = setTimeout(() => {
        setIsActive(true)
        startListening()
        setConversationActive(true)
        setStatusMessage("Listening...")
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [audioEnabled, isActive, isListening, startListening])

  // Visual feedback classes
  const getVisualFeedbackClass = () => {
    switch (visualFeedback) {
      case "listening":
        return "bg-green-500 animate-pulse"
      case "processing":
        return "bg-yellow-500"
      case "speaking":
        return "bg-blue-500 animate-pulse"
      default:
        return isActive ? "bg-[#58317A]" : "bg-gray-400"
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Status message */}
      <div className="text-sm text-gray-600 mb-2">{statusMessage}</div>

      {/* Voice controls */}
      <div className="flex items-center space-x-3">
        {/* Microphone button */}
        <button
          onClick={toggleVoiceConversation}
          disabled={!audioEnabled || isProcessingVoice}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            !audioEnabled ? "bg-gray-300 cursor-not-allowed" : getVisualFeedbackClass()
          } text-white`}
        >
          {isProcessingVoice ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isActive ? (
            <MicOff size={24} />
          ) : (
            <Mic size={24} />
          )}
        </button>

        {/* Stop speaking button */}
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 text-white"
          >
            <VolumeX size={20} />
          </button>
        )}
      </div>

      {/* Permission status */}
      {permissionGranted === false && (
        <div className="mt-2 text-sm text-red-500">
          Microphone access denied. Please allow microphone access in your browser settings.
        </div>
      )}

      {/* Visual indicators */}
      <div className="flex items-center space-x-1 mt-3">
        <div className={`w-2 h-2 rounded-full ${visualFeedback === "idle" ? "bg-gray-300" : "bg-green-500"}`}></div>
        <div
          className={`w-2 h-2 rounded-full ${visualFeedback === "listening" ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
        ></div>
        <div
          className={`w-2 h-2 rounded-full ${visualFeedback === "processing" ? "bg-yellow-500" : "bg-gray-300"}`}
        ></div>
        <div
          className={`w-2 h-2 rounded-full ${visualFeedback === "speaking" ? "bg-blue-500 animate-pulse" : "bg-gray-300"}`}
        ></div>
      </div>
    </div>
  )
}
