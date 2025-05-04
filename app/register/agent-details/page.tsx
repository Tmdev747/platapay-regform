"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase"
import { AgentRegistrationForm } from "@/components/agent-registration-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AgentDetailsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error

        if (!data.session) {
          // Not authenticated, redirect to registration
          router.push("/register")
          return
        }

        // Get user data
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) throw userError

        setUser(userData.user)
      } catch (err) {
        console.error("Error checking auth:", err)
        setError("Failed to authenticate. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase.auth])

  // Handle successful registration
  const handleRegistrationSuccess = () => {
    toast({
      title: "Registration Submitted",
      description: "Your application has been submitted for review. We'll notify you once it's approved.",
    })

    // Redirect to dashboard or confirmation page
    router.push("/register/confirmation")
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.push("/register")}>Back to Registration</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Complete Your Agent Registration</CardTitle>
            <CardDescription>
              Please provide your business details to complete your PlataPay agent registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Registration in Progress</AlertTitle>
              <AlertDescription>
                You can save your progress at any time and return later to complete your registration.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <AgentRegistrationForm
          userId={user?.id}
          email={user?.email}
          fullName={user?.user_metadata?.full_name}
          onSuccess={handleRegistrationSuccess}
        />
      </div>
    </div>
  )
}
