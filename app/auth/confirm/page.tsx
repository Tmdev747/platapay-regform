"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { z } from "zod"

export default function ConfirmPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSettingPassword, setIsSettingPassword] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"success" | "error" | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  // Get token hash and type from URL
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")

  // Password validation schema
  const passwordSchema = z.object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
  })

  // Verify the token
  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!tokenHash || !type) {
          setVerificationStatus("error")
          return
        }

        // Verify the token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as any,
        })

        if (error) {
          throw error
        }

        setVerificationStatus("success")
      } catch (error) {
        console.error("Error verifying token:", error)
        setVerificationStatus("error")
      } finally {
        setIsVerifying(false)
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [tokenHash, type, supabase.auth])

  // Handle password setup
  const handlePasswordSetup = async () => {
    try {
      setPasswordError(null)
      setIsSettingPassword(true)

      // Validate passwords
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match")
        setIsSettingPassword(false)
        return
      }

      // Validate password strength
      try {
        passwordSchema.parse({ password })
      } catch (error) {
        if (error instanceof z.ZodError) {
          setPasswordError(error.errors[0].message)
          setIsSettingPassword(false)
          return
        }
      }

      // Update the user's password
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      toast({
        title: "Password Set Successfully",
        description: "You can now sign in with your email and password.",
      })

      // Use window.location for a full page navigation instead of router.push
      // This helps avoid issues with multiple windows
      window.location.href = "/auth/success"
    } catch (error) {
      console.error("Error setting password:", error)
      toast({
        title: "Error Setting Password",
        description: error instanceof Error ? error.message : "Failed to set password. Please try again.",
        variant: "destructive",
      })
      setIsSettingPassword(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account Confirmation</CardTitle>
          <CardDescription>Verify your email and set up your password</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : verificationStatus === "error" ? (
            <div className="text-center py-8 space-y-4">
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
              <h3 className="text-xl font-semibold">Verification Failed</h3>
              <p className="text-muted-foreground">
                The verification link is invalid or has expired. Please request a new verification link.
              </p>
              <Button
                onClick={() => {
                  // Use window.location for a full page navigation
                  window.location.href = "/register"
                }}
                className="mt-4"
              >
                Back to Registration
              </Button>
            </div>
          ) : verificationStatus === "success" ? (
            <div className="space-y-6">
              <div className="text-center py-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-semibold mt-4">Email Verified Successfully</h3>
                <p className="text-muted-foreground mt-2">Please set up your password to continue.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                </div>
                {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                <div className="text-sm text-muted-foreground">
                  <p>Password must:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Be at least 8 characters long</li>
                    <li>Include at least one uppercase letter</li>
                    <li>Include at least one lowercase letter</li>
                    <li>Include at least one number</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
        {verificationStatus === "success" && (
          <CardFooter>
            <Button
              onClick={handlePasswordSetup}
              disabled={isSettingPassword || !password || !confirmPassword}
              className="w-full"
            >
              {isSettingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Password...
                </>
              ) : (
                "Set Password & Continue"
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
