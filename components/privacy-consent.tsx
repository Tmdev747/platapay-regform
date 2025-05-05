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
              This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you use our
              services.
            </p>

            <p className="mb-3">
              <strong>Information We Collect:</strong> We collect personal information such as your name, contact
              details, identification documents, business information, and location data when you register as an agent.
              We may also collect information about your device and how you use our services.
            </p>

            <p className="mb-3">
              <strong>How We Use Your Information:</strong> We use your information to provide and improve our services,
              process transactions, communicate with you, comply with legal obligations, and protect against fraudulent
              activities.
            </p>

            <p className="mb-3">
              <strong>Data Sharing and Disclosure:</strong> We may share your information with service providers,
              financial institutions, regulatory authorities, and other third parties as necessary to provide our
              services or as required by law.
            </p>

            <p className="mb-3">
              <strong>Data Security:</strong> We implement appropriate technical and organizational measures to protect
              your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <p className="mb-3">
              <strong>Your Rights:</strong> You have the right to access, correct, update, or request deletion of your
              personal information. You may also object to processing or request restriction of processing in certain
              circumstances.
            </p>

            <p>
              <strong>Changes to This Policy:</strong> We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on our website.
            </p>
          </div>

          <h2 className="text-xl font-bold text-[#58317A] mb-4">Terms and Conditions</h2>
          <div className="bg-gray-50 p-4 rounded-md h-48 overflow-y-auto mb-6 text-sm">
            <p className="mb-3">
              By applying to become a PlataPay agent, you agree to the following terms and conditions:
            </p>

            <p className="mb-3">
              <strong>Eligibility:</strong> You must be at least 18 years old and have the legal capacity to enter into
              a binding agreement. You must provide accurate and complete information during the application process.
            </p>

            <p className="mb-3">
              <strong>Agent Responsibilities:</strong> As a PlataPay agent, you agree to comply with all applicable laws
              and regulations, maintain the confidentiality of customer information, provide accurate information about
              PlataPay services, and maintain sufficient funds to facilitate transactions.
            </p>

            <p className="mb-3">
              <strong>Commission and Fees:</strong> You will receive commissions for transactions processed through your
              agent account according to the commission structure provided by PlataPay. Commission rates may be subject
              to change with notice.
            </p>

            <p className="mb-3">
              <strong>Termination:</strong> PlataPay reserves the right to terminate your agent status at any time if
              you violate these terms and conditions, engage in fraudulent activities, or fail to comply with applicable
              laws and regulations.
            </p>

            <p className="mb-3">
              <strong>Limitation of Liability:</strong> PlataPay shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising out of or in connection with your use of our services.
            </p>

            <p>
              <strong>Governing Law:</strong> These terms and conditions shall be governed by and construed in
              accordance with the laws of the Philippines.
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
              I have read and agree to PlataPay's Privacy Policy and Terms & Conditions.
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
