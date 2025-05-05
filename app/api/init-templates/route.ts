import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { ensureEmailTemplatesDirectory, ensureTemplateExists } from "@/utils/email-template-init"

// Default template content for verification template
const verificationTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - PlataPay</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #58317A;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .header img {
      max-height: 60px;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border-left: 1px solid #dddddd;
      border-right: 1px solid #dddddd;
    }
    .footer {
      background-color: #f7f7f7;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
      border-radius: 0 0 5px 5px;
      border: 1px solid #dddddd;
      border-top: none;
    }
    .button {
      display: inline-block;
      background-color: #58317A;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #482968;
    }
    h1 {
      color: #58317A;
      margin-top: 0;
    }
    .verification-code {
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 2px;
      color: #58317A;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
      display: inline-block;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://platapay.ph/logo-white.png" alt="PlataPay Logo">
    </div>
    <div class="content">
      <h1>Verify Your Email Address</h1>
      <p>Hello {{fullName}},</p>
      <p>Thank you for your interest in becoming a PlataPay Agent. To continue with your application, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="{{verificationLink}}" class="button">Verify Email Address</a>
      </div>
      
      <p>Alternatively, you can enter the following verification code on the verification page:</p>
      
      <div style="text-align: center;">
        <div class="verification-code">{{verificationCode}}</div>
      </div>
      
      <p>This code will expire in 24 hours.</p>
      
      <p>If you did not request this verification, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; {{year}} PlataPay, a subsidiary of InnovateHub. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`

export async function GET(request: Request) {
  try {
    // Ensure the directory exists
    ensureEmailTemplatesDirectory()

    // Create the verification template if it doesn't exist
    ensureTemplateExists("verification", verificationTemplate)

    // Check if all templates exist
    const templatesDir = path.join(process.cwd(), "email-templates")
    const templates = [
      "verification",
      "application-submitted",
      "application-reminder",
      "application-status-update",
      "onboarding-welcome",
    ]

    const missingTemplates = templates.filter((template) => {
      const templatePath = path.join(templatesDir, `${template}.hbs`)
      return !fs.existsSync(templatePath)
    })

    return NextResponse.json({
      success: true,
      message: "Email templates initialized successfully",
      missingTemplates: missingTemplates.length > 0 ? missingTemplates : "None",
    })
  } catch (error) {
    console.error("Error initializing templates:", error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to initialize templates",
      },
      { status: 500 },
    )
  }
}
