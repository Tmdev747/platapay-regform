"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Printer, MapPin } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ConfirmationPage() {
  const [userName, setUserName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndGetProfile = async () => {
      try {
        setIsLoading(true)

        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          // Not authenticated, redirect to login
          router.push("/")
          return
        }

        // Get user metadata
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user?.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name)
        } else if (user?.user_metadata?.name) {
          setUserName(user.user_metadata.name)
        }

        // Check if registration is completed
        const registrationStatus = user?.user_metadata?.registration_status

        if (registrationStatus !== "completed") {
          // Registration not completed, redirect to registration
          router.push("/register")
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndGetProfile()
  }, [supabase, router])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-10">
      <Card className="border-green-200 print:border-none">
        <CardHeader className="text-center border-b pb-6 print:pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-50 p-3 text-green-600 print:h-12 print:w-12">
            <CheckCircle2 className="h-full w-full" />
          </div>
          <CardTitle className="text-2xl text-green-800 print:text-xl">Registration Successful!</CardTitle>
          <CardDescription className="text-green-700 print:text-sm">
            Thank you for registering as a PlataPay agent
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 print:pt-2">
          <div className="space-y-4 print:space-y-2">
            <div className="text-center">
              <h3 className="font-medium text-lg print:text-base">Hello, {userName || "Agent"}!</h3>
              <p className="text-muted-foreground print:text-sm">
                Your application has been submitted and is now pending review.
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 print:bg-amber-100 print:p-2">
              <h4 className="font-medium text-amber-800 print:text-sm">What happens next?</h4>
              <ol className="mt-2 space-y-2 text-amber-700 print:text-xs print:space-y-1">
                <li>Our team will review your application within 2-3 business days.</li>
                <li>
                  You will receive an email notification once your application is approved or if additional information
                  is needed.
                </li>
                <li>After approval, you'll receive your PlataPay agent credentials and onboarding materials.</li>
              </ol>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 pt-2 print:hidden">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Confirmation
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/find-agent">
              <MapPin className="mr-2 h-4 w-4" />
              Find Nearby Agents
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground print:hidden">
        <p>
          Have questions? Contact our support team at{" "}
          <a href="mailto:support@platapay.com" className="text-primary hover:underline">
            support@platapay.com
          </a>
        </p>
      </div>
    </div>
  )
}
