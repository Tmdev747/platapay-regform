"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseRealTimeVoiceProps {
  onSpeechDetected: (text: string) => void
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
  onError?: (error: Error) => void
  autoStopTimeout?: number // Time in ms to wait for silence before processing
}

export function useRealTimeVoice({
  onSpeechDetected,
  onSpeechStart,
  onSpeechEnd,
  onError,
  autoStopTimeout = 1500, // Default 1.5 seconds of silence to trigger processing
}: UseRealTimeVoiceProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const isSpeakingRef = useRef(false)
  const processingLockRef = useRef(false)

  // Clean up function
  const cleanup = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
      mediaRecorderRef.current = null
    }

    audioChunksRef.current = []
    setIsListening(false)
    isSpeakingRef.current = false
    processingLockRef.current = false
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Function to check if user is speaking by analyzing audio levels
  const setupVoiceActivityDetection = useCallback(
    (stream: MediaStream) => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContext) {
          console.warn("AudioContext not supported")
          return
        }

        audioContextRef.current = new AudioContext()
        const analyser = audioContextRef.current.createAnalyser()
        analyserRef.current = analyser

        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8

        const source = audioContextRef.current.createMediaStreamSource(stream)
        source.connect(analyser)

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        // Function to check audio levels
        const checkAudioLevel = () => {
          if (!isListening || !analyserRef.current) return

          analyserRef.current.getByteFrequencyData(dataArray)

          // Calculate average volume level
          let sum = 0
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i]
          }
          const average = sum / bufferLength

          // Threshold for speech detection (adjust as needed)
          const threshold = 15
          const wasSpeaking = isSpeakingRef.current
          isSpeakingRef.current = average > threshold

          // If user started speaking
          if (!wasSpeaking && isSpeakingRef.current) {
            console.log("Speech started")
            if (silenceTimeoutRef.current) {
              clearTimeout(silenceTimeoutRef.current)
              silenceTimeoutRef.current = null
            }
            if (onSpeechStart) onSpeechStart()
          }

          // If user stopped speaking
          if (wasSpeaking && !isSpeakingRef.current) {
            console.log("Speech paused, waiting to confirm end")

            // Set a timeout to see if they're really done speaking
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)

            silenceTimeoutRef.current = setTimeout(() => {
              if (!isSpeakingRef.current && !processingLockRef.current) {
                console.log("Speech ended, processing audio")
                processingLockRef.current = true
                processAudioData()
                if (onSpeechEnd) onSpeechEnd()
              }
            }, autoStopTimeout)
          }

          // Continue checking audio levels
          if (isListening) {
            requestAnimationFrame(checkAudioLevel)
          }
        }

        // Start checking audio levels
        checkAudioLevel()
      } catch (error) {
        console.error("Error setting up voice activity detection:", error)
      }
    },
    [isListening, autoStopTimeout, onSpeechStart, onSpeechEnd],
  )

  // Process the recorded audio
  const processAudioData = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      processingLockRef.current = false
      return
    }

    setIsProcessing(true)

    try {
      // Get the actual MIME type that was used
      const actualType = mediaRecorderRef.current?.mimeType || "audio/webm"

      // Create audio blob with the actual MIME type
      const audioBlob = new Blob(audioChunksRef.current, { type: actualType })

      if (audioBlob.size < 100) {
        throw new Error("Insufficient audio data recorded")
      }

      console.log(`Processing audio: ${audioBlob.size} bytes, type: ${actualType}`)

      // Create a FormData object to send the audio file
      const formData = new FormData()
      formData.append(
        "audio",
        audioBlob,
        `recording${actualType.includes("webm") ? ".webm" : actualType.includes("ogg") ? ".ogg" : ".wav"}`,
      )
      formData.append("mimeType", actualType)

      // Send the audio to the server for transcription
      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to transcribe audio")
      }

      if (data.text && data.text.trim()) {
        onSpeechDetected(data.text)
      }

      // Reset for next recording
      audioChunksRef.current = []
    } catch (error) {
      console.error("Error processing audio:", error)
      if (onError && error instanceof Error) {
        onError(error)
      }
    } finally {
      setIsProcessing(false)
      processingLockRef.current = false
    }
  }, [onSpeechDetected, onError])

  // Get supported MIME type
  const getSupportedMimeType = useCallback(() => {
    const types = [
      "audio/webm",
      "audio/webm;codecs=opus",
      "audio/ogg;codecs=opus",
      "audio/mp4",
      "audio/mpeg",
      "audio/wav",
      "", // Empty string as fallback
    ]

    for (const type of types) {
      if (type === "" || MediaRecorder.isTypeSupported(type)) {
        console.log(`Using MIME type: ${type || "default browser codec"}`)
        return type
      }
    }

    return ""
  }, [])

  // Start listening for speech
  const startListening = useCallback(async () => {
    try {
      // Reset state
      audioChunksRef.current = []

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      setPermissionGranted(true)
      streamRef.current = stream

      // Set up voice activity detection
      setupVoiceActivityDetection(stream)

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
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        if (onError) {
          onError(new Error("Error recording audio"))
        }
        cleanup()
      }

      // Start recording
      mediaRecorder.start(100) // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder
      setIsListening(true)

      console.log("Real-time voice listening started")
    } catch (error) {
      console.error("Error starting voice listening:", error)
      setPermissionGranted(false)
      if (onError && error instanceof Error) {
        onError(error)
      }
    }
  }, [cleanup, getSupportedMimeType, onError, setupVoiceActivityDetection])

  // Stop listening
  const stopListening = useCallback(() => {
    cleanup()
  }, [cleanup])

  return {
    isListening,
    isProcessing,
    permissionGranted,
    startListening,
    stopListening,
  }
}
