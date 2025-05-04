"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Database, AlertCircle, Loader2, ArrowRight, Copy, ExternalLink } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: any
    manualSetup?: boolean
    sqlScript?: string
  } | null>(null)
  const [setupSteps, setSetupSteps] = useState<
    {
      step: string
      status: "pending" | "loading" | "complete" | "error"
      message?: string
    }[]
  >([
    { step: "Create SQL functions", status: "pending" },
    { step: "Create database tables", status: "pending" },
    { step: "Verify setup", status: "pending" },
  ])
  const [copied, setCopied] = useState(false)

  const setupDatabase = async () => {
    try {
      setIsLoading(true)
      setResult(null)
      setCopied(false)

      // Update steps
      setSetupSteps((prev) => prev.map((step, i) => (i === 0 ? { ...step, status: "loading" } : step)))

      const response = await fetch("/api/setup-database")
      const data = await response.json()

      // Process each step
      setTimeout(() => {
        setSetupSteps((prev) =>
          prev.map((step, i) => {
            if (i === 0) return { ...step, status: "complete" }
            if (i === 1) return { ...step, status: "loading" }
            return step
          }),
        )

        setTimeout(() => {
          setSetupSteps((prev) =>
            prev.map((step, i) => {
              if (i === 1) return { ...step, status: data.success ? "complete" : "error", message: data.error }
              if (i === 2) return { ...step, status: "loading" }
              return step
            }),
          )

          setTimeout(() => {
            setSetupSteps((prev) =>
              prev.map((step, i) => {
                if (i === 2) return { ...step, status: data.success ? "complete" : "error" }
                return step
              }),
            )
          }, 800)
        }, 1200)
      }, 800)

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: "Database schema setup complete!",
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to set up database schema",
          details: data.details,
          manualSetup: data.manualSetup,
          sqlScript: data.sqlScript,
        })
      }
    } catch (error) {
      console.error("Error setting up database:", error)
      setResult({
        success: false,
        message: "An unexpected error occurred",
        details: error,
      })

      setSetupSteps((prev) => prev.map((step) => (step.status === "loading" ? { ...step, status: "error" } : step)))
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 3000) // Wait for the step animations to complete
    }
  }

  const copyToClipboard = () => {
    if (result?.sqlScript) {
      navigator.clipboard.writeText(result.sqlScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup
            </CardTitle>
            <CardDescription>Initialize the database schema for the PlataPay Agent Portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>This will create the necessary tables in your Supabase database:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>agents - Stores agent registration information</li>
              <li>agent_drafts - Stores draft registration data</li>
              <li>user_profiles - Stores user profile information</li>
              <li>conversations - Stores conversation history</li>
              <li>messages - Stores individual messages</li>
              <li>commands - Stores voice command patterns</li>
            </ul>

            {isLoading && (
              <div className="space-y-4 mt-6">
                <h3 className="text-sm font-medium">Setup Progress</h3>
                <ul className="space-y-3">
                  {setupSteps.map((step, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {step.status === "pending" && <div className="h-4 w-4 rounded-full border border-gray-300" />}
                      {step.status === "loading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                      {step.status === "complete" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {step.status === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
                      <span className={step.status === "error" ? "text-destructive" : ""}>{step.step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result && !result.manualSetup && (
              <Alert variant={result.success ? "default" : "destructive"} className="mt-6">
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            {result && result.manualSetup && (
              <div className="mt-6 space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Automatic Setup Failed</AlertTitle>
                  <AlertDescription>
                    The automatic setup process couldn't complete. Please use the manual setup instructions below.
                  </AlertDescription>
                </Alert>

                <div className="bg-muted p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Manual Setup Instructions</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>
                      Go to your{" "}
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        Supabase Dashboard
                      </a>
                    </li>
                    <li>Select your project</li>
                    <li>Go to the SQL Editor</li>
                    <li>Create a new query</li>
                    <li>Copy and paste the SQL script below</li>
                    <li>Run the query</li>
                  </ol>
                </div>

                <Tabs defaultValue="script">
                  <TabsList>
                    <TabsTrigger value="script">SQL Script</TabsTrigger>
                    <TabsTrigger value="instructions">Additional Help</TabsTrigger>
                  </TabsList>
                  <TabsContent value="script">
                    <div className="relative">
                      <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-60 whitespace-pre-wrap">
                        {result.sqlScript}
                      </pre>
                      <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={copyToClipboard}>
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="instructions">
                    <div className="space-y-4 p-4 bg-muted rounded-md">
                      <p className="text-sm">If you're having trouble with the setup:</p>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li>Make sure you have admin privileges for your Supabase project</li>
                        <li>Check that your service role key is correctly set in your environment variables</li>
                        <li>
                          <a
                            href="https://supabase.com/docs/guides/database/extensions"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center"
                          >
                            Read the Supabase documentation on extensions
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://supabase.com/docs/guides/database/tables"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center"
                          >
                            Read the Supabase documentation on creating tables
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {result && !result.manualSetup && !result.success && result.details && (
              <Accordion type="single" collapsible className="mt-2">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-sm">Technical Details</AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={setupDatabase} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : result && result.success ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Setup Complete
                </>
              ) : (
                <>{result ? "Try Again" : "Set Up Database"}</>
              )}
            </Button>
          </CardFooter>

          {result && result.success && (
            <div className="px-6 pb-6">
              <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/")}>
                <span>Go to Home Page</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
