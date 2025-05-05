"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  // Redirect to login after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Use window.location for a full page navigation
      window.location.href = "/"
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Registration Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Your password has been set successfully. You will be redirected to the login page in a few seconds.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              // Use window.location for a full page navigation
              window.location.href = "/"
            }}
            className="w-full"
          >
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
