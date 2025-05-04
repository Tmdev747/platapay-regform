"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase"
import { InitialRegistrationModal } from "@/components/initial-registration-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          setIsAuthenticated(true)

          // Check if user has completed registration
          const { data: userData } = await supabase.auth.getUser()
          const registrationStatus = userData.user?.user_metadata?.registration_status

          if (registrationStatus === "completed") {
            // Registration already completed, redirect to dashboard
            router.push("/dashboard")
          } else {
            // Registration in progress, redirect to agent details page
            router.push("/register/agent-details")
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase.auth])

  // Handle successful initial registration
  const handleRegistrationSuccess = (email: string, fullName: string) => {
    console.log(`Registration started for ${fullName} (${email})`)
    // The modal will close automatically and the user will be directed to check their email
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

  if (isAuthenticated) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Redirecting to your registration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Become a PlataPay Agent</CardTitle>
            <CardDescription>
              Join our growing network of financial service agents across the Philippines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Benefits of becoming a PlataPay Agent:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Earn competitive commissions on every transaction</li>
                <li>Increase foot traffic to your existing business</li>
                <li>Provide valuable financial services to your community</li>
                <li>Access to our advanced agent portal and support system</li>
                <li>Marketing materials and business development support</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Registration Process:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Create your account with email verification</li>
                <li>Complete your business profile and location details</li>
                <li>Submit required documentation for KYC verification</li>
                <li>Receive approval and onboarding materials</li>
                <li>Start offering PlataPay services to your customers</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setIsModalOpen(true)} className="w-full">
              Start Registration
            </Button>
          </CardFooter>
        </Card>
      </div>

      <InitialRegistrationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  )
}
