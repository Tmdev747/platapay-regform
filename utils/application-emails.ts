import { sendTemplatedEmail } from "./email-service"

/**
 * Sends an application submitted confirmation email
 */
export async function sendApplicationSubmittedEmail(email: string, fullName: string, applicationId: string) {
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const statusLink = `${baseUrl}/application/status?id=${applicationId}`

  await sendTemplatedEmail(email, "Application Submitted Successfully - PlataPay", "application-submitted", {
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
 */
export async function sendApplicationReminderEmail(
  email: string,
  fullName: string,
  progressPercentage: number,
  currentStep: string,
  expiryDate?: Date,
) {
  const currentDate = new Date()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const continueLink = `${baseUrl}/application?email=${encodeURIComponent(email)}`

  let formattedExpiryDate: string | undefined
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
) {
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const statusLink = `${baseUrl}/application/status?id=${applicationId}`
  const updateLink = `${baseUrl}/application/update?id=${applicationId}`
  const onboardingLink = `${baseUrl}/onboarding?id=${applicationId}`

  // Determine status class for styling
  let statusClass = "review"
  if (isApproved) statusClass = "approved"
  if (isRejected) statusClass = "rejected"
  if (needsMoreInfo) statusClass = "pending"

  await sendTemplatedEmail(email, `PlataPay Application Status: ${status}`, "application-status-update", {
    fullName,
    email,
    applicationId,
    submissionDate: formattedDate,
    status,
    statusClass,
    updateDate: formattedDate,
    feedback,
    isApproved,
    isRejected,
    needsMoreInfo,
    statusLink,
    updateLink,
    onboardingLink,
    year: currentDate.getFullYear(),
  })
}

/**
 * Sends a welcome email after application approval with onboarding information
 */
export async function sendOnboardingWelcomeEmail(
  email: string,
  fullName: string,
  agentId: string,
  username: string,
  temporaryPassword: string,
  accountManagerInfo: {
    name: string
    email: string
    phone: string
  },
  trainingDates: {
    orientation: Date
    technicalTraining: Date
    businessWorkshop: Date
  },
) {
  const currentDate = new Date()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const portalLink = `${baseUrl}/agent-portal/login`

  // Format training dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  await sendTemplatedEmail(email, "Welcome to PlataPay - Your Onboarding Information", "onboarding-welcome", {
    fullName,
    agentId,
    username,
    temporaryPassword,
    accountManagerName: accountManagerInfo.name,
    accountManagerEmail: accountManagerInfo.email,
    accountManagerPhone: accountManagerInfo.phone,
    orientationDate: formatDate(trainingDates.orientation),
    technicalTrainingDate: formatDate(trainingDates.technicalTraining),
    businessWorkshopDate: formatDate(trainingDates.businessWorkshop),
    portalLink,
    year: currentDate.getFullYear(),
  })
}
