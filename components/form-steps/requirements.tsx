"use client"

import type React from "react"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Upload } from "lucide-react"

export function Requirements() {
  const { register, setValue, watch } = useFormContext()
  const [signature, setSignature] = useState("")
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  const hasCurrentBusiness = watch("hasCurrentBusiness") === "yes"
  const fileNames = watch("fileNames")

  const handleDocumentChange = (document: string) => {
    setSelectedDocuments((prev) => {
      if (prev.includes(document)) {
        return prev.filter((item) => item !== document)
      } else {
        return [...prev, document]
      }
    })

    setValue("documents", selectedDocuments)
  }

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignature(e.target.value)
    setValue("signature", e.target.value)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setValue(`files.${fieldName}`, file)
      setValue(`fileNames.${fieldName}`, file.name)
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-[#4A2A82]">📄 Requirements & Signature</h2>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Certification Statement</h3>
            <p className="text-sm text-gray-600">
              I hereby certify that all information provided in this application is true and correct to the best of my
              knowledge. I understand that any false statement may result in the rejection of my application or
              termination of partnership.
            </p>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="certification"
                onCheckedChange={(checked) => {
                  setValue("certification", checked === true)
                }}
              />
              <Label htmlFor="certification" className="text-sm">
                I acknowledge that all information provided is accurate and complete
              </Label>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Terms and Conditions</h3>
            <p className="text-sm text-gray-600">
              By checking this box, I agree to abide by the terms and conditions of the PlataPay Business Partnership
              Program. I have read and understood all the requirements and responsibilities as a PlataPay Business
              Partner.
            </p>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                onCheckedChange={(checked) => {
                  setValue("termsAndConditions", checked === true)
                }}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the Terms and Conditions
              </Label>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Signature</h3>
            <div className="space-y-2">
              <Label htmlFor="signature">
                Signature Over Printed Name and Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="signature"
                value={signature}
                onChange={handleSignatureChange}
                placeholder="Type your full name as signature"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Required Documents</h3>
        <p className="text-sm text-gray-600">Select all applicable documents:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="id" onCheckedChange={() => handleDocumentChange("government_id")} />
            <Label htmlFor="id">Government Issued ID</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="dti" onCheckedChange={() => handleDocumentChange("dti")} />
            <Label htmlFor="dti">DTI Registration</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="application" onCheckedChange={() => handleDocumentChange("application_form")} />
            <Label htmlFor="application">Signed and Accomplished Application Form</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="permit" onCheckedChange={() => handleDocumentChange("business_permit")} />
            <Label htmlFor="permit">Mayor's/Business Permit</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms-doc" onCheckedChange={() => handleDocumentChange("terms")} />
            <Label htmlFor="terms-doc">Signed Terms and Conditions</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="bir" onCheckedChange={() => handleDocumentChange("bir")} />
            <Label htmlFor="bir">BIR Registration</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="settlement" onCheckedChange={() => handleDocumentChange("settlement")} />
            <Label htmlFor="settlement">Proof of Settlement</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="other" onCheckedChange={() => handleDocumentChange("other")} />
            <Label htmlFor="other">Other</Label>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold">File Upload</h3>
        <p className="text-sm text-gray-600 mb-4">Upload the following required documents:</p>

        <div>
          <Label htmlFor="validIdFront" className="block text-sm font-medium text-gray-700 mb-1">
            Valid ID (Front) <span className="text-red-500">*</span>
          </Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="validIdFront"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-[#4A2A82] hover:text-[#3D2268] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#4A2A82]"
                >
                  <span>Upload a file</span>
                  <input
                    id="validIdFront"
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleFileUpload(e, "validIdFront")}
                    accept="image/png,image/jpeg,application/pdf"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
            </div>
          </div>
          {fileNames.validIdFront && (
            <p className="mt-2 text-sm text-green-600">File selected: {fileNames.validIdFront}</p>
          )}
        </div>

        <div>
          <Label htmlFor="validIdBack" className="block text-sm font-medium text-gray-700 mb-1">
            Valid ID (Back) <span className="text-red-500">*</span>
          </Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="validIdBack"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-[#4A2A82] hover:text-[#3D2268] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#4A2A82]"
                >
                  <span>Upload a file</span>
                  <input
                    id="validIdBack"
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleFileUpload(e, "validIdBack")}
                    accept="image/png,image/jpeg,application/pdf"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
            </div>
          </div>
          {fileNames.validIdBack && (
            <p className="mt-2 text-sm text-green-600">File selected: {fileNames.validIdBack}</p>
          )}
        </div>

        <div>
          <Label htmlFor="selfieWithId" className="block text-sm font-medium text-gray-700 mb-1">
            Selfie with ID <span className="text-red-500">*</span>
          </Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="selfieWithId"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-[#4A2A82] hover:text-[#3D2268] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#4A2A82]"
                >
                  <span>Upload a file</span>
                  <input
                    id="selfieWithId"
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleFileUpload(e, "selfieWithId")}
                    accept="image/png,image/jpeg"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          </div>
          {fileNames.selfieWithId && (
            <p className="mt-2 text-sm text-green-600">File selected: {fileNames.selfieWithId}</p>
          )}
        </div>

        <div>
          <Label htmlFor="proofOfAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Proof of Address (Utility Bill, etc.) <span className="text-red-500">*</span>
          </Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="proofOfAddress"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-[#4A2A82] hover:text-[#3D2268] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#4A2A82]"
                >
                  <span>Upload a file</span>
                  <input
                    id="proofOfAddress"
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleFileUpload(e, "proofOfAddress")}
                    accept="image/png,image/jpeg,application/pdf"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
            </div>
          </div>
          {fileNames.proofOfAddress && (
            <p className="mt-2 text-sm text-green-600">File selected: {fileNames.proofOfAddress}</p>
          )}
        </div>

        {hasCurrentBusiness && (
          <div>
            <Label htmlFor="businessPermit" className="block text-sm font-medium text-gray-700 mb-1">
              Business Permit (if applicable)
            </Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="businessPermit"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-[#4A2A82] hover:text-[#3D2268] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#4A2A82]"
                  >
                    <span>Upload a file</span>
                    <input
                      id="businessPermit"
                      type="file"
                      className="sr-only"
                      onChange={(e) => handleFileUpload(e, "businessPermit")}
                      accept="image/png,image/jpeg,application/pdf"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
              </div>
            </div>
            {fileNames.businessPermit && (
              <p className="mt-2 text-sm text-green-600">File selected: {fileNames.businessPermit}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <Checkbox
              id="termsAgree"
              onCheckedChange={(checked) => {
                setValue("termsAgree", checked === true)
              }}
            />
          </div>
          <Label htmlFor="termsAgree" className="ml-2 block text-sm text-gray-700">
            I agree to the{" "}
            <a href="#" className="text-[#4A2A82] hover:text-[#3D2268]">
              Terms and Conditions
            </a>{" "}
            of becoming a PlataPay agent.
          </Label>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <Checkbox
              id="dataPrivacy"
              onCheckedChange={(checked) => {
                setValue("dataPrivacy", checked === true)
              }}
            />
          </div>
          <Label htmlFor="dataPrivacy" className="ml-2 block text-sm text-gray-700">
            I consent to PlataPay collecting and processing my personal information in accordance with the{" "}
            <a href="#" className="text-[#4A2A82] hover:text-[#3D2268]">
              Privacy Policy
            </a>
            .
          </Label>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <Checkbox
              id="infoAccuracy"
              onCheckedChange={(checked) => {
                setValue("infoAccuracy", checked === true)
              }}
            />
          </div>
          <Label htmlFor="infoAccuracy" className="ml-2 block text-sm text-gray-700">
            I certify that all information provided in this application is true and correct to the best of my knowledge.
          </Label>
        </div>
      </div>
    </div>
  )
}
