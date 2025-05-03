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
  } = useFormContext()

  // Basic validation checks for each step
  const canProceed = () => {
    const formData = watch()

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
          formData.locationAddress.city &&
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

  return (
    <div className="flex justify-between mt-8">
      {currentStep > 0 && (
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-2 border border-[#58317A] text-[#58317A] rounded-md hover:bg-gray-100"
        >
          Previous
        </button>
      )}

      {currentStep < totalSteps - 1 ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed()}
          className={`ml-auto px-6 py-2 text-white rounded-md ${
            canProceed() ? "bg-[#58317A] hover:bg-[#482968]" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canProceed()}
          className={`ml-auto px-6 py-2 text-white rounded-md ${
            canProceed() ? "bg-[#58317A] hover:bg-[#482968]" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Submit
        </button>
      )}
    </div>
  )
}
