"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<{ name: string; exists: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initStatus, setInitStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [initMessage, setInitMessage] = useState("")

  const templateNames = [
    "verification",
    "application-submitted",
    "application-reminder",
    "application-status-update",
    "onboarding-welcome",
  ]

  useEffect(() => {
    checkTemplates()
  }, [])

  const checkTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real implementation, you would make an API call to check templates
      // For now, we'll simulate this with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate template status
      const templateStatus = templateNames.map((name) => ({
        name,
        exists: Math.random() > 0.3, // Randomly set some templates as missing for demo
      }))

      setTemplates(templateStatus)
    } catch (err) {
      setError("Failed to check template status")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const initializeTemplates = async () => {
    try {
      setInitStatus("loading")
      setInitMessage("")

      const response = await fetch("/api/init-templates")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to initialize templates")
      }

      setInitStatus("success")
      setInitMessage(data.message || "Templates initialized successfully")

      // Refresh template status
      await checkTemplates()
    } catch (err) {
      setInitStatus("error")
      setInitMessage(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Email Templates</h1>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Status</CardTitle>
            <CardDescription>Check and initialize email templates</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#58317A]" />
                <span className="ml-2">Checking template status...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {templates.map((template) => (
                    <div key={template.name} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <span className="font-medium">{template.name}</span>
                        <span className="text-sm text-gray-500 block">.hbs template</span>
                      </div>
                      {template.exists ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col space-y-4">
                  <Button onClick={checkTemplates} variant="outline" disabled={loading} className="w-full">
                    Refresh Status
                  </Button>

                  <Button
                    onClick={initializeTemplates}
                    className="w-full bg-[#58317A] hover:bg-[#482968]"
                    disabled={initStatus === "loading"}
                  >
                    {initStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Initializing...
                      </>
                    ) : (
                      "Initialize All Templates"
                    )}
                  </Button>

                  {initStatus === "success" && (
                    <Alert className="bg-green-50 border-green-200 text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>{initMessage}</AlertDescription>
                    </Alert>
                  )}

                  {initStatus === "error" && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{initMessage}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
