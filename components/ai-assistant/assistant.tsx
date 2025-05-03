"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { X, MessageSquare, Mic, Send, Loader2, VolumeX, Phone, AlertCircle } from "lucide-react"
import { getInitialMessage, getSuggestions, getResponseForQuery } from "./assistant-knowledge"
import { AssistantMessage } from "./assistant-message"
import { UserMessage } from "./user-message"
import { AssistantTyping } from "./assistant-typing"
import { useVoiceRecorder } from "@/hooks/use-voice-recorder"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import Image from "next/image"

interface AIAssistantProps {
  currentStep: number
  stepTitle: string
  onClose?: () => void
}

type AssistantMode = "chat" | "call"

const AIAssistant: React.FC<AIAssistantProps> = ({ currentStep, stepTitle, onClose }) => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: getInitialMessage() },
  ])
  const [input, setInput] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [assistantMode, setAssistantMode] = useState<AssistantMode>("chat")
  const [userInteracted, setUserInteracted] = useState(false)
  const [showPlayButton, setShowPlayButton] = useState(true)
  const [isRecordingState, setIsRecordingState] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)

  // Fallback to text input if voice fails repeatedly
  const [voiceFailCount, setVoiceFailCount] = useState(0)

  // Check if browser supports getUserMedia
  useEffect(() => {
    const checkVoiceSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setVoiceSupported(false)
          return
        }

        // Try to get permission
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setVoiceSupported(true)
      } catch (err) {
        console.error("Voice recording not supported:", err)
        setVoiceSupported(false)
      }
    }

    checkVoiceSupport()
  }, [])

  useEffect(() => {
    if (voiceFailCount >= 3 && assistantMode === "call") {
      // After 3 failures, suggest switching to chat mode
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Mukhang may problema sa voice recording. Gusto mo bang lumipat sa text chat mode?",
        },
      ])

      // Reset the counter
      setVoiceFailCount(0)
    }
  }, [voiceFailCount, assistantMode])

  const {
    isRecording: isVoiceRecorderRecording,
    isProcessing: isVoiceProcessing,
    startRecording,
    stopRecording,
  } = useVoiceRecorder({
    onTranscription: (text) => {
      if (text && text.trim()) {
        setInput(text)
        handleSendMessage(text)
        // Reset fail count on success
        setVoiceFailCount(0)
      } else {
        // Handle empty transcription
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: "Paumanhin, hindi ko maintindihan ang sinabi mo. Pakiulit." },
        ])
        setVoiceFailCount((prev) => prev + 1)
      }
    },
    onError: (error) => {
      console.error("Voice recording error:", error)
      // Show error message to user
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: `Nagkaroon ng problema sa pag-record ng audio: ${error.message}. Pakisubukang muli o gamitin ang text chat.`,
        },
      ])

      // Increment fail counter
      setVoiceFailCount((prev) => prev + 1)

      // Reset recording state
      setIsRecordingState(false)
    },
  })

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isLoading: isSpeechLoading,
  } = useTextToSpeech({
    onStart: () => {
      console.log("Started speaking")
    },
    onEnd: () => {
      console.log("Finished speaking")
    },
    onError: (error) => {
      console.error("Text-to-speech error:", error)
      setShowPlayButton(true)
    },
  })

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Auto-greet when call mode is activated
  useEffect(() => {
    if (isOpen && assistantMode === "call" && !userInteracted) {
      // Slight delay to ensure UI is ready
      const timer = setTimeout(() => {
        speak(getInitialMessage())
        setUserInteracted(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen, assistantMode, userInteracted, speak])

  const handleSendMessage = useCallback(
    async (messageContent: string = input) => {
      if (messageContent.trim() !== "") {
        setUserInteracted(true)
        const userMessage = { role: "user", content: messageContent }
        setMessages((prevMessages) => [...prevMessages, userMessage])
        setInput("")
        setIsThinking(true)

        try {
          const assistantResponse = getResponseForQuery(messageContent, currentStep)
          const assistantMessage = { role: "assistant", content: assistantResponse }
          setMessages((prevMessages) => [...prevMessages, assistantMessage])

          // Auto-speak in call mode
          if (assistantMode === "call") {
            try {
              await speak(assistantResponse)
            } catch (error) {
              console.error("Error speaking response:", error)
              setShowPlayButton(true)
            }
          }
        } catch (error) {
          console.error("Error getting AI response:", error)
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: "assistant", content: "Paumanhin, may naganap na error. Pakisubukang muli." },
          ])
        } finally {
          setIsThinking(false)
        }
      }
    },
    [currentStep, speak, input, assistantMode],
  )

  const toggleRecording = () => {
    setUserInteracted(true)
    if (isVoiceRecorderRecording) {
      stopRecording()
      setIsRecordingState(false)
    } else {
      try {
        startRecording()
        setIsRecordingState(true)
      } catch (error) {
        console.error("Failed to start recording:", error)
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content: "Hindi makapagsimula ng recording. Pakitingnan kung ang iyong browser ay may access sa mikropono.",
          },
        ])
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setUserInteracted(true)
    setInput(suggestion)
    handleSendMessage(suggestion)
  }

  const openChat = (mode: AssistantMode) => {
    // If voice is not supported and user selects call mode, show warning and default to chat
    if (mode === "call" && !voiceSupported) {
      setAssistantMode("chat")
      setShowModeSelector(false)
      setIsOpen(true)
      setUserInteracted(true)

      // Add a message explaining the issue
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content:
              "Paumanhin, ang voice mode ay hindi available sa browser na ito. Gagamitin natin ang text chat mode.",
          },
        ])
      }, 500)
    } else {
      setAssistantMode(mode)
      setShowModeSelector(false)
      setIsOpen(true)
      setUserInteracted(mode === "chat") // Only set as interacted for chat mode, call mode will auto-greet
    }
  }

  const closeChat = () => {
    setIsOpen(false)
    if (onClose) {
      onClose()
    }
  }

  const toggleChatIcon = () => {
    if (isOpen) {
      closeChat()
    } else {
      setShowModeSelector(true)
    }
  }

  // Pulsing animation for call button
  const pulsingClass = isVoiceRecorderRecording
    ? "animate-none bg-red-500"
    : "relative after:absolute after:inset-0 after:rounded-full after:animate-ping after:bg-[#58317A]/40 after:-z-10"

  return (
    <>
      {/* Chat/Call Icon Button */}
      <button
        onClick={toggleChatIcon}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-[#58317A] text-white flex items-center justify-center shadow-lg hover:bg-[#482968] transition-colors"
      >
        <MessageSquare size={24} />
      </button>

      {/* Mode Selector Modal */}
      {showModeSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModeSelector(false)}></div>
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative z-10">
            <h3 className="text-lg font-semibold mb-4 text-center">How would you like to interact?</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => openChat("chat")}
                className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageSquare size={32} className="text-[#58317A] mb-2" />
                <span className="font-medium">Chat</span>
                <span className="text-xs text-gray-500 mt-1">Text-based conversation</span>
              </button>
              <button
                onClick={() => openChat("call")}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                  voiceSupported ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
                } transition-colors relative`}
                disabled={!voiceSupported}
              >
                <Phone size={32} className="text-[#58317A] mb-2" />
                <span className="font-medium">Call</span>
                <span className="text-xs text-gray-500 mt-1">Voice conversation</span>

                {!voiceSupported && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <div className="flex items-center text-red-500 text-xs font-medium">
                      <AlertCircle size={14} className="mr-1" />
                      Not supported in this browser
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat/Call Interface */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/50" onClick={closeChat}></div>
          <div className="bg-white rounded-t-lg sm:rounded-lg shadow-lg w-full max-w-md h-[70vh] flex flex-col relative z-10">
            {/* Header - Styled like the image */}
            <div className="bg-[#58317A] text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border-2 border-white">
                  <Image
                    src="/images/assistant-avatar.png"
                    alt="Assistant"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">MARIA AI</h2>
                  <p className="text-sm opacity-90">PlataPay {assistantMode === "chat" ? "CSR" : "Voice Assistant"}</p>
                </div>
              </div>
              <button onClick={closeChat} className="p-2 hover:bg-[#482968] rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto" ref={chatContainerRef} style={{ scrollBehavior: "smooth" }}>
              {assistantMode === "call" && (
                <div className="bg-[#58317A]/10 border border-[#58317A]/20 text-[#58317A] px-4 py-2 rounded-md mb-4 text-sm">
                  Voice mode active. {isVoiceRecorderRecording ? "Listening..." : "Click the microphone to speak."}
                </div>
              )}

              {messages.map((message, index) =>
                message.role === "user" ? (
                  <UserMessage key={index} content={message.content} />
                ) : (
                  <AssistantMessage
                    key={index}
                    content={message.content}
                    onPlayAudio={() => speak(message.content)}
                    showPlayButton={index === 0 ? showPlayButton : true}
                  />
                ),
              )}
              {isThinking && <AssistantTyping />}
            </div>

            <div className="p-4 border-t bg-gray-50">
              {/* Only show suggestions in chat mode or when not recording in call mode */}
              {(assistantMode === "chat" || !isVoiceRecorderRecording) && (
                <div className="flex space-x-2 mb-2 overflow-x-auto">
                  {getSuggestions(currentStep).map((suggestion, index) => (
                    <button
                      key={index}
                      className="px-3 py-1 bg-white border border-gray-200 text-[#58317A] rounded-full text-sm focus:outline-none hover:bg-[#58317A]/5"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center">
                {/* Only show text input in chat mode */}
                {assistantMode === "chat" && (
                  <input
                    type="text"
                    className="flex-1 p-3 border rounded-md focus:outline-none focus:ring focus:border-[#58317A] bg-white"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage()
                      }
                    }}
                  />
                )}

                {/* Only show send button in chat mode */}
                {assistantMode === "chat" && (
                  <button
                    onClick={handleSendMessage}
                    className="ml-2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 bg-[#58317A] text-white"
                    disabled={isThinking || !input.trim()}
                  >
                    {isThinking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={18} />}
                  </button>
                )}

                {/* Show mic button in both modes, but make it more prominent in call mode */}
                <button
                  onClick={toggleRecording}
                  disabled={isThinking || !voiceSupported}
                  className={`${
                    assistantMode === "call" ? "flex-1 py-3" : "ml-2 w-10 h-10"
                  } rounded-full flex items-center justify-center disabled:opacity-50 ${
                    !voiceSupported
                      ? "bg-gray-300 text-gray-500"
                      : assistantMode === "call"
                        ? isVoiceRecorderRecording
                          ? "bg-red-500 text-white"
                          : `bg-[#58317A] text-white ${pulsingClass}`
                        : ""
                  }`}
                >
                  {isVoiceProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Mic
                        size={assistantMode === "call" ? 24 : 20}
                        className={`${
                          !voiceSupported
                            ? "text-gray-500"
                            : isVoiceRecorderRecording || assistantMode === "call"
                              ? "text-white"
                              : "text-[#58317A]"
                        }`}
                      />
                      {assistantMode === "call" && (
                        <span className="ml-2 font-medium">
                          {isVoiceRecorderRecording ? "Listening..." : "Tap to speak"}
                        </span>
                      )}
                    </>
                  )}
                </button>

                {/* Stop speaking button */}
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="ml-2 w-10 h-10 rounded-full flex items-center justify-center bg-gray-200"
                  >
                    <VolumeX size={20} className="text-[#58317A]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIAssistant
