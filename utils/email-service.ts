"use server"

import nodemailer from "nodemailer"
import Handlebars from "handlebars"
import fs from "fs"
import path from "path"

// Define the HandlebarsTemplateDelegate type
type HandlebarsTemplateDelegate = (data: any) => string

// Email configuration
const emailConfig = {
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "admin@innovatehub.ph",
    pass: process.env.EMAIL_PASSWORD, // Will be stored in environment variables
  },
}

// Create transporter
const transporter = nodemailer.createTransport(emailConfig)

// CC recipients for all emails
const ccRecipients = ["ceo@innovatehub.ph", "finance@platapay.ph", "marketing@platapay.ph", "sales@platapay.ph"]

// Email sender details
const sender = {
  name: "PlataPay Notification Center",
  email: "noreply@platapay.ph",
}

// Template cache to avoid reading from disk on every email
const templateCache: Record<string, HandlebarsTemplateDelegate> = {}

/**
 * Loads and compiles an email template
 * @param templateName Name of the template file (without extension)
 * @returns Compiled Handlebars template
 */
function getTemplate(templateName: string): HandlebarsTemplateDelegate {
  if (templateCache[templateName]) {
    return templateCache[templateName]
  }

  try {
    const templatePath = path.join(process.cwd(), "email-templates", `${templateName}.hbs`)

    // Check if the template file exists
    if (!fs.existsSync(templatePath)) {
      console.error(`Template file not found: ${templatePath}`)
      throw new Error(`Email template '${templateName}' not found`)
    }

    const templateSource = fs.readFileSync(templatePath, "utf-8")
    const template = Handlebars.compile(templateSource)

    // Cache the template
    templateCache[templateName] = template

    return template
  } catch (error) {
    console.error(`Error loading template '${templateName}':`, error)
    throw new Error(`Failed to load email template: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Sends an email using a template
 * @param to Recipient email address
 * @param subject Email subject
 * @param templateName Name of the template to use
 * @param data Data to pass to the template
 * @param additionalCc Additional CC recipients (optional)
 * @returns Promise that resolves when email is sent
 */
export async function sendTemplatedEmail(
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>,
  additionalCc: string[] = [],
): Promise<void> {
  try {
    // Get and compile the template
    const template = getTemplate(templateName)
    const htmlContent = template(data)

    // Combine default CC recipients with any additional ones
    const cc = [...ccRecipients, ...additionalCc]

    // Send the email
    await transporter.sendMail({
      from: {
        name: sender.name,
        address: sender.email,
      },
      to,
      cc,
      subject,
      html: htmlContent,
      // Add text version as fallback
      text: htmlToText(htmlContent),
    })

    console.log(`Email sent to ${to} using template ${templateName}`)
  } catch (error) {
    console.error("Error sending email:", error)
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Very simple HTML to text converter for fallback content
 * @param html HTML content
 * @returns Plain text version
 */
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gs, "")
    .replace(/<script[^>]*>.*?<\/script>/gs, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
}

/**
 * Verify email configuration by sending a test email
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify()
    return true
  } catch (error) {
    console.error("Email configuration error:", error)
    return false
  }
}
