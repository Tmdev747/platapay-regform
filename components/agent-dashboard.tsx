"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, LogOut, User, FileText, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface AgentApplication {
  id: string
  created_at: string
  status: "pending" | "approved" | "rejected"
  name: string
  email: string
  phone: string
  address: string
}

export function AgentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [application, setApplication] = useState<AgentApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)

        // Get current user
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          router.push("/")
          return
        }

        setUser(userData.user)

        // Get agent application
        const { data: applicationData, error } = await supabase
          .from("agents")
          .select("*")
          .eq("user_id", userData.user.id)
          .single()

        if (!error) {
          setApplication(applicationData as AgentApplication)
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router, supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold">PlataPay</span>
              <span className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                Agent Portal
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="grid gap-8 md:grid-cols-[250px_1fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Agent Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="flex flex-col space-y-1">
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/dashboard">
                      <FileText className="mr-2 h-4 w-4" />
                      Application Status
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/find-agent">
                      <MapPin className="mr-2 h-4 w-4" />
                      Find Agents
                    </Link>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Agent Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome to your PlataPay agent portal. Here you can check your application status and manage your
                profile.
              </p>
            </div>

            <Tabs defaultValue="application">
              <TabsList>
                <TabsTrigger value="application">Application Status</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>
              <TabsContent value="application" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                    <CardDescription>Check the status of your agent application</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {application ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Application ID</h3>
                            <p className="text-sm text-muted-foreground">{application.id}</p>
                          </div>
                          <Badge
                            variant={
                              application.status === "approved"
                                ? "success"
                                : application.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {application.status === "approved"
                              ? "Approved"
                              : application.status === "rejected"
                                ? "Rejected"
                                : "Pending Review"}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-medium">Submitted On</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="border-t pt-4">
                          <h3 className="font-medium mb-2">Application Details</h3>
                          <div className="grid gap-2">
                            <div>
                              <span className="text-sm font-medium">Name:</span>{" "}
                              <span className="text-sm">{application.name}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Email:</span>{" "}
                              <span className="text-sm">{application.email}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Phone:</span>{" "}
                              <span className="text-sm">{application.phone}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Address:</span>{" "}
                              <span className="text-sm">{application.address}</span>
                            </div>
                          </div>
                        </div>

                        {application.status === "pending" && (
                          <div className="bg-muted p-4 rounded-md">
                            <p className="text-sm">
                              Your application is currently under review. This process typically takes 1-3 business
                              days. You will be notified by email once a decision has been made.
                            </p>
                          </div>
                        )}

                        {application.status === "rejected" && (
                          <div className="bg-destructive/10 p-4 rounded-md">
                            <p className="text-sm">
                              Unfortunately, your application has been rejected. If you believe this is an error or
                              would like to appeal this decision, please contact our support team.
                            </p>
                            <Button variant="outline" size="sm" className="mt-2">
                              Contact Support
                            </Button>
                          </div>
                        )}

                        {application.status === "approved" && (
                          <div className="bg-green-500/10 p-4 rounded-md">
                            <p className="text-sm">
                              Congratulations! Your application has been approved. You are now a registered PlataPay
                              agent. You can start offering PlataPay services to your customers.
                            </p>
                            <Button variant="outline" size="sm" className="mt-2">
                              View Agent Resources
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">You haven't submitted an agent application yet.</p>
                        <Button asChild>
                          <Link href="/register/agent-details">Apply Now</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>Manage your personal information and account settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Account Information</h3>
                        <div className="grid gap-2 mt-2">
                          <div>
                            <span className="text-sm font-medium">Email:</span>{" "}
                            <span className="text-sm">{user?.email}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Name:</span>{" "}
                            <span className="text-sm">{user?.user_metadata?.name || "Not set"}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Account Type:</span>{" "}
                            <span className="text-sm">Agent</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" size="sm">
                          Update Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} PlataPay. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="underline underline-offset-4 hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
