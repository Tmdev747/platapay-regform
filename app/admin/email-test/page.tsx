"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { sendEmail, sendTestVerificationEmail } from "@/utils/client-email-service"

export default function EmailTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmitVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const fullName = formData.get("fullName") as string

    try {
      const response = await sendTestVerificationEmail(email, fullName)
      const data = await response.json()
      setResult({ success: true, message: data.message || "Verification email sent successfully" })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send verification email",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitApplicationSubmitted = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const fullName = formData.get("fullName") as string
    const applicationId = formData.get("applicationId") as string

    try {
      const response = await sendEmail("application-submitted", {
        email,
        fullName,
        applicationId,
      })
      const data = await response.json()
      setResult({ success: true, message: data.message || "Application submitted email sent successfully" })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send application submitted email",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReminder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const fullName = formData.get("fullName") as string
    const progressPercentage = Number.parseInt(formData.get("progressPercentage") as string, 10)
    const currentStep = formData.get("currentStep") as string
    const expiryDate = formData.get("expiryDate") as string

    try {
      const response = await sendEmail("application-reminder", {
        email,
        fullName,
        progressPercentage,
        currentStep,
        expiryDate: expiryDate || undefined,
      })
      const data = await response.json()
      setResult({ success: true, message: data.message || "Reminder email sent successfully" })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send reminder email",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitStatusUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const fullName = formData.get("fullName") as string
    const applicationId = formData.get("applicationId") as string
    const status = formData.get("status") as string
    const feedback = formData.get("feedback") as string
    const isApproved = formData.get("isApproved") === "true"
    const isRejected = formData.get("isRejected") === "true"
    const needsMoreInfo = formData.get("needsMoreInfo") === "true"

    try {
      const response = await sendEmail("application-status-update", {
        email,
        fullName,
        applicationId,
        status,
        feedback,
        isApproved,
        isRejected,
        needsMoreInfo,
      })
      const data = await response.json()
      setResult({ success: true, message: data.message || "Status update email sent successfully" })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send status update email",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitOnboarding = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const fullName = formData.get("fullName") as string
    const agentId = formData.get("agentId") as string
    const username = formData.get("username") as string
    const temporaryPassword = formData.get("temporaryPassword") as string
    const accountManagerName = formData.get("accountManagerName") as string
    const accountManagerEmail = formData.get("accountManagerEmail") as string
    const accountManagerPhone = formData.get("accountManagerPhone") as string
    const orientation = formData.get("orientation") as string
    const technicalTraining = formData.get("technicalTraining") as string
    const businessWorkshop = formData.get("businessWorkshop") as string

    try {
      const response = await sendEmail("onboarding-welcome", {
        email,
        fullName,
        agentId,
        username,
        temporaryPassword,
        accountManagerName,
        accountManagerEmail,
        accountManagerPhone,
        trainingDates: {
          orientation,
          technicalTraining,
          businessWorkshop,
        },
      })
      const data = await response.json()
      setResult({ success: true, message: data.message || "Onboarding welcome email sent successfully" })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send onboarding welcome email",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Email Testing</h1>
      <p className="mb-6 text-gray-600">
        Use this page to test sending different types of emails used in the application process.
      </p>

      {result && (
        <Alert className={`mb-6 ${result.success ? "bg-green-50" : "bg-red-50"}`}>
          {result.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="verification">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="reminder">Reminder</TabsTrigger>
          <TabsTrigger value="status">Status Update</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Send Verification Email</CardTitle>
              <CardDescription>Test sending a verification email to confirm the user's email address.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitVerification}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="user@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" required placeholder="John Doe" />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Verification Email"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="submitted">
          <Card>
            <CardHeader>
              <CardTitle>Send Application Submitted Email</CardTitle>
              <CardDescription>
                Test sending a confirmation email after an application has been submitted.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitApplicationSubmitted}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="user@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" required placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicationId">Application ID</Label>
                  <Input id="applicationId" name="applicationId" required placeholder="APP-12345" />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Application Submitted Email"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="reminder">
          <Card>
            <CardHeader>
              <CardTitle>Send Application Reminder Email</CardTitle>
              <CardDescription>Test sending a reminder email for incomplete applications.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitReminder}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="user@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" required placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="progressPercentage">Progress Percentage</Label>
                  <Input
                    id="progressPercentage"
                    name="progressPercentage"
                    type="number"
                    min="0"
                    max="100"
                    required
                    defaultValue="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentStep">Current Step</Label>
                  <Input id="currentStep" name="currentStep" required placeholder="Business Information" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input id="expiryDate" name="expiryDate" type="date" />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reminder Email"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Send Status Update Email</CardTitle>
              <CardDescription>
                Test sending an email to update the applicant on their application status.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitStatusUpdate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="user@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" required placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicationId">Application ID</Label>
                  <Input id="applicationId" name="applicationId" required placeholder="APP-12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input id="status" name="status" required placeholder="Approved" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback (Optional)</Label>
                  <Textarea id="feedback" name="feedback" placeholder="Additional feedback about the application..." />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isApproved">Approved</Label>
                    <select id="isApproved" name="isApproved" className="w-full p-2 border rounded">
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isRejected">Rejected</Label>
                    <select id="isRejected" name="isRejected" className="w-full p-2 border rounded">
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="needsMoreInfo">Needs More Info</Label>
                    <select id="needsMoreInfo" name="needsMoreInfo" className="w-full p-2 border rounded">
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Status Update Email"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding">
          <Card>
            <CardHeader>
              <CardTitle>Send Onboarding Welcome Email</CardTitle>
              <CardDescription>
                Test sending a welcome email with onboarding information for approved agents.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitOnboarding}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required placeholder="user@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" required placeholder="John Doe" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agentId">Agent ID</Label>
                    <Input id="agentId" name="agentId" required placeholder="AGT-12345" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" required placeholder="johndoe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temporaryPassword">Temporary Password</Label>
                    <Input id="temporaryPassword" name="temporaryPassword" required placeholder="Temp123!" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountManagerName">Account Manager Name</Label>
                    <Input id="accountManagerName" name="accountManagerName" required placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountManagerEmail">Account Manager Email</Label>
                    <Input
                      id="accountManagerEmail"
                      name="accountManagerEmail"
                      type="email"
                      required
                      placeholder="jane@platapay.ph"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountManagerPhone">Account Manager Phone</Label>
                    <Input
                      id="accountManagerPhone"
                      name="accountManagerPhone"
                      required
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orientation">Orientation Date</Label>
                    <Input id="orientation" name="orientation" type="datetime-local" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technicalTraining">Technical Training Date</Label>
                    <Input id="technicalTraining" name="technicalTraining" type="datetime-local" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessWorkshop">Business Workshop Date</Label>
                    <Input id="businessWorkshop" name="businessWorkshop" type="datetime-local" required />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Onboarding Welcome Email"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
