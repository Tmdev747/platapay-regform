import { NextResponse } from "next/server"
import {
  sendApplicationSubmittedEmail,
  sendApplicationReminderEmail,
  sendApplicationStatusUpdateEmail,
  sendOnboardingWelcomeEmail,
} from "@/utils/application-emails"
import { ensureEmailTemplatesDirectory } from "@/utils/email-template-init"

// Ensure email templates directory exists
ensureEmailTemplatesDirectory()

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json()

    if (!type || !data) {
      return NextResponse.json({ message: "Email type and data are required" }, { status: 400 })
    }

    switch (type) {
      case "verification":
        // This is handled by the existing /api/send-verification endpoint
        return NextResponse.json({ message: "Use /api/send-verification endpoint instead" }, { status: 400 })

      case "application-submitted":
        await sendApplicationSubmittedEmail(data.email, data.fullName, data.applicationId)
        break

      case "application-reminder":
        await sendApplicationReminderEmail(
          data.email,
          data.fullName,
          data.progressPercentage,
          data.currentStep,
          data.expiryDate ? new Date(data.expiryDate) : undefined,
        )
        break

      case "application-status-update":
        await sendApplicationStatusUpdateEmail(
          data.email,
          data.fullName,
          data.applicationId,
          data.status,
          data.feedback,
          data.isApproved,
          data.isRejected,
          data.needsMoreInfo,
        )
        break

      case "onboarding-welcome":
        await sendOnboardingWelcomeEmail(
          data.email,
          data.fullName,
          data.agentId,
          data.username,
          data.temporaryPassword,
          {
            name: data.accountManagerName,
            email: data.accountManagerEmail,
            phone: data.accountManagerPhone,
          },
          {
            orientation: new Date(data.trainingDates.orientation),
            technicalTraining: new Date(data.trainingDates.technicalTraining),
            businessWorkshop: new Date(data.trainingDates.businessWorkshop),
          },
        )
        break

      default:
        return NextResponse.json({ message: "Invalid email type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `${type} email sent successfully`,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 },
    )
  }
}
