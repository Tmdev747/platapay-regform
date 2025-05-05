/**
 * Client-side email service for the admin interface
 * This file doesn't use Node.js modules directly
 */

/**
 * Sends an email using the API
 * @param type Email type
 * @param data Email data
 * @returns Promise with the API response
 */
export async function sendEmail(type: string, data: Record<string, any>): Promise<Response> {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type, data }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to send email")
  }

  return response
}

/**
 * Initializes email templates
 * @returns Promise with the API response
 */
export async function initializeTemplates(): Promise<Response> {
  const response = await fetch("/api/init-templates")

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to initialize templates")
  }

  return response
}

/**
 * Sends a test verification email
 * @param email Recipient email
 * @param fullName Recipient full name
 * @returns Promise with the API response
 */
export async function sendTestVerificationEmail(email: string, fullName: string): Promise<Response> {
  const response = await fetch("/api/send-verification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, fullName }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to send verification email")
  }

  return response
}
