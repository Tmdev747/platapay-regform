"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SystemActivation() {
  const { register } = useFormContext()

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-[#4A2A82]">🔐 System Activation Details</h2>
        <p className="text-sm text-gray-500 mt-1">For Internal Use</p>
      </div>

      <Card>
        <CardHeader className="bg-gray-100">
          <CardTitle className="text-lg">Activation Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input id="accountNumber" {...register("accountNumber")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select onValueChange={(value) => register("accountType").onChange({ target: { value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="plus">Plus</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="enterprise-deluxe">Enterprise Deluxe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activationDate">Activation Date</Label>
              <Input id="activationDate" type="date" {...register("activationDate")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent">Agent</Label>
              <Input id="agent" {...register("agent")} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
