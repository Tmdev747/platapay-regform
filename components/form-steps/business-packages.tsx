"use client"

import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function BusinessPackages() {
  const { register, setValue, watch } = useFormContext()

  // Add this to track the selected values
  const selectedPlan = watch("plan") || ""
  const selectedEnterprisePackage = watch("enterprisePackage") || ""

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-[#4A2A82]">📦 PlataPay Business Packages</h2>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">PlataPay Monthly Plans</h3>

        <RadioGroup value={selectedPlan} onValueChange={(value) => setValue("plan", value)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className={`border-2 hover:border-[#4A2A82] transition-all ${selectedPlan === "basic" ? "border-[#4A2A82]" : ""}`}
            >
              <CardHeader className="bg-[#58317A] text-white">
                <CardTitle className="text-2xl">Basic Plan</CardTitle>
                <div className="text-4xl font-bold">499</div>
              </CardHeader>
              <CardContent className="pt-4">
                <p>Inclusions: Marketing Collateral + 499 Initial Transaction Fund</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center space-x-2 w-full">
                  <RadioGroupItem value="basic" id="plan-basic" />
                  <Label htmlFor="plan-basic" className="flex-1">
                    Select Basic Plan
                  </Label>
                </div>
              </CardFooter>
            </Card>

            <Card
              className={`border-2 hover:border-[#4A2A82] transition-all ${selectedPlan === "plus" ? "border-[#4A2A82]" : ""}`}
            >
              <CardHeader className="bg-[#58317A] text-white">
                <CardTitle className="text-2xl">Plus Plan</CardTitle>
                <div className="text-4xl font-bold">999</div>
              </CardHeader>
              <CardContent className="pt-4">
                <p>Inclusions: Marketing Collateral + 999 Initial Transaction Fund</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center space-x-2 w-full">
                  <RadioGroupItem value="plus" id="plan-plus" />
                  <Label htmlFor="plan-plus" className="flex-1">
                    Select Plus Plan
                  </Label>
                </div>
              </CardFooter>
            </Card>

            <Card
              className={`border-2 hover:border-[#4A2A82] transition-all ${selectedPlan === "premium" ? "border-[#4A2A82]" : ""}`}
            >
              <CardHeader className="bg-[#58317A] text-white">
                <CardTitle className="text-2xl">Premium Plan</CardTitle>
                <div className="text-4xl font-bold">1499</div>
              </CardHeader>
              <CardContent className="pt-4">
                <p>Inclusions: Marketing Collateral + 1499 Initial Transaction Fund</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center space-x-2 w-full">
                  <RadioGroupItem value="premium" id="plan-premium" />
                  <Label htmlFor="plan-premium" className="flex-1">
                    Select Premium Plan
                  </Label>
                </div>
              </CardFooter>
            </Card>
          </div>
        </RadioGroup>

        <h3 className="text-xl font-semibold mt-8">PlataPay Enterprise Package</h3>

        <RadioGroup value={selectedEnterprisePackage} onValueChange={(value) => setValue("enterprisePackage", value)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`border-2 hover:border-[#4A2A82] transition-all ${selectedEnterprisePackage === "enterprise" ? "border-[#4A2A82]" : ""}`}
            >
              <CardHeader className="bg-[#58317A] text-white">
                <CardTitle>Enterprise Plan</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>Custom enterprise solution for larger businesses</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center space-x-2 w-full">
                  <RadioGroupItem value="enterprise" id="enterprise-basic" />
                  <Label htmlFor="enterprise-basic" className="flex-1">
                    Select Enterprise Plan
                  </Label>
                </div>
              </CardFooter>
            </Card>

            <Card
              className={`border-2 hover:border-[#4A2A82] transition-all ${selectedEnterprisePackage === "enterprise-deluxe" ? "border-[#4A2A82]" : ""}`}
            >
              <CardHeader className="bg-[#58317A] text-white">
                <CardTitle>Enterprise Deluxe Plan</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>Premium enterprise solution with additional benefits</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center space-x-2 w-full">
                  <RadioGroupItem value="enterprise-deluxe" id="enterprise-deluxe" />
                  <Label htmlFor="enterprise-deluxe" className="flex-1">
                    Select Enterprise Deluxe Plan
                  </Label>
                </div>
              </CardFooter>
            </Card>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
