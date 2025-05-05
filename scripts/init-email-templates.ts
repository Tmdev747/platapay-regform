import { ensureEmailTemplatesDirectory, ensureTemplateExists } from "../utils/email-template-init"

// Default template content
const defaultTemplates: Record<string, string> = {
  verification: `<!DOCTYPE html>
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
</html>`,

  "application-submitted": `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Submitted - PlataPay</title>
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
    .application-details {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .highlight {
      color: #58317A;
      font-weight: bold;
    }
    .status {
      display: inline-block;
      background-color: #58317A;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 14px;
    }
    .next-steps {
      border-left: 4px solid #58317A;
      padding-left: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://platapay.ph/logo-white.png" alt="PlataPay Logo">
    </div>
    <div class="content">
      <h1>Application Submitted Successfully</h1>
      <p>Hello {{fullName}},</p>
      <p>Thank you for submitting your application to become a PlataPay Agent. We have received your application and it is now being reviewed by our team.</p>
      
      <div class="application-details">
        <p><strong>Application Details:</strong></p>
        <p>Application ID: <span class="highlight">{{applicationId}}</span></p>
        <p>Email: <span class="highlight">{{email}}</span></p>
        <p>Submission Date: <span class="highlight">{{submissionDate}}</span></p>
        <p>Status: <span class="status">Under Review</span></p>
      </div>
      
      <div class="next-steps">
        <h3>What happens next?</h3>
        <ol>
          <li>Our team will review your application (typically within 5-7 business days)</li>
          <li>We may contact you for additional information if needed</li>
          <li>Once approved, you will receive an email with further instructions</li>
        </ol>
      </div>
      
      <p>You can check the status of your application at any time by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="{{statusLink}}" class="button">Check Application Status</a>
      </div>
      
      <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:support@platapay.ph">support@platapay.ph</a>.</p>
    </div>
    <div class="footer">
      <p>&copy; {{year}} PlataPay, a subsidiary of InnovateHub. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`,

  "application-reminder": `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Application - PlataPay</title>
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
    .progress-container {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .progress-bar {
      background-color: #e0e0e0;
      height: 20px;
      border-radius: 10px;
      margin: 10px 0;
      overflow: hidden;
    }
    .progress-fill {
      background-color: #58317A;
      height: 100%;
      width: {{progressPercentage}}%;
    }
    .highlight {
      color: #58317A;
      font-weight: bold;
    }
    .expiry-warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 10px 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://platapay.ph/logo-white.png" alt="PlataPay Logo">
    </div>
    <div class="content">
      <h1>Complete Your PlataPay Agent Application</h1>
      <p>Hello {{fullName}},</p>
      <p>We noticed that you started your PlataPay Agent application but haven't completed it yet. Your application is currently saved and waiting for you to finish.</p>
      
      <div class="progress-container">
        <p><strong>Application Progress:</strong></p>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <p>You've completed <span class="highlight">{{progressPercentage}}%</span> of your application.</p>
        <p>Current step: <span class="highlight">{{currentStep}}</span></p>
      </div>
      
      {{#if expiryDate}}
      <div class="expiry-warning">
        <p><strong>Important:</strong> Your incomplete application will expire on <span class="highlight">{{expiryDate}}</span>. Please complete it before this date to avoid starting over.</p>
      </div>
      {{/if}}
      
      <p>To continue where you left off, simply click the button below:</p>
      
      <div style="text-align: center;">
        <a href="{{continueLink}}" class="button">Continue Application</a>
      </div>
      
      <p>Becoming a PlataPay Agent offers numerous benefits:</p>
      <ul>
        <li>Additional income through transaction commissions</li>
        <li>Increased foot traffic for your existing business</li>
        <li>Low startup costs compared to other business opportunities</li>
        <li>Comprehensive training and support</li>
      </ul>
      
      <p>If you're experiencing any difficulties with your application or have questions, our support team is ready to assist you at <a href="mailto:support@platapay.ph">support@platapay.ph</a>.</p>
    </div>
    <div class="footer">
      <p>&copy; {{year}} PlataPay, a subsidiary of InnovateHub. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`,

  "application-status-update": `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Status Update - PlataPay</title>
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
    .application-details {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .highlight {
      color: #58317A;
      font-weight: bold;
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 14px;
      color: white;
    }
    .status-approved {
      background-color: #28a745;
    }
    .status-rejected {
      background-color: #dc3545;
    }
    .status-pending {
      background-color: #ffc107;
      color: #212529;
    }
    .status-review {
      background-color: #58317A;
    }
    .next-steps {
      border-left: 4px solid #58317A;
      padding-left: 15px;
      margin: 20px 0;
    }
    .feedback {
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://platapay.ph/logo-white.png" alt="PlataPay Logo">
    </div>
    <div class="content">
      <h1>Application Status Update</h1>
      <p>Hello {{fullName}},</p>
      
      <p>There has been an update to your PlataPay Agent application.</p>
      
      <div class="application-details">
        <p><strong>Application Details:</strong></p>
        <p>Application ID: <span class="highlight">{{applicationId}}</span></p>
        <p>Email: <span class="highlight">{{email}}</span></p>
        <p>Submission Date: <span class="highlight">{{submissionDate}}</span></p>
        <p>Status: <span class="status status-{{statusClass}}">{{status}}</span></p>
        <p>Last Updated: <span class="highlight">{{updateDate}}</span></p>
      </div>
      
      {{#if feedback}}
      <div class="feedback">
        <h3>Feedback from our team:</h3>
        <p>{{feedback}}</p>
      </div>
      {{/if}}
      
      <div class="next-steps">
        <h3>Next Steps:</h3>
        {{#if isApproved}}
        <ol>
          <li>Complete the onboarding process by clicking the button below</li>
          <li>Set up your PlataPay Agent account</li>
          <li>Attend the scheduled training session</li>
          <li>Start accepting transactions!</li>
        </ol>
        {{else if isRejected}}
        <p>Unfortunately, your application has not been approved at this time. You may reapply after 3 months with the suggested improvements.</p>
        {{else if needsMoreInfo}}
        <ol>
          <li>Review the feedback provided by our team</li>
          <li>Update your application with the requested information</li>
          <li>Resubmit your application for review</li>
        </ol>
        {{else}}
        <p>Your application is still being processed. We'll notify you of any updates.</p>
        {{/if}}
      </div>
      
      <div style="text-align: center;">
        {{#if isApproved}}
        <a href="{{onboardingLink}}" class="button">Begin Onboarding</a>
        {{else if needsMoreInfo}}
        <a href="{{updateLink}}" class="button">Update Application</a>
        {{else}}
        <a href="{{statusLink}}" class="button">View Application Status</a>
        {{/if}}
      </div>
      
      <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:support@platapay.ph">support@platapay.ph</a>.</p>
    </div>
    <div class="footer">
      <p>&copy; {{year}} PlataPay, a subsidiary of InnovateHub. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`,

  "onboarding-welcome": `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PlataPay - Onboarding Information</title>
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
    .account-details {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .highlight {
      color: #58317A;
      font-weight: bold;
    }
    .training-schedule {
      border: 1px solid #dddddd;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    .checklist {
      background-color: #f0f0f0;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .checklist ul {
      padding-left: 20px;
    }
    .checklist li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://platapay.ph/logo-white.png" alt="PlataPay Logo">
    </div>
    <div class="content">
      <h1>Welcome to the PlataPay Family!</h1>
      <p>Hello {{fullName}},</p>
      <p>Congratulations! Your application to become a PlataPay Agent has been approved. We're excited to welcome you to our growing network of financial service providers.</p>
      
      <div class="account-details">
        <p><strong>Your PlataPay Agent Account:</strong></p>
        <p>Agent ID: <span class="highlight">{{agentId}}</span></p>
        <p>Username: <span class="highlight">{{username}}</span></p>
        <p>Temporary Password: <span class="highlight">{{temporaryPassword}}</span></p>
        <p><strong>Important:</strong> You will be prompted to change your password on first login.</p>
      </div>
      
      <p>To get started with your PlataPay Agent journey, please follow these steps:</p>
      
      <div style="text-align: center;">
        <a href="{{portalLink}}" class="button">Access Agent Portal</a>
      </div>
      
      <div class="training-schedule">
        <h3>Your Training Schedule:</h3>
        <p><strong>Orientation Webinar:</strong> {{orientationDate}}</p>
        <p><strong>Technical Training:</strong> {{technicalTrainingDate}}</p>
        <p><strong>Business Development Workshop:</strong> {{businessWorkshopDate}}</p>
        <p>Calendar invitations have been sent to your email address.</p>
      </div>
      
      <div class="checklist">
        <h3>Onboarding Checklist:</h3>
        <ul>
          <li>Log in to the Agent Portal and complete your profile</li>
          <li>Set up your settlement account for receiving commissions</li>
          <li>Download the PlataPay Agent mobile app</li>
          <li>Review the Agent Handbook in your portal</li>
          <li>Attend all scheduled training sessions</li>
          <li>Set up your business location with PlataPay branding</li>
        </ul>
      </div>
      
      <p>Your dedicated account manager is <span class="highlight">{{accountManagerName}}</span>. You can reach them at <a href="mailto:{{accountManagerEmail}}">{{accountManagerEmail}}</a> or {{accountManagerPhone}} for any questions or assistance.</p>
      
      <p>We look forward to a successful partnership!</p>
      
      <p>Best regards,<br>
      The PlataPay Team</p>
    </div>
    <div class="footer">
      <p>&copy; {{year}} PlataPay, a subsidiary of InnovateHub. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`,
}

// Initialize templates
async function initializeTemplates() {
  console.log("Initializing email templates...")

  // Ensure the directory exists
  ensureEmailTemplatesDirectory()

  // Create each template if it doesn't exist
  for (const [templateName, content] of Object.entries(defaultTemplates)) {
    ensureTemplateExists(templateName, content)
  }

  console.log("Email templates initialized successfully!")
}

// Run the initialization
initializeTemplates().catch((error) => {
  console.error("Error initializing templates:", error)
  process.exit(1)
})
