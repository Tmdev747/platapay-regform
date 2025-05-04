"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface ConfigStatus {
  mapbox: boolean
  supabase: boolean
  elevenlabs: boolean
  groq: boolean
}

export function ConfigWarning() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch("/api/config/check")
        if (!response.ok) {
          throw new Error("Failed to check configuration")
        }
        const data = await response.json()
        setConfigStatus(data.configured)
      } catch (err) {
        console.error("Error checking configuration:", err)
        setError("Failed to check environment configuration")
      } finally {
        setLoading(false)
      }
    }

    checkConfig()
  }, [])

  if (loading || !configStatus) return null

  // If all configs are good, don't show anything
  if (Object.values(configStatus).every(Boolean)) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Configuration Warning</AlertTitle>
      <AlertDescription>
        <p>The following environment variables are missing or not configured correctly:</p>
        <ul className="list-disc pl-5 mt-2">
          {!configStatus.mapbox && (
            <li>
              <strong>MAPBOX_TOKEN</strong> - Required for maps functionality
            </li>
          )}
          {!configStatus.supabase && (
            <li>
              <strong>SUPABASE</strong> - Required for authentication and database
            </li>
          )}
          {!configStatus.elevenlabs && (
            <li>
              <strong>ELEVEN_LABS</strong> - Required for voice functionality
            </li>
          )}
          {!configStatus.groq && (
            <li>
              <strong>GROQ_API_KEY</strong> - Required for AI assistant functionality
            </li>
          )}
        </ul>
        <p className="mt-2">
          Please check your environment variables and make sure they are set correctly. See the README or
          .env.local.example for more information.
        </p>
      </AlertDescription>
    </Alert>
  )
}
