"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
})

type FormValues = z.infer<typeof formSchema>

interface InitialRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (email: string, fullName: string) => void
}

export function InitialRegistrationModal({ open, onOpenChange, onSuccess }: InitialRegistrationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)

      // Sign up the user with Supabase Auth
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: generateTemporaryPassword(), // We'll set a temporary password that will be changed later
        options: {
          data: {
            full_name: data.fullName,
            registration_status: "started",
          },
          // Use a relative URL to avoid cross-window issues
          emailRedirectTo: `/auth/confirm`,
        },
      })

      if (error) throw error

      // Show success message
      toast({
        title: "Registration Started",
        description: "Please check your email to confirm your account and continue registration.",
      })

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data.email, data.fullName)
      }

      // Close the modal
      onOpenChange(false)
    } catch (err) {
      console.error("Error starting registration:", err)
      toast({
        title: "Registration Failed",
        description: err instanceof Error ? err.message : "Failed to start registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate a temporary random password
  const generateTemporaryPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Become a PlataPay Agent</DialogTitle>
          <DialogDescription>
            Start your journey to become a PlataPay agent. Enter your details below to begin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Dela Cruz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Start Registration"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
