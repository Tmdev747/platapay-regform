"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"

export function VoiceAssistantDemo() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize speech recognition
  const {
    isListening,
    transcript,
    isSupported: isSpeechRecognitionSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous: false,
    onResult: (result, isFinal) => {
      if (isFinal) {
        handleUserInput(result)
      }
    },
  })

  // Initialize text-to-speech
  const { speak, isSpeaking, audioEnabled, initializeAudio } = useTextToSpeech()

  // Handle user input
  const handleUserInput = async (input: string) => {
    if (!input.trim()) return

    // Add user message
    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])

    // Process with AI
    setIsProcessing(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Add assistant message
      const assistantMessage = { role: "assistant" as const, content: data.response }
      setMessages((prev) => [...prev, assistantMessage])

      // Speak the response
      if (audioEnabled) {
        speak(data.response)
      }
    } catch (error) {
      console.error("Error processing message:", error)
    } finally {
      setIsProcessing(false)
      resetTranscript()
    }
  }

  // Toggle listening
  const toggleListening = async () => {
    if (isListening) {
      stopListening()
    } else {
      if (!isSpeechRecognitionSupported) {
        alert("Speech recognition is not supported in this browser")
        return
      }

      startListening()
    }
  }

  // Toggle audio
  const toggleAudio = async () => {
    if (!audioEnabled) {
      await initializeAudio()
    }
  }

  // Initialize audio on component mount
  useEffect(() => {
    initializeAudio()
  }, [initializeAudio])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Voice Assistant</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-gray-500">
            <p>Say something to start a conversation</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 px-4 py-2 text-gray-900">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500"></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant={audioEnabled ? "default" : "outline"}
          size="icon"
          onClick={toggleAudio}
          title={audioEnabled ? "Audio enabled" : "Audio disabled"}
        >
          {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>

        <Button
          variant={isListening ? "destructive" : "default"}
          onClick={toggleListening}
          disabled={!isSpeechRecognitionSupported}
          className="flex items-center space-x-2"
        >
          {isListening ? (
            <>
              <MicOff className="h-5 w-5" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              <span>Start Listening</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
