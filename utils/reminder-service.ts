import { sendApplicationReminderEmail } from "./application-emails"

/**
 * Calculates the completion percentage of an application form
 * @param formData The application form data
 * @returns Percentage of completion (0-100)
 */
export function calculateFormCompletion(formData: any): number {
  // Define required fields for each step
  const requiredFields = {
    personal: [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "dateOfBirth",
      "nationality",
      "civilStatus",
      "gender",
      "idType",
      "idNumber",
    ],
    address: ["street", "brgy", "province", "region", "zipCode"],
    business: ["firstTimeBusiness", "existingBusiness"],
    location: ["proposedLocation", "latitude", "longitude"],
    packages: ["plan"],
    requirements: ["signature", "certification", "termsAndConditions", "termsAgree", "dataPrivacy", "infoAccuracy"],
    files: ["validIdFront", "validIdBack", "selfieWithId", "proofOfAddress"],
  }

  // Count completed fields
  let completedCount = 0
  let totalCount = 0

  // Check personal fields
  requiredFields.personal.forEach((field) => {
    totalCount++
    if (formData[field] && formData[field].toString().trim() !== "") {
      completedCount++
    }
  })

  // Check address fields
  requiredFields.address.forEach((field) => {
    totalCount++
    if (formData.address && formData.address[field] && formData.address[field].toString().trim() !== "") {
      completedCount++
    }
  })

  // Check business fields
  requiredFields.business.forEach((field) => {
    totalCount++
    if (formData[field] && formData[field].toString().trim() !== "") {
      completedCount++
    }
  })

  // Check location fields
  requiredFields.location.forEach((field) => {
    totalCount++
    if (formData[field] && formData[field].toString().trim() !== "") {
      completedCount++
    }
  })

  // Check packages fields
  requiredFields.packages.forEach((field) => {
    totalCount++
    if (formData[field] && formData[field].toString().trim() !== "") {
      completedCount++
    }
  })

  // Check requirements fields
  requiredFields.requirements.forEach((field) => {
    totalCount++
    if (formData[field] === true || (formData[field] && formData[field].toString().trim() !== "")) {
      completedCount++
    }
  })

  // Check file fields
  requiredFields.files.forEach((field) => {
    totalCount++
    if (formData.fileNames && formData.fileNames[field] && formData.fileNames[field].toString().trim() !== "") {
      completedCount++
    }
  })

  // Calculate percentage
  return Math.round((completedCount / totalCount) * 100)
}

/**
 * Determines the current step name based on form data
 * @param formData The application form data
 * @returns The name of the current step
 */
export function determineCurrentStep(formData: any): string {
  // Check if personal info is complete
  const personalComplete =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.phoneNumber &&
    formData.dateOfBirth &&
    formData.nationality &&
    formData.civilStatus

  if (!personalComplete) {
    return "Personal Information"
  }

  // Check if business experience is complete
  const businessComplete = formData.firstTimeBusiness && formData.existingBusiness

  if (!businessComplete) {
    return "Business Experience"
  }

  // Check if location is complete
  const locationComplete = formData.proposedLocation && formData.latitude && formData.longitude

  if (!locationComplete) {
    return "Business Location"
  }

  // Check if package selection is complete
  const packageComplete = formData.plan

  if (!packageComplete) {
    return "Business Packages"
  }

  // Check if requirements are complete
  const requirementsComplete =
    formData.signature &&
    formData.certification &&
    formData.termsAndConditions &&
    formData.fileNames &&
    formData.fileNames.validIdFront &&
    formData.fileNames.validIdBack &&
    formData.fileNames.selfieWithId &&
    formData.fileNames.proofOfAddress

  if (!requirementsComplete) {
    return "Requirements & Signature"
  }

  return "Ready for submission"
}

/**
 * Sends a reminder email for an incomplete application
 * @param email User's email
 * @param fullName User's full name
 * @param formData The application form data
 * @param lastSaved Date when the form was last saved
 */
export async function sendReminderIfNeeded(
  email: string,
  fullName: string,
  formData: any,
  lastSaved: Date,
): Promise<void> {
  // Only send reminders for applications that have been inactive for at least 24 hours
  const now = new Date()
  const hoursSinceLastSaved = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60)

  if (hoursSinceLastSaved < 24) {
    return
  }

  // Calculate completion percentage
  const progressPercentage = calculateFormCompletion(formData)

  // Only send reminders for applications that are at least 10% complete but not 100%
  if (progressPercentage < 10 || progressPercentage >= 100) {
    return
  }

  // Determine current step
  const currentStep = determineCurrentStep(formData)

  // Calculate expiry date (14 days from last saved)
  const expiryDate = new Date(lastSaved)
  expiryDate.setDate(expiryDate.getDate() + 14)

  // Send reminder email
  await sendApplicationReminderEmail(email, fullName, progressPercentage, currentStep, expiryDate)
}

export async function sendReminders(): Promise<string> {
  return "sendReminders() executed"
}
