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
        region: "",
        province: "",
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

  const onSubmit = (data: any) => {
    console.log("Form submitted:", data)
    // Here you would typically send the data to your server
    alert("Form submitted successfully!")
  }

  const handleConsentAccepted = () => {
    setConsentAccepted(true)
  }

  if (!consentAccepted) {
    return <PrivacyConsent onAccept={handleConsentAccepted} />
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
