"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { generateApplicationId } from "@/utils/token-utils"

export default function EmailTestPage() {
  const [emailType, setEmailType] = useState("application-submitted")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [applicationId, setApplicationId] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isApproved, setIsApproved] = useState(false)
  const [isRejected, setIsRejected] = useState(false)
  const [needsMoreInfo, setNeedsMoreInfo] = useState(false)
  const [progressPercentage, setProgressPercentage] = useState(50)
  const [currentStep, setCurrentStep] = useState("Business Location")

  // For onboarding welcome email
  const [agentId, setAgentId] = useState("")
  const [username, setUsername] = useState("")
  const [temporaryPassword, setTemporaryPassword] = useState("")
  const [accountManagerName, setAccountManagerName] = useState("")
  const [accountManagerEmail, setAccountManagerEmail] = useState("")
  const [accountManagerPhone, setAccountManagerPhone] = useState("")
  const [orientationDate, setOrientationDate] = useState("")
  const [technicalTrainingDate, setTechnicalTrainingDate] = useState("")
  const [businessWorkshopDate, setBusinessWorkshopDate] = useState("")

  const handleGenerateApplicationId = () => {
    if (recipientEmail) {
      setApplicationId(generateApplicationId(recipientEmail))
    } else {
      alert("Please enter a recipient email first")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      if (!recipientEmail || !fullName) {
        throw new Error("Recipient email and full name are required")
      }

      const requestData: any = {
        type: emailType,
        data: {
          email: recipientEmail,
          fullName,
        },
      }

      // Add specific fields based on email type
      switch (emailType) {
        case "application-submitted":
          requestData.data.applicationId = applicationId || generateApplicationId(recipientEmail)
          break

        case "application-status-update":
          requestData.data.applicationId = applicationId || generateApplicationId(recipientEmail)
          requestData.data.status = isApproved
            ? "Approved"
            : isRejected
              ? "Rejected"
              : needsMoreInfo
                ? "Needs More Information"
                : "Under Review"
          requestData.data.feedback = feedback
          requestData.data.isApproved = isApproved
          requestData.data.isRejected = isRejected
          requestData.data.needsMoreInfo = needsMoreInfo
          break

        case "application-reminder":
          requestData.data.progressPercentage = progressPercentage
          requestData.data.currentStep = currentStep
          requestData.data.expiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
          break

        case "onboarding-welcome":
          requestData.data.agentId = agentId || `PPA-${Math.floor(10000 + Math.random() * 90000)}`
          requestData.data.username = username || recipientEmail.split("@")[0]
          requestData.data.temporaryPassword = temporaryPassword || `Pass${Math.floor(100000 + Math.random() * 900000)}`
          requestData.data.accountManagerName = accountManagerName || "Juan Dela Cruz"
          requestData.data.accountManagerEmail = accountManagerEmail || "support@platapay.ph"
          requestData.data.accountManagerPhone = accountManagerPhone || "+63 912 345 6789"
          requestData.data.trainingDates = {
            orientation: orientationDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            technicalTraining: technicalTrainingDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            businessWorkshop: businessWorkshopDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }
          break
      }

      console.log("Sending email request:", requestData)

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to send email")
      }

      setStatus("success")
      console.log("Email sent successfully:", responseData)
    } catch (error) {
      console.error("Error sending test email:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Email Template Test Tool</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
          <CardDescription>Use this form to test the various email templates</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="emailType">Email Type</Label>
              <Select value={emailType} onValueChange={setEmailType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select email type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application-submitted">Application Submitted</SelectItem>
                  <SelectItem value="application-reminder">Application Reminder</SelectItem>
                  <SelectItem value="application-status-update">Application Status Update</SelectItem>
                  <SelectItem value="onboarding-welcome">Onboarding Welcome</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            {emailType === "application-submitted" && (
              <div className="space-y-2">
                <Label htmlFor="applicationId">Application ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="applicationId"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    placeholder="Will be auto-generated if empty"
                  />
                  <Button type="button" variant="outline" onClick={handleGenerateApplicationId}>
                    Generate
                  </Button>
                </div>
              </div>
            )}

            {emailType === "application-status-update" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="applicationId">Application ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="applicationId"
                      value={applicationId}
                      onChange={(e) => setApplicationId(e.target.value)}
                      placeholder="Will be auto-generated if empty"
                    />
                    <Button type="button" variant="outline" onClick={handleGenerateApplicationId}>
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Application Status</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isApproved"
                        checked={isApproved}
                        onChange={(e) => {
                          setIsApproved(e.target.checked)
                          if (e.target.checked) {
                            setIsRejected(false)
                            setNeedsMoreInfo(false)
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="isApproved">Approved</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isRejected"
                        checked={isRejected}
                        onChange={(e) => {
                          setIsRejected(e.target.checked)
                          if (e.target.checked) {
                            setIsApproved(false)
                            setNeedsMoreInfo(false)
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="isRejected">Rejected</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="needsMoreInfo"
                        checked={needsMoreInfo}
                        onChange={(e) => {
                          setNeedsMoreInfo(e.target.checked)
                          if (e.target.checked) {
                            setIsApproved(false)
                            setIsRejected(false)
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="needsMoreInfo">Needs More Info</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback (Optional)</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter feedback or comments for the applicant"
                  />
                </div>
              </>
            )}

            {emailType === "application-reminder" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="progressPercentage">Progress Percentage</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="progressPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={progressPercentage}
                      onChange={(e) => setProgressPercentage(Number.parseInt(e.target.value))}
                    />
                    <span>{progressPercentage}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentStep">Current Step</Label>
                  <Select value={currentStep} onValueChange={setCurrentStep}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select current step" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal Information">Personal Information</SelectItem>
                      <SelectItem value="Business Experience">Business Experience</SelectItem>
                      <SelectItem value="Business Location">Business Location</SelectItem>
                      <SelectItem value="Business Packages">Business Packages</SelectItem>
                      <SelectItem value="Requirements & Signature">Requirements & Signature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {emailType === "onboarding-welcome" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="agentId">Agent ID</Label>
                  <Input
                    id="agentId"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    placeholder="Will be auto-generated if empty"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Will use email username if empty"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temporaryPassword">Temporary Password</Label>
                  <Input
                    id="temporaryPassword"
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    placeholder="Will be auto-generated if empty"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountManagerName">Account Manager Name</Label>
                    <Input
                      id="accountManagerName"
                      value={accountManagerName}
                      onChange={(e) => setAccountManagerName(e.target.value)}
                      placeholder="Default: Juan Dela Cruz"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountManagerEmail">Account Manager Email</Label>
                    <Input
                      id="accountManagerEmail"
                      value={accountManagerEmail}
                      onChange={(e) => setAccountManagerEmail(e.target.value)}
                      placeholder="Default: support@platapay.ph"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountManagerPhone">Account Manager Phone</Label>
                  <Input
                    id="accountManagerPhone"
                    value={accountManagerPhone}
                    onChange={(e) => setAccountManagerPhone(e.target.value)}
                    placeholder="Default: +63 912 345 6789"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orientationDate">Orientation Date</Label>
                    <Input
                      id="orientationDate"
                      type="datetime-local"
                      value={orientationDate}
                      onChange={(e) => setOrientationDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="technicalTrainingDate">Technical Training Date</Label>
                    <Input
                      id="technicalTrainingDate"
                      type="datetime-local"
                      value={technicalTrainingDate}
                      onChange={(e) => setTechnicalTrainingDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessWorkshopDate">Business Workshop Date</Label>
                    <Input
                      id="businessWorkshopDate"
                      type="datetime-local"
                      value={businessWorkshopDate}
                      onChange={(e) => setBusinessWorkshopDate(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {status === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{errorMessage || "Failed to send email. Please try again."}</span>
              </div>
            )}

            {status === "success" && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Email sent successfully!</span>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            className="w-full bg-[#58317A] hover:bg-[#482968]"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              "Send Test Email"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
