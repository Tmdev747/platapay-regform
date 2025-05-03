"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { X, MessageSquare, Mic, Send, Loader2, VolumeX, AlertCircle, Maximize2, Minimize2, Volume2 } from "lucide-react"
import { getInitialMessage, getSuggestions, getResponseForQuery } from "./assistant-knowledge"
import { AssistantMessage } from "./assistant-message"
import { UserMessage } from "./user-message"
import { AssistantTyping } from "./assistant-typing"
import { VoiceConversation } from "./voice-conversation"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import Image from "next/image"
import { AudioPermissionModal } from "./audio-permission-modal"

interface AIAssistantProps {
  currentStep: number
  stepTitle: string
  onClose?: () => void
}

type AssistantMode = "chat" | "realtime"

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
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(true) // Default to full screen
  const [showAudioWarning, setShowAudioWarning] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [pendingVoiceMode, setPendingVoiceMode] = useState(false)

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

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isLoading: isSpeechLoading,
    audioEnabled,
    enableAudio,
  } = useTextToSpeech({
    onStart: () => {
      console.log("Started speaking")
      setShowAudioWarning(false)
    },
    onEnd: () => {
      console.log("Finished speaking")
    },
    onError: (error) => {
      console.error("Text-to-speech error:", error)
      setShowPlayButton(true)
      setShowAudioWarning(true)
    },
  })

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

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

          // Only try to speak if audio is enabled
          if (audioEnabled) {
            try {
              await speak(assistantResponse)
            } catch (error) {
              console.error("Error speaking response:", error)
              setShowPlayButton(true)
              setShowAudioWarning(true)
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
    [currentStep, speak, input, audioEnabled],
  )

  const handleSuggestionClick = (suggestion: string) => {
    setUserInteracted(true)
    setInput(suggestion)
    handleSendMessage(suggestion)
  }

  const handleVoiceMessage = useCallback((message: { role: string; content: string }) => {
    setMessages((prevMessages) => [...prevMessages, message])
  }, [])

  const openChat = (mode: AssistantMode) => {
    // If voice is not supported and user selects voice mode, show warning and default to chat
    if (mode === "realtime" && !voiceSupported) {
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
    } else if (mode === "realtime") {
      // If voice mode selected, show permission modal first
      setShowPermissionModal(true)
      setPendingVoiceMode(true)
      // Default to chat mode until permission is granted
      setAssistantMode("chat")
      setShowModeSelector(false)
      setIsOpen(true)
    } else {
      // Regular chat mode
      setAssistantMode(mode)
      setShowModeSelector(false)
      setIsOpen(true)
      setUserInteracted(true)
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

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const handlePlayAudio = (text: string) => {
    // If audio isn't enabled yet, show the warning
    if (!audioEnabled) {
      setShowAudioWarning(true)
      setShowPermissionModal(true)
      return
    }

    speak(text).catch((error) => {
      console.error("Error playing audio:", error)
      setShowAudioWarning(true)
    })
  }

  const handleEnableAudio = () => {
    setShowPermissionModal(true)
  }

  const handlePermissionAllow = useCallback(() => {
    enableAudio()
    setShowPermissionModal(false)
    setShowAudioWarning(false)

    // Add a message to confirm audio is enabled
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: "Salamat! Na-enable na ang audio. Voice features are now available.",
      },
    ])

    // Switch to voice mode if that was the original request
    if (pendingVoiceMode) {
      setTimeout(() => {
        setAssistantMode("realtime")
        setPendingVoiceMode(false)
      }, 500)
    }
  }, [enableAudio, pendingVoiceMode])

  const handlePermissionDeny = useCallback(() => {
    setShowPermissionModal(false)
    setPendingVoiceMode(false)
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content:
          "Okay, gagamitin natin ang text chat mode. Maaari mong i-enable ang audio anytime sa pamamagitan ng pag-click sa 'Enable Audio' button.",
      },
    ])
  }, [])

  return (
    <>
      {/* Chat/Call Icon Button */}
      <button
        onClick={toggleChatIcon}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-[#58317A] text-white flex items-center justify-center shadow-lg hover:bg-[#482968] transition-colors z-40"
      >
        <MessageSquare size={24} />
      </button>

      {/* Mode Selector Modal */}
      {showModeSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModeSelector(false)}></div>
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative z-10">
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
                onClick={() => openChat("realtime")}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                  voiceSupported ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
                } transition-colors relative`}
                disabled={!voiceSupported}
              >
                <Mic size={32} className="text-[#58317A] mb-2" />
                <span className="font-medium">Real-time Voice</span>
                <span className="text-xs text-gray-500 mt-1">Continuous conversation</span>

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

      {/* Chat/Call Interface - Full Screen with visible edges */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 lg:p-12">
          <div className="fixed inset-0 bg-black/50" onClick={closeChat}></div>
          <div
            className={`bg-white rounded-2xl shadow-2xl flex flex-col relative z-10 w-full max-w-full h-full max-h-full overflow-hidden transition-all duration-300 ${
              isFullScreen ? "m-4 md:m-8 lg:m-12" : "max-w-md h-[70vh]"
            }`}
          >
            {/* Header - Styled like the image */}
            <div className="bg-[#58317A] text-white p-4 rounded-t-2xl flex items-center justify-between">
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
              <div className="flex items-center space-x-2">
                <button onClick={toggleFullScreen} className="p-2 hover:bg-[#482968] rounded-full">
                  {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <button onClick={closeChat} className="p-2 hover:bg-[#482968] rounded-full">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto" ref={chatContainerRef} style={{ scrollBehavior: "smooth" }}>
              {/* Audio warning banner */}
              {showAudioWarning && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-4 text-sm flex items-center">
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                  <span>
                    Audio playback requires permission. Please click the "Enable Audio" button below to activate voice
                    features.
                  </span>
                </div>
              )}

              {assistantMode === "realtime" && (
                <div className="bg-[#58317A]/10 border border-[#58317A]/20 text-[#58317A] px-4 py-2 rounded-md mb-4 text-sm">
                  Real-time voice mode active. The assistant will automatically detect when you finish speaking.
                  {!audioEnabled && " Audio is currently disabled. Please enable audio to use voice features."}
                </div>
              )}

              {messages.map((message, index) =>
                message.role === "user" ? (
                  <UserMessage key={index} content={message.content} />
                ) : (
                  <AssistantMessage
                    key={index}
                    content={message.content}
                    onPlayAudio={() => handlePlayAudio(message.content)}
                    showPlayButton={audioEnabled}
                  />
                ),
              )}
              {isThinking && <AssistantTyping />}
            </div>

            <div className="p-4 border-t bg-gray-50">
              {/* Real-time voice conversation component */}
              {assistantMode === "realtime" ? (
                <div className="flex justify-center py-2">
                  <VoiceConversation
                    currentStep={currentStep}
                    onMessageReceived={handleVoiceMessage}
                    audioEnabled={audioEnabled}
                  />
                </div>
              ) : (
                <>
                  {/* Only show suggestions in chat mode */}
                  {assistantMode === "chat" && (
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

                    {!audioEnabled && (
                      <button
                        onClick={handleEnableAudio}
                        className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                      >
                        <Volume2 size={16} className="mr-1" />
                        <span>Enable Audio</span>
                      </button>
                    )}

                    {/* Mode switcher buttons */}
                    <div className="ml-auto flex space-x-2">
                      <button
                        onClick={() => setAssistantMode("chat")}
                        className={`px-3 py-1 rounded-md flex items-center ${
                          assistantMode === "chat" ? "bg-[#58317A] text-white" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        <MessageSquare size={16} className="mr-1" />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => {
                          if (!audioEnabled) {
                            setShowPermissionModal(true)
                            setPendingVoiceMode(true)
                          } else {
                            setAssistantMode("realtime")
                          }
                        }}
                        className={`px-3 py-1 rounded-md flex items-center ${
                          assistantMode === "realtime" ? "bg-[#58317A] text-white" : "bg-gray-200 text-gray-700"
                        }`}
                        disabled={!voiceSupported}
                      >
                        <Mic size={16} className="mr-1" />
                        <span>Voice</span>
                      </button>
                    </div>

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
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {showPermissionModal && (
        <AudioPermissionModal
          onAllow={handlePermissionAllow}
          onDeny={handlePermissionDeny}
          onClose={() => {
            setShowPermissionModal(false)
            setPendingVoiceMode(false)
          }}
        />
      )}
    </>
  )
}

export default AIAssistant
