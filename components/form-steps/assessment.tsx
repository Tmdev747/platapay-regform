"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Assessment() {
  const { register } = useFormContext()

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-[#4A2A82]">📝 Assessment and Approval</h2>
        <p className="text-sm text-gray-500 mt-1">For Internal Use</p>
      </div>

      <Card>
        <CardHeader className="bg-gray-100">
          <CardTitle className="text-lg">Internal Assessment</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assessorName">Assessor's Name</Label>
              <Input id="assessorName" {...register("assessorName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessmentDate">Assessment Date</Label>
              <Input id="assessmentDate" type="date" {...register("assessmentDate")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessmentResult">Assessment Result</Label>
              <Select onValueChange={(value) => register("assessmentResult").onChange({ target: { value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessorSignature">Assessor's Signature</Label>
              <Input id="assessorSignature" {...register("assessorSignature")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea id="remarks" {...register("remarks")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input id="accountName" {...register("accountName")} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
