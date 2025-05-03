"use client"

import { useState } from "react"
import { Logo } from "./logo"

interface PrivacyConsentProps {
  onAccept: () => void
}

export function PrivacyConsent({ onAccept }: PrivacyConsentProps) {
  const [consent, setConsent] = useState(false)
  const [language, setLanguage] = useState("en")

  const handleProceed = () => {
    if (consent) {
      onAccept()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#58317A] text-white p-6 rounded-t-lg shadow-md flex justify-center items-center">
        <Logo size="large" />
      </div>

      <div className="bg-white rounded-b-lg shadow-md p-6">
        <div className="mb-4">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#58317A] focus:border-[#58317A]"
          >
            <option value="en">English</option>
            <option value="fil">Filipino</option>
          </select>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#58317A] mb-4">Privacy Policy and Data Protection</h2>
          <div className="bg-gray-50 p-4 rounded-md h-48 overflow-y-auto mb-4 text-sm">
            <p className="mb-3">
              PlataPay is committed to protecting your privacy and ensuring the security of your personal information.
              This is a summary of our Privacy Policy which outlines how we collect, use, disclose, and safeguard your
              data.
            </p>

            <p className="mb-3">
              <strong>Information We Collect:</strong> Personal information such as name, contact details, ID documents,
              business information, and location data when you register as an agent.
            </p>

            <p className="mb-3">
              <strong>How We Use Your Information:</strong> To provide services, process transactions, communicate with
              you, comply with legal obligations, and protect against fraud.
            </p>

            <p className="mb-3">
              For the complete Privacy Policy, please visit{" "}
              <a
                href="https://platapay.ph/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#58317A] underline hover:text-[#3D2268]"
              >
                platapay.ph/privacy
              </a>
            </p>
          </div>

          <h2 className="text-xl font-bold text-[#58317A] mb-4">Terms and Conditions</h2>
          <div className="bg-gray-50 p-4 rounded-md h-48 overflow-y-auto mb-6 text-sm">
            <p className="mb-3">
              By applying to become a PlataPay agent, you agree to the following terms and conditions:
            </p>

            <p className="mb-3">
              <strong>Eligibility:</strong> You must be at least 18 years old and provide accurate information.
            </p>

            <p className="mb-3">
              <strong>Agent Responsibilities:</strong> Comply with laws, maintain customer confidentiality, provide
              accurate information about services, and maintain sufficient funds.
            </p>

            <p className="mb-3">
              <strong>Commission and Fees:</strong> You will receive commissions according to the structure provided by
              PlataPay.
            </p>

            <p className="mb-3">
              For the complete Terms and Conditions, please visit{" "}
              <a
                href="https://platapay.ph/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#58317A] underline hover:text-[#3D2268]"
              >
                platapay.ph/terms
              </a>
            </p>
          </div>

          <div className="flex items-start mb-6">
            <div className="flex items-center h-5">
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="focus:ring-[#58317A] h-4 w-4 text-[#58317A] border-gray-300 rounded"
              />
            </div>
            <label htmlFor="consent" className="ml-2 block text-sm text-gray-700">
              I have read and agree to PlataPay's{" "}
              <a
                href="https://platapay.ph/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#58317A] hover:text-[#3D2268]"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://platapay.ph/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#58317A] hover:text-[#3D2268]"
              >
                Terms & Conditions
              </a>
              .
            </label>
          </div>

          <button
            onClick={handleProceed}
            disabled={!consent}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#58317A] ${
              consent ? "bg-[#58317A] hover:bg-[#482968]" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Continue to Registration
          </button>
        </div>
      </div>
    </div>
  )
}
