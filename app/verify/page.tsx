"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Logo } from "@/components/logo"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setVerificationStatus("error")
        setErrorMessage("Invalid verification link. Missing token or email.")
        return
      }

      try {
        // In a real application, you would verify the token against your database
        // For this example, we'll simulate a successful verification
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Store the email in localStorage to pre-fill the form
        localStorage.setItem("platapayUserEmail", email)

        setVerificationStatus("success")
      } catch (error) {
        console.error("Error verifying token:", error)
        setVerificationStatus("error")
        setErrorMessage("Failed to verify your email. The link may have expired.")
      }
    }

    verifyToken()
  }, [token, email])

  const handleContinue = () => {
    router.push("/application")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8A63AC] to-[#58317A] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo size="large" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === "loading" && "Verifying your email address..."}
            {verificationStatus === "success" && "Your email has been verified successfully!"}
            {verificationStatus === "error" && "Verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {verificationStatus === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-16 w-16 text-[#58317A] animate-spin" />
              <p className="text-center text-gray-600">Please wait while we verify your email address...</p>
            </div>
          )}

          {verificationStatus === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-center text-gray-600">
                Your email has been verified. You can now continue with your PlataPay Agent application.
              </p>
              <Button onClick={handleContinue} className="w-full bg-[#58317A] hover:bg-[#482968]">
                Continue to Application
              </Button>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-center text-red-600">{errorMessage}</p>
              <Button onClick={() => router.push("/")} className="w-full bg-[#58317A] hover:bg-[#482968]">
                Return to Start
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
