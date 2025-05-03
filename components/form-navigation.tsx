"use client"

import { useFormContext } from "react-hook-form"

interface FormNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
}

export function FormNavigation({ currentStep, totalSteps, onNext, onPrev, onSubmit }: FormNavigationProps) {
  const {
    watch,
    formState: { errors },
    trigger,
  } = useFormContext()

  // Basic validation checks for each step
  const validateCurrentStep = async () => {
    // Trigger validation for the current step fields
    const isValid = await trigger()

    if (!isValid) {
      console.log("Form validation failed", errors)
      return false
    }

    const formData = watch()

    // Additional custom validation logic
    switch (currentStep) {
      case 0: // Personal Information
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.phoneNumber &&
          formData.dateOfBirth &&
          formData.nationality &&
          formData.civilStatus
        )
      case 1: // Business Experience
        return formData.firstTimeBusiness !== undefined && formData.existingBusiness !== undefined
      case 2: // Business Location
        return (
          formData.proposedLocation &&
          formData.locationAddress.region &&
          (formData.locationAddress.city || formData.locationAddress.municipality) &&
          formData.locationAddress.street &&
          formData.locationAddress.zipCode &&
          formData.latitude &&
          formData.longitude
        )
      case 3: // Business Packages
        return formData.plan
      case 4: // Requirements & Signature
        return (
          formData.signature &&
          formData.certification &&
          formData.termsAndConditions &&
          formData.files?.validIdFront &&
          formData.files?.validIdBack &&
          formData.files?.selfieWithId &&
          formData.files?.proofOfAddress
        )
      default:
        return true
    }
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid) {
      onNext()
    } else {
      // Show validation message
      alert("Please fill in all required fields before proceeding.")
    }
  }

  return (
    <div className="flex justify-between mt-8 pb-20 md:pb-8">
      {currentStep > 0 && (
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-2 border border-[#58317A] text-[#58317A] rounded-md hover:bg-gray-100"
        >
          Previous
        </button>
      )}

      <div className={`${currentStep > 0 ? "absolute left-1/2 transform -translate-x-1/2" : ""}`}>
        {currentStep < totalSteps - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 text-white rounded-md bg-[#58317A] hover:bg-[#482968]"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            onClick={async (e) => {
              e.preventDefault()
              const isValid = await validateCurrentStep()
              if (isValid) {
                onSubmit()
              } else {
                // Show validation message
                alert("Please fill in all required fields before submitting.")
              }
            }}
            className="px-6 py-2 text-white rounded-md bg-[#58317A] hover:bg-[#482968]"
          >
            Submit
          </button>
        )}
      </div>

      {/* Empty div to maintain flex spacing when Previous button is not shown */}
      {currentStep === 0 && <div></div>}
    </div>
  )
}
