"use client"

import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { PersonalInfo } from "./form-steps/personal-info"
import { BusinessExperience } from "./form-steps/business-experience"
import { BusinessLocation } from "./form-steps/business-location"
import { BusinessPackages } from "./form-steps/business-packages"
import { Requirements } from "./form-steps/requirements"
import { Assessment } from "./form-steps/assessment"
import { SystemActivation } from "./form-steps/system-activation"
import { FormNavigation } from "./form-navigation"
import { FormProgress } from "./form-progress"
import { PrivacyConsent } from "./privacy-consent"
import AIAssistant from "./ai-assistant/assistant"
import { Logo } from "./logo"

export default function ApplicationForm() {
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showAssistant, setShowAssistant] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const formMethods = useForm({
    mode: "onChange",
    defaultValues: {
      // Personal Information
      firstName: "",
      middleName: "",
      lastName: "",
      nationality: "",
      placeOfBirth: "",
      dateOfBirth: "",
      civilStatus: "",
      email: "",
      phoneNumber: "",
      gender: "",
      idType: "",
      idNumber: "",
      address: {
        number: "",
        street: "",
        brgy: "",
        city: "",
        municipality: "",
        province: "",
        region: "",
        country: "Philippines",
        zipCode: "",
      },
      tinNumber: "",
      firstTimeApplying: "yes",
      everCharged: "no",
      declaredBankruptcy: "no",
      details: "",
      incomeSource: "",
      employmentCompany: "",

      // Business Experience
      firstTimeBusiness: "yes",
      existingBusiness: "no",
      addPlataPay: "no",
      business: {
        name: "",
        yearsOperating: "",
        type: "",
        nature: "",
        position: "",
        address: "",
      },
      additionalBusiness: {
        name: "",
        yearsOperating: "",
        type: "",
      },

      // Business Location
      proposedLocation: "",
      locationAddress: {
        number: "",
        street: "",
        brgy: "",
        city: "",
        municipality: "",
        province: "",
        region: "",
        country: "Philippines",
        zipCode: "",
      },
      landmark: "",
      latitude: "",
      longitude: "",

      // PlataPay Business Packages
      plan: "",
      enterprisePackage: "",

      // Requirements & Signature
      certification: false,
      termsAndConditions: false,
      signature: "",
      documents: [],
      files: {
        validIdFront: null,
        validIdBack: null,
        selfieWithId: null,
        proofOfAddress: null,
        businessPermit: null,
      },
      fileNames: {
        validIdFront: "",
        validIdBack: "",
        selfieWithId: "",
        proofOfAddress: "",
        businessPermit: "",
      },
      termsAgree: false,
      dataPrivacy: false,
      infoAccuracy: false,

      // Assessment (Internal)
      assessorName: "",
      assessmentDate: "",
      assessmentResult: "",
      assessorSignature: "",
      remarks: "",
      accountName: "",

      // System Activation (Internal)
      accountNumber: "",
      accountType: "",
      activationDate: "",
      agent: "",
    },
  })

  const steps = [
    { id: "personal", title: "Personal Information", component: <PersonalInfo /> },
    { id: "business", title: "Business Experience", component: <BusinessExperience /> },
    { id: "location", title: "Business Location", component: <BusinessLocation /> },
    { id: "packages", title: "Business Packages", component: <BusinessPackages /> },
    { id: "requirements", title: "Requirements & Signature", component: <Requirements /> },
    { id: "assessment", title: "Assessment", component: <Assessment /> },
    { id: "activation", title: "System Activation", component: <SystemActivation /> },
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      console.log("Form submitted:", data)

      // Here you would typically send the data to your server
      // For now, we'll simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSubmitSuccess(true)
      alert("Form submitted successfully!")
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("There was an error submitting the form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConsentAccepted = () => {
    setConsentAccepted(true)
  }

  if (!consentAccepted) {
    return <PrivacyConsent onAccept={handleConsentAccepted} />
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#8A63AC] to-[#58317A] flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="flex justify-center mb-6">
            <Logo size="large" />
          </div>
          <h1 className="text-2xl font-bold text-[#58317A] mb-4">Application Submitted Successfully!</h1>
          <p className="mb-6">
            Thank you for applying to become a PlataPay business partner. We have received your application and will
            review it shortly. You will receive an email with further instructions.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#58317A] text-white rounded-md hover:bg-[#482968]"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="bg-[#58317A] text-white py-8 px-4 text-center">
        <div className="flex justify-center items-center mb-4">
          <Logo size="large" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Business Partnership</h1>
        <p className="text-xl">Start your business journey with PlataPay today</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg -mt-6">
        <FormProgress currentStep={currentStep} steps={steps} />

        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            {steps[currentStep].component}

            <FormNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              onNext={nextStep}
              onPrev={prevStep}
              onSubmit={formMethods.handleSubmit(onSubmit)}
            />
          </form>
        </FormProvider>
      </div>

      {/* AI Assistant */}
      <AIAssistant currentStep={currentStep} stepTitle={steps[currentStep].title} />
    </div>
  )
}
