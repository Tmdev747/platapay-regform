"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function PersonalInfo() {
  const { register, watch, setValue } = useFormContext()

  const everCharged = watch("everCharged")
  const declaredBankruptcy = watch("declaredBankruptcy")
  const firstTimeApplying = watch("firstTimeApplying")
  const incomeSource = watch("incomeSource")

  const needsDetails = everCharged === "yes" || declaredBankruptcy === "yes" || firstTimeApplying === "no"

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-[#4A2A82]">🧍 Personal Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input id="firstName" {...register("firstName")} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input id="middleName" {...register("middleName")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input id="lastName" {...register("lastName")} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nationality">
            Nationality <span className="text-red-500">*</span>
          </Label>
          <Input id="nationality" {...register("nationality")} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="placeOfBirth">
            Place of Birth <span className="text-red-500">*</span>
          </Label>
          <Input id="placeOfBirth" {...register("placeOfBirth")} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="civilStatus">
            Civil Status <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(value) => setValue("civilStatus", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
              <SelectItem value="separated">Separated</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Gender <span className="text-red-500">*</span>
        </Label>
        <RadioGroup defaultValue="male" onValueChange={(value) => setValue("gender", value)}>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="gender-male" />
              <Label htmlFor="gender-male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="gender-female" />
              <Label htmlFor="gender-female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="gender-other" />
              <Label htmlFor="gender-other">Other</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input id="email" type="email" {...register("email")} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input id="phoneNumber" {...register("phoneNumber")} placeholder="+63" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="idType">
            Valid ID Type <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(value) => setValue("idType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select ID Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="drivers_license">Driver's License</SelectItem>
              <SelectItem value="sss">SSS ID</SelectItem>
              <SelectItem value="gsis">GSIS ID</SelectItem>
              <SelectItem value="philhealth">PhilHealth ID</SelectItem>
              <SelectItem value="voters_id">Voter's ID</SelectItem>
              <SelectItem value="postal_id">Postal ID</SelectItem>
              <SelectItem value="national_id">National ID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="idNumber">
            ID Number <span className="text-red-500">*</span>
          </Label>
          <Input id="idNumber" {...register("idNumber")} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Home Address</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="No." {...register("address.number")} />
          <Input placeholder="Street" {...register("address.street")} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Input placeholder="Barangay" {...register("address.brgy")} />
          <Input placeholder="City" {...register("address.city")} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Input placeholder="Region" {...register("address.region")} />
          <Input placeholder="Zip Code" {...register("address.zipCode")} />
        </div>
        <Input placeholder="Country" defaultValue="Philippines" {...register("address.country")} className="mt-2" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tinNumber">TIN Number</Label>
        <Input id="tinNumber" {...register("tinNumber")} />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Is this your first time applying for PlataPay business partnership?</Label>
          <RadioGroup defaultValue="yes" onValueChange={(value) => setValue("firstTimeApplying", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="firstTime-yes" />
              <Label htmlFor="firstTime-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="firstTime-no" />
              <Label htmlFor="firstTime-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Have you ever been charged of anything other than minor traffic violations?</Label>
          <RadioGroup defaultValue="no" onValueChange={(value) => setValue("everCharged", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="charged-yes" />
              <Label htmlFor="charged-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="charged-no" />
              <Label htmlFor="charged-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Have you ever declared personal bankruptcy?</Label>
          <RadioGroup defaultValue="no" onValueChange={(value) => setValue("declaredBankruptcy", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="bankruptcy-yes" />
              <Label htmlFor="bankruptcy-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="bankruptcy-no" />
              <Label htmlFor="bankruptcy-no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {needsDetails && (
        <div className="space-y-2">
          <Label htmlFor="details">
            If you answered Yes to any of the above, please give details and inclusive dates
          </Label>
          <Textarea id="details" {...register("details")} className="min-h-[100px]" />
        </div>
      )}

      <div className="space-y-2">
        <Label>What is your main source of income?</Label>
        <RadioGroup
          defaultValue="employment"
          onValueChange={(value) => register("incomeSource").onChange({ target: { value } })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="employment" id="income-employment" />
            <Label htmlFor="income-employment">Employment</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="business" id="income-business" />
            <Label htmlFor="income-business">Business</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="income-other" />
            <Label htmlFor="income-other">Other</Label>
          </div>
        </RadioGroup>
      </div>

      {incomeSource === "employment" && (
        <div className="space-y-2">
          <Label htmlFor="employmentCompany">
            If you are employed, kindly state the company or organization you are working for
          </Label>
          <Input id="employmentCompany" {...register("employmentCompany")} />
        </div>
      )}
    </div>
  )
}
