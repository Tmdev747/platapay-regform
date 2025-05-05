import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Test and manage email templates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Send test emails to verify template rendering and delivery.</p>
            <div className="space-y-2">
              <Button asChild className="w-full bg-[#58317A] hover:bg-[#482968]">
                <Link href="/admin/email-test">Test Email Templates</Link>
              </Button>
              <Button asChild className="w-full bg-[#58317A] hover:bg-[#482968]">
                <Link href="/admin/templates">Manage Templates</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Manage agent applications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Review, approve, or reject pending applications.</p>
            <Button asChild className="w-full bg-[#58317A] hover:bg-[#482968]">
              <Link href="/admin/applications">View Applications</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
            <CardDescription>Manage application reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Send reminders for incomplete applications.</p>
            <Button asChild className="w-full bg-[#58317A] hover:bg-[#482968]">
              <Link href="/admin/reminders">Manage Reminders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
