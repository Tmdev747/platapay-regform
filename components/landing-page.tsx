"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase"
import { SignInForm } from "@/components/sign-in-form"
import { ExternalLink, Loader2 } from "lucide-react"
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
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Authentication check timed out")), 5000),
        )
        const authPromise = supabase.auth.getSession()
        const { data } = (await Promise.race([authPromise, timeoutPromise])) as { data: { session: any } }
        if (data?.session) {
          router.push("/dashboard")
        }
      } catch (err) {
        console.error("Error checking auth:", err)
        setIsLoading(false)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
    return () => {
      setIsLoading(false)
    }
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Checking authentication status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary/30 to-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <Logo />
          <a
            href="https://platapay.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center"
          >
            Main Website <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-border">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary">PlataPay Agent Application Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to access your application status</p>
          </div>

          <SignInForm />

          <div className="mt-6 pt-4 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              <p>This portal is for applicants who have already started the application process.</p>
              <p className="mt-1">For new applications, please visit our main website or contact an agent.</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PlataPay. All rights reserved.</p>
          <div className="flex justify-center gap-3 mt-1">
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
