"use client"

import { useState, useRef, useCallback } from "react"

interface UseVoiceRecorderProps {
  onTranscription?: (text: string) => void
  onError?: (error: Error) => void
}

export function useVoiceRecorder({ onTranscription, onError }: UseVoiceRecorderProps = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Helper function to get supported MIME type
  const getSupportedMimeType = useCallback(() => {
    const types = [
      "audio/webm",
      "audio/webm;codecs=opus",
      "audio/ogg;codecs=opus",
      "audio/mp4",
      "audio/mpeg",
      "audio/wav",
      "", // Empty string as fallback (browser will use default)
    ]

    for (const type of types) {
      if (type === "" || MediaRecorder.isTypeSupported(type)) {
        console.log(`Using MIME type: ${type || "default browser codec"}`)
        return type
      }
    }

    return "" // Use default if nothing else is supported
  }, [])

  const startRecording = useCallback(async () => {
    try {
      audioChunksRef.current = []
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Get supported MIME type
      const mimeType = getSupportedMimeType()

      // Create MediaRecorder with supported options
      const options: MediaRecorderOptions = {}
      if (mimeType) {
        options.mimeType = mimeType
      }

      const mediaRecorder = new MediaRecorder(stream, options)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        try {
          // Get the actual MIME type that was used
          const actualType = mediaRecorder.mimeType || "audio/webm"

          // Create audio blob with the actual MIME type
          const audioBlob = new Blob(audioChunksRef.current, { type: actualType })

          if (audioBlob.size === 0) {
            throw new Error("No audio data recorded")
          }

          // Create a FormData object to send the audio file
          const formData = new FormData()
          formData.append(
            "audio",
            audioBlob,
            `recording${actualType.includes("webm") ? ".webm" : actualType.includes("ogg") ? ".ogg" : ".wav"}`,
          )
          formData.append("mimeType", actualType) // Send the MIME type to the server

          // Send the audio to the server for transcription
          const response = await fetch("/api/speech-to-text", {
            method: "POST",
            body: formData,
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "Failed to transcribe audio")
          }

          if (!data.text) {
            throw new Error("No transcription returned")
          }

          if (onTranscription) {
            onTranscription(data.text)
          }
        } catch (error) {
          console.error("Error processing audio:", error)
          if (onError && error instanceof Error) {
            onError(error)
          }
        } finally {
          setIsProcessing(false)

          // Stop all audio tracks
          stream.getTracks().forEach((track) => track.stop())
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      if (onError && error instanceof Error) {
        onError(error)
      }
    }
  }, [onTranscription, onError, getSupportedMimeType])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  }
}
