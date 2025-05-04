"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormValues = z.infer<typeof formSchema>

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true)
      setAuthError(null) // Clear any previous errors

      // Simple timeout function that doesn't throw errors
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Sign in request timed out")), 10000)
      })

      try {
        // Use Promise.race but handle the auth request separately
        const result = await Promise.race([
          supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          }),
          timeoutPromise,
        ])

        // If we get here, the auth request completed before the timeout
        if (result.error) {
          // Handle Supabase auth error
          throw result.error
        }

        // Sign in successful
        toast({
          title: "Sign in successful",
          description: "Redirecting to your dashboard...",
        })

        // Short delay before redirect to show success message
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 500)
      } catch (error: any) {
        // Check if it's a timeout error
        if (error.message === "Sign in request timed out") {
          setAuthError("Request timed out. Please try again.")
        } else {
          // Handle Supabase auth errors
          setAuthError(error.message || "Invalid login credentials")
        }

        console.error("Sign in error:", error)
      }
    } catch (error: any) {
      console.error("Unexpected error:", error)
      setAuthError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {authError && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
        <div className="text-center">
          <a href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot your password?
          </a>
        </div>
      </form>
    </Form>
  )
}
