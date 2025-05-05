"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function BusinessExperience() {
  const { register, setValue, watch } = useFormContext()

  const existingBusiness = watch("existingBusiness") || "no"
  const addPlataPay = watch("addPlataPay") || "no"
  const firstTimeBusiness = watch("firstTimeBusiness") || "yes"

  const showBusinessDetails = existingBusiness === "yes" && addPlataPay === "yes"

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-[#4A2A82]">💼 Business Experience</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Is this your first time to start a business?</Label>
          <RadioGroup value={firstTimeBusiness} onValueChange={(value) => setValue("firstTimeBusiness", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="firstBusiness-yes" />
              <Label htmlFor="firstBusiness-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="firstBusiness-no" />
              <Label htmlFor="firstBusiness-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Do you have an existing/operating business as of the moment?</Label>
          <RadioGroup value={existingBusiness} onValueChange={(value) => setValue("existingBusiness", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="existing-yes" />
              <Label htmlFor="existing-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="existing-no" />
              <Label htmlFor="existing-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {existingBusiness === "yes" && (
          <div className="space-y-2">
            <Label>Do you intend to add 'PlataPay' services to your existing business?</Label>
            <RadioGroup value={addPlataPay} onValueChange={(value) => setValue("addPlataPay", value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="addPlataPay-yes" />
                <Label htmlFor="addPlataPay-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="addPlataPay-no" />
                <Label htmlFor="addPlataPay-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>

      {showBusinessDetails && (
        <div className="space-y-6 border p-4 rounded-md bg-gray-50">
          <h3 className="font-semibold text-lg">If 'Yes', kindly provide your business details below:</h3>

          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input id="businessName" {...register("business.name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsOperating">Years Operating</Label>
            <Input id="yearsOperating" type="number" {...register("business.yearsOperating")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Type of Business</Label>
            <Select value={watch("business.type") || ""} onValueChange={(value) => setValue("business.type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="corporation">Corporation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessNature">Nature of Business</Label>
            <Input id="businessNature" {...register("business.nature")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input id="position" {...register("business.position")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address</Label>
            <Textarea id="businessAddress" {...register("business.address")} />
          </div>

          <h3 className="font-semibold text-lg mt-6">Additional Business Details (if applicable):</h3>

          <div className="space-y-2">
            <Label htmlFor="additionalBusinessName">Business Name</Label>
            <Input id="additionalBusinessName" {...register("additionalBusiness.name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalYearsOperating">Years Operating</Label>
            <Input id="additionalYearsOperating" type="number" {...register("additionalBusiness.yearsOperating")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalBusinessType">Type of Business</Label>
            <Select
              value={watch("additionalBusiness.type") || ""}
              onValueChange={(value) => setValue("additionalBusiness.type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="corporation">Corporation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
