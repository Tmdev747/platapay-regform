"use server"

import { sendTemplatedEmail } from "./email-service"

/**
 * Sends an application submitted confirmation email
 * @param email Recipient email
 * @param fullName Recipient full name
 * @param applicationId Application ID
 */
export async function sendApplicationSubmittedEmail(
  email: string,
  fullName: string,
  applicationId: string,
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const statusLink = `${baseUrl}/status?id=${applicationId}`

  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  await sendTemplatedEmail(email, "Application Submitted - PlataPay Agent Program", "application-submitted", {
    fullName,
    email,
    applicationId,
    submissionDate: formattedDate,
    statusLink,
    year: currentDate.getFullYear(),
  })
}

/**
 * Sends a reminder email for incomplete applications
 * @param email Recipient email
 * @param fullName Recipient full name
 * @param progressPercentage Application completion percentage
 * @param currentStep Current application step
 * @param expiryDate Optional expiry date
 */
export async function sendApplicationReminderEmail(
  email: string,
  fullName: string,
  progressPercentage: number,
  currentStep: string,
  expiryDate?: Date,
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const continueLink = `${baseUrl}/application`

  const currentDate = new Date()

  let formattedExpiryDate = ""
  if (expiryDate) {
    formattedExpiryDate = expiryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  await sendTemplatedEmail(email, "Complete Your PlataPay Agent Application", "application-reminder", {
    fullName,
    email,
    progressPercentage,
    currentStep,
    expiryDate: formattedExpiryDate,
    continueLink,
    year: currentDate.getFullYear(),
  })
}

/**
 * Sends an application status update email
 * @param email Recipient email
 * @param fullName Recipient full name
 * @param applicationId Application ID
 * @param status Application status
 * @param feedback Optional feedback
 * @param isApproved Whether the application is approved
 * @param isRejected Whether the application is rejected
 * @param needsMoreInfo Whether more information is needed
 */
export async function sendApplicationStatusUpdateEmail(
  email: string,
  fullName: string,
  applicationId: string,
  status: string,
  feedback?: string,
  isApproved = false,
  isRejected = false,
  needsMoreInfo = false,
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const statusLink = `${baseUrl}/status?id=${applicationId}`
  const updateLink = `${baseUrl}/application?id=${applicationId}`
  const onboardingLink = `${baseUrl}/onboarding?id=${applicationId}`

  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Determine status class for styling
  let statusClass = "review"
  if (isApproved) statusClass = "approved"
  if (isRejected) statusClass = "rejected"
  if (needsMoreInfo) statusClass = "pending"

  await sendTemplatedEmail(email, "Application Status Update - PlataPay Agent Program", "application-status-update", {
    fullName,
    email,
    applicationId,
    status,
    statusClass,
    feedback,
    isApproved,
    isRejected,
    needsMoreInfo,
    submissionDate: "January 15, 2023", // This would come from the database in a real app
    updateDate: formattedDate,
    statusLink,
    updateLink,
    onboardingLink,
    year: currentDate.getFullYear(),
  })
}

/**
 * Sends an onboarding welcome email
 * @param email Recipient email
 * @param fullName Recipient full name
 * @param agentId Agent ID
 * @param username Username
 * @param temporaryPassword Temporary password
 * @param accountManager Account manager details
 * @param trainingDates Training dates
 */
export async function sendOnboardingWelcomeEmail(
  email: string,
  fullName: string,
  agentId: string,
  username: string,
  temporaryPassword: string,
  accountManager: {
    name: string
    email: string
    phone: string
  },
  trainingDates: {
    orientation: Date
    technicalTraining: Date
    businessWorkshop: Date
  },
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const portalLink = `${baseUrl}/agent-portal/login`

  const currentDate = new Date()

  // Format training dates
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  await sendTemplatedEmail(email, "Welcome to PlataPay - Onboarding Information", "onboarding-welcome", {
    fullName,
    email,
    agentId,
    username,
    temporaryPassword,
    accountManagerName: accountManager.name,
    accountManagerEmail: accountManager.email,
    accountManagerPhone: accountManager.phone,
    orientationDate: formatDate(trainingDates.orientation),
    technicalTrainingDate: formatDate(trainingDates.technicalTraining),
    businessWorkshopDate: formatDate(trainingDates.businessWorkshop),
    portalLink,
    year: currentDate.getFullYear(),
  })
}
