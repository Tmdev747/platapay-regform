import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function ConfirmationPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center">Registration Submitted</CardTitle>
          <CardDescription className="text-center">
            Your application to become a PlataPay agent has been submitted successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>
            Our team will review your application and conduct the necessary KYC verification. This process typically
            takes 1-3 business days.
          </p>
          <p>You will receive an email notification once your application has been approved.</p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
