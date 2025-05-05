"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false)
  
  const { signIn, resendConfirmationEmail, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsEmailNotConfirmed(false)

    if (!email || !password) {
      setErrorMessage("Please enter both email and password")
      return
    }

    const { error } = await signIn(email, password)

    if (error) {
      console.error("Sign in error:", error)
      
      // Check if the error is about email not being confirmed
      if (error.message.includes("Email not confirmed") || 
          error.message.includes("not confirmed") || 
          error.message.includes("verification")) {
        setIsEmailNotConfirmed(true)
        setErrorMessage("Your email has not been confirmed. Please check your inbox or request a new confirmation email.")
      } else {
        setErrorMessage(error.message || "Failed to sign in. Please check your credentials.")
      }
      return
    }

    // Redirect to dashboard on successful login
    router.push("/dashboard")
  }

  const handleResendConfirmation = async () => {
    setIsResendingEmail(true)
    try {
      const { error } = await resendConfirmationEmail(email)
      
      if (error) {
        throw error
      }
      
      toast({
        title: "Confirmation Email Sent",
        description: "Please check your inbox for the confirmation link.",
      })
    } catch (error) {
      console.error("Error resending confirmation email:", error)
      toast({
        variant: "destructive",
        title: "Failed to Resend Email",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsResendingEmail(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {isEmailNotConfirmed && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleResendConfirmation}
              disabled={isResendingEmail}
            >
              {isResendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Confirmation Email"
              )}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Apply as an agent
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
