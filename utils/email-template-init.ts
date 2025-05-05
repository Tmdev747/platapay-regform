"use server"

import fs from "fs"
import path from "path"

/**
 * Ensures that the email templates directory exists
 * Creates it if it doesn't exist
 */
export async function ensureEmailTemplatesDirectory(): Promise<void> {
  const templatesDir = path.join(process.cwd(), "email-templates")

  if (!fs.existsSync(templatesDir)) {
    console.log("Creating email templates directory...")
    fs.mkdirSync(templatesDir, { recursive: true })
  }
}

/**
 * Checks if a template exists, and creates it with default content if it doesn't
 */
export async function ensureTemplateExists(templateName: string, defaultContent: string): Promise<void> {
  const templatePath = path.join(process.cwd(), "email-templates", `${templateName}.hbs`)

  if (!fs.existsSync(templatePath)) {
    console.log(`Creating default template: ${templateName}.hbs`)
    fs.writeFileSync(templatePath, defaultContent, "utf-8")
  }
}
