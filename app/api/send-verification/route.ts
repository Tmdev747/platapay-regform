import { NextResponse } from "next/server"
import { sendTemplatedEmail } from "@/utils/email-service"
import { generateVerificationToken } from "@/utils/token-utils"
import { ensureEmailTemplatesDirectory } from "@/utils/email-template-init"

// Ensure email templates directory exists
ensureEmailTemplatesDirectory()

export async function POST(request: Request) {
  try {
    const { fullName, email } = await request.json()

    if (!fullName || !email) {
      return NextResponse.json({ message: "Full name and email are required" }, { status: 400 })
    }

    // Generate a unique token for this user
    const token = generateVerificationToken(email)

    // In a real application, you would store this token in a database
    // along with the user's information and an expiration time

    // Create a verification link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verificationLink = `${baseUrl}/verify?token=${token}&email=${encodeURIComponent(email)}`

    // Get current date for the email template
    const currentDate = new Date()
    const formattedDate = currentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Send the verification email
    await sendTemplatedEmail(email, "Verify Your Email - PlataPay Agent Application", "verification", {
      fullName,
      email,
      verificationLink,
      date: formattedDate,
      year: currentDate.getFullYear(),
    })

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
    })
  } catch (error) {
    console.error("Error sending verification email:", error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to send verification email",
      },
      { status: 500 },
    )
  }
}
