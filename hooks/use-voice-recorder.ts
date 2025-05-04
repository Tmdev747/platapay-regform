"use client"

import { useState, useRef, useCallback, useEffect } from "react"

type VoiceRecorderState = "inactive" | "recording" | "paused"

interface UseVoiceRecorderOptions {
  onDataAvailable?: (blob: Blob) => void
  onStart?: () => void
  onStop?: () => void
  onError?: (error: Error) => void
}

export function useVoiceRecorder({ onDataAvailable, onStart, onStop, onError }: UseVoiceRecorderOptions = {}) {
  const [state, setState] = useState<VoiceRecorderState>("inactive")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Check for microphone permission
  const checkPermission = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: "microphone" as PermissionName })
      setIsPermissionGranted(result.state === "granted")
      return result.state === "granted"
    } catch (error) {
      console.error("Error checking microphone permission:", error)
      return false
    }
  }, [])

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setIsPermissionGranted(true)
      return true
    } catch (error) {
      console.error("Error requesting microphone permission:", error)
      setIsPermissionGranted(false)
      onError?.(new Error("Microphone permission denied"))
      return false
    }
  }, [onError])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Check if permission is already granted
      if (isPermissionGranted === null) {
        await checkPermission()
      }

      // Request permission if not granted
      if (isPermissionGranted !== true) {
        const granted = await requestPermission()
        if (!granted) return
      }

      // Get stream if not already available
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      // Create media recorder
      const mediaRecorder = new MediaRecorder(streamRef.current)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        onDataAvailable?.(blob)
        onStop?.()
        setState("inactive")
      }

      // Start recording
      mediaRecorder.start()
      setState("recording")
      onStart?.()
    } catch (error) {
      console.error("Error starting recording:", error)
      onError?.(error instanceof Error ? error : new Error("Failed to start recording"))
    }
  }, [isPermissionGranted, checkPermission, requestPermission, onDataAvailable, onStart, onStop, onError])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }, [state])

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.pause()
      setState("paused")
    }
  }, [state])

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === "paused") {
      mediaRecorderRef.current.resume()
      setState("recording")
    }
  }, [state])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && state !== "inactive") {
        mediaRecorderRef.current.stop()
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [state])

  return {
    state,
    audioBlob,
    isPermissionGranted,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    checkPermission,
    requestPermission,
  }
}
