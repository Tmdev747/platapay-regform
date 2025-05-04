"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase"
import { SignInForm } from "@/components/sign-in-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, ExternalLink, Loader2, MapPin, Users, FileText, DollarSign, UserPlus, BookOpen } from "lucide-react"
import { Logo } from "@/components/logo"

export function LandingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)

        // Add a timeout to prevent hanging indefinitely
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Authentication check timed out")), 5000),
        )

        const authPromise = supabase.auth.getSession()

        // Race between the auth check and the timeout
        const { data } = (await Promise.race([authPromise, timeoutPromise])) as { data: { session: any } }

        if (data?.session) {
          // User is already logged in, redirect to dashboard
          router.push("/dashboard")
        }
      } catch (err) {
        console.error("Error checking auth:", err)
        // Even if there's an error, we should stop loading
        setIsLoading(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Start auth check
    checkAuth()

    // Clean up function
    return () => {
      // If component unmounts during auth check, ensure we don't update state
      setIsLoading(false)
    }
  }, [router, supabase]) // Remove supabase.auth dependency to prevent re-renders

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Checking authentication status...</p>
          <p className="text-xs text-muted-foreground mt-1">This should only take a moment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Logo />
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <a
              href="https://platapay.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center"
            >
              Main Website <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-secondary/50 to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter text-primary sm:text-4xl md:text-5xl">
                    PlataPay Agent Management Portal
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Welcome to the dedicated portal for PlataPay agent registration, approval, and management.
                  </p>
                </div>
                <div className="space-y-4">
                  <Alert className="border-primary/20 bg-primary/5">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle>This is not the main PlataPay website</AlertTitle>
                    <AlertDescription>
                      This portal is exclusively for agent management. For general PlataPay services, please visit the{" "}
                      <a
                        href="https://platapay.ph"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline underline-offset-4 text-primary"
                      >
                        main website
                      </a>
                      .
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <Card className="bg-background hover:bg-secondary/20 transition-colors">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="rounded-full bg-primary/10 p-3 mb-4">
                          <UserPlus className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Become an Agent</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Join our network of financial service providers across the Philippines
                        </p>
                        <Link href="/register" className="w-full">
                          <Button className="w-full">Apply Now</Button>
                        </Link>
                      </CardContent>
                    </Card>

                    <Card className="bg-background hover:bg-secondary/20 transition-colors">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="rounded-full bg-primary/10 p-3 mb-4">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Find Agents</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Locate PlataPay agents in your area using our interactive map
                        </p>
                        <Link href="/find-agent" className="w-full">
                          <Button variant="outline" className="w-full">
                            Find Nearby
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>

                    <Card className="bg-background hover:bg-secondary/20 transition-colors">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="rounded-full bg-primary/10 p-3 mb-4">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Agent Resources</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Access training materials and resources for PlataPay agents
                        </p>
                        <Link href="/resources" className="w-full">
                          <Button variant="outline" className="w-full">
                            View Resources
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6">
                <div className="flex flex-col space-y-2 text-center">
                  <h2 className="text-2xl font-bold text-primary">Sign In to Your Account</h2>
                  <p className="text-sm text-muted-foreground">Enter your credentials to access your agent portal</p>
                </div>

                <Card className="border-primary/20">
                  <CardHeader className="pb-4">
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>Access your agent portal account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="signin" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                      </TabsList>
                      <TabsContent value="signin">
                        <SignInForm />
                      </TabsContent>
                      <TabsContent value="register">
                        <div className="space-y-4 py-4">
                          <p className="text-sm text-muted-foreground text-center">
                            Agent registration requires approval. Please click the button below to start the process.
                          </p>
                          <Link href="/register" className="w-full">
                            <Button className="w-full">Start Agent Registration</Button>
                          </Link>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <div className="text-xs text-muted-foreground text-center">
                      By signing in, you agree to our{" "}
                      <a href="#" className="underline underline-offset-4 hover:text-primary">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="underline underline-offset-4 hover:text-primary">
                        Privacy Policy
                      </a>
                      .
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-primary mb-2">Why Become a PlataPay Agent?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join our growing network of financial service providers and help bring financial services to more
                Filipinos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn Commissions</h3>
                <p className="text-muted-foreground">
                  Earn competitive commissions on every transaction processed through your agent account
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Grow Your Business</h3>
                <p className="text-muted-foreground">
                  Attract more customers to your existing business by offering essential financial services
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Training & Support</h3>
                <p className="text-muted-foreground">
                  Receive comprehensive training and ongoing support from our dedicated agent support team
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} PlataPay. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms
            </Link>
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy
            </Link>
            <Link href="/contact" className="underline underline-offset-4 hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
