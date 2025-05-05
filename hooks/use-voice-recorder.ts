"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseVoiceRecorderProps {
  onTranscription?: (text: string) => void
  onError?: (error: Error) => void
}

export function useVoiceRecorder({ onTranscription, onError }: UseVoiceRecorderProps = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const minRecordingTimeRef = useRef<NodeJS.Timeout | null>(null)
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasDataRef = useRef(false)

  // Clean up function to stop all media tracks and clear timeouts
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (minRecordingTimeRef.current) {
      clearTimeout(minRecordingTimeRef.current)
      minRecordingTimeRef.current = null
    }

    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current)
      recordingTimeoutRef.current = null
    }

    mediaRecorderRef.current = null
    hasDataRef.current = false
  }, [])

  // Clean up on component unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

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

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("Stopping recording...")

      // Request data one last time before stopping
      mediaRecorderRef.current.requestData()

      // Small delay to ensure the data is captured
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop()
        }
        setIsRecording(false)
      }, 200)
    } else {
      setIsRecording(false)
      cleanup()

      // If we have no data but tried to stop, report the error
      if (!hasDataRef.current && audioChunksRef.current.length === 0) {
        if (onError) {
          onError(new Error("No audio data recorded"))
        }
      }
    }
  }, [cleanup, onError])

  const processAudioData = useCallback(async () => {
    setIsProcessing(true)
    try {
      if (!hasDataRef.current || audioChunksRef.current.length === 0) {
        throw new Error("No audio data recorded")
      }

      // Get the actual MIME type that was used
      const actualType = mediaRecorderRef.current?.mimeType || "audio/webm"

      // Create audio blob with the actual MIME type
      const audioBlob = new Blob(audioChunksRef.current, { type: actualType })

      if (audioBlob.size < 100) {
        // Check if the blob is too small (likely empty)
        throw new Error("Insufficient audio data recorded")
      }

      console.log(`Audio blob created: ${audioBlob.size} bytes, type: ${actualType}`)

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
      cleanup()
    }
  }, [onTranscription, onError, cleanup])

  const startRecording = useCallback(async () => {
    try {
      // Reset state
      audioChunksRef.current = []
      hasDataRef.current = false

      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream

      // Get supported MIME type
      const mimeType = getSupportedMimeType()

      // Create MediaRecorder with supported options
      const options: MediaRecorderOptions = {}
      if (mimeType) {
        options.mimeType = mimeType
      }

      const mediaRecorder = new MediaRecorder(stream, options)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          hasDataRef.current = true
          console.log(`Received audio chunk: ${event.data.size} bytes`)
        }
      }

      mediaRecorder.onstop = () => {
        processAudioData()
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        if (onError) {
          onError(new Error("Error recording audio"))
        }
        cleanup()
      }

      // Set a minimum recording time to ensure we get some data
      minRecordingTimeRef.current = setTimeout(() => {
        // Request data from the recorder after a short delay
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.requestData()
        }
      }, 500)

      // Set a maximum recording time (30 seconds)
      recordingTimeoutRef.current = setTimeout(() => {
        if (isRecording && mediaRecorder && mediaRecorder.state === "recording") {
          stopRecording()
        }
      }, 30000)

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)

      console.log("Recording started with MIME type:", mimeType || "default")
    } catch (error) {
      console.error("Error starting recording:", error)
      if (onError && error instanceof Error) {
        onError(error)
      }
      cleanup()
    }
  }, [onError, getSupportedMimeType, processAudioData, cleanup, stopRecording, isRecording])

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  }
}
