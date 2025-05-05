"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { Logo } from "./logo"
import { useRouter } from "next/navigation"

const preRegistrationSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type PreRegistrationFormData = z.infer<typeof preRegistrationSchema>

export function PreRegistrationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreRegistrationFormData>({
    resolver: zodResolver(preRegistrationSchema),
  })

  const onSubmit = async (data: PreRegistrationFormData) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      // In a real application, you would send this data to your backend
      // For now, we'll just simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store user data in localStorage (in a real app, this would be in a database)
      localStorage.setItem("platapayUserEmail", data.email)
      localStorage.setItem("platapayUserName", data.fullName)

      // Simulate successful registration
      setSubmitStatus("success")

      // Redirect to application form after a short delay
      setTimeout(() => {
        router.push("/application")
      }, 1500)
    } catch (error) {
      console.error("Error during registration:", error)
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8A63AC] to-[#58317A] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo size="large" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Start Your Application</CardTitle>
          <CardDescription className="text-center">
            Enter your details to begin your PlataPay Agent application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Juan Dela Cruz"
                {...register("fullName")}
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@example.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            {submitStatus === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{errorMessage || "Registration failed. Please try again."}</span>
              </div>
            )}

            {submitStatus === "success" && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Registration successful! Redirecting to application form...</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#58317A] hover:bg-[#482968]"
              disabled={isSubmitting || submitStatus === "success"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Continue to Application"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-gray-500 text-center">
            <p>By continuing, you'll be able to:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-left">
              <li>Complete your PlataPay Agent application</li>
              <li>Pin your business location on the map</li>
              <li>Track your application status</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
