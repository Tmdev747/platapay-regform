"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Mic, MicOff, Save, Loader2, VolumeX, Volume2, Info } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessType: z.string().min(2, "Business type must be at least 2 characters"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  additional_info: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AgentRegistrationFormProps {
  userId?: string
  email?: string
  fullName?: string
  onSuccess?: () => void
  embedded?: boolean
}

// Voice prompts for each field
const fieldVoicePrompts = {
  name: "Please enter your full legal name as it appears on your ID documents.",
  email: "Enter your active email address. We'll send important updates to this address.",
  phone: "Enter your mobile number. This will be used for verification and important notifications.",
  address: "Enter your complete business address including street, barangay, city, and postal code.",
  businessName: "Enter your business name as registered with DTI or SEC.",
  businessType: "What type of business do you operate? For example: sari-sari store, pharmacy, or remittance center.",
  additional_info:
    "Please provide any additional information about your business that might be relevant for your application.",
}

// Welcome message
const welcomeMessage =
  "Welcome to the PlataPay Agent Registration. I'll guide you through the application process. You can click on the microphone icon next to each field to use voice input, or click the speaker icon to hear instructions for each field. Let's get started!"

export function AgentRegistrationForm({
  userId,
  email,
  fullName,
  onSuccess,
  embedded = false,
}: AgentRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeField, setActiveField] = useState<keyof FormValues | null>(null)
  const [formData, setFormData] = useState<Partial<FormValues> | null>(null)
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState(false)
  const [isWelcomePlayed, setIsWelcomePlayed] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  // Add geolocation functionality to the form
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [coordinates, setCoordinates] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  })

  // Text to speech hook
  const { speak, stop, isSpeaking } = useTextToSpeech()

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: fullName || "",
      email: email || "",
      phone: "",
      address: "",
      businessName: "",
      businessType: "",
      additional_info: "",
    },
    mode: "onChange", // Validate on change for better user feedback
  })

  // Play welcome message when form loads
  useEffect(() => {
    if (voiceAssistantEnabled && !isWelcomePlayed) {
      speak(welcomeMessage)
      setIsWelcomePlayed(true)
    }
  }, [voiceAssistantEnabled, isWelcomePlayed, speak])

  // Load saved form data
  useEffect(() => {
    const loadSavedData = async () => {
      if (!userId) return

      try {
        // Check if there's a draft registration
        const { data, error } = await supabase.from("agent_drafts").select("*").eq("user_id", userId).single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned" error, which is fine
          console.error("Error loading saved data:", error)
          return
        }

        if (data) {
          // Set form values from saved data
          form.reset({
            name: data.name || fullName || "",
            email: data.email || email || "",
            phone: data.phone || "",
            address: data.address || "",
            businessName: data.business_name || "",
            businessType: data.business_type || "",
            latitude: data.latitude || undefined,
            longitude: data.longitude || undefined,
            additional_info: data.additional_info || "",
          })

          // Set coordinates
          if (data.latitude && data.longitude) {
            setCoordinates({
              latitude: data.latitude,
              longitude: data.longitude,
            })
          }

          setFormData(data)

          toast({
            title: "Draft Loaded",
            description: "Your previously saved registration data has been loaded.",
          })
        }
      } catch (err) {
        console.error("Error loading saved data:", err)
      }
    }

    loadSavedData()
  }, [userId, fullName, email, form, toast, supabase])

  // Initialize speech recognition
  const {
    isListening,
    startListening,
    stopListening,
    transcript,
    isSupported: isSpeechRecognitionSupported,
  } = useSpeechRecognition({
    continuous: false,
    onResult: (result, isFinal) => {
      if (isFinal && activeField) {
        form.setValue(activeField, result, { shouldValidate: true })
        setActiveField(null)
      }
    },
  })

  // Handle voice input for a field
  const handleVoiceInput = (fieldName: keyof FormValues) => {
    if (isListening) {
      stopListening()
      setActiveField(null)
    } else {
      // Stop any ongoing speech before starting listening
      if (isSpeaking) {
        stop()
      }
      setActiveField(fieldName)
      startListening()
    }
  }

  // Handle voice instructions for a field
  const handleVoiceInstructions = (fieldName: keyof FormValues) => {
    if (isSpeaking) {
      stop()
    } else {
      speak(fieldVoicePrompts[fieldName])
    }
  }

  // Toggle voice assistant
  const toggleVoiceAssistant = () => {
    if (voiceAssistantEnabled) {
      stop() // Stop any ongoing speech
      setVoiceAssistantEnabled(false)
    } else {
      setVoiceAssistantEnabled(true)
      if (!isWelcomePlayed) {
        speak(welcomeMessage)
        setIsWelcomePlayed(true)
      }
    }
  }

  // Add this function to detect the user's location
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      })
      return
    }

    setLocationStatus("loading")

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        })
      })

      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })

      // Use our server API to get address from coordinates
      try {
        const response = await fetch(
          `/api/mapbox?operation=geocode&lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
        )

        if (response.ok) {
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            const address = data.features[0].place_name
            form.setValue("address", address, { shouldValidate: true })
          }
        }
      } catch (error) {
        console.error("Error geocoding location:", error)
        // Continue even if geocoding fails - we still have the coordinates
      }

      setLocationStatus("success")
      toast({
        title: "Location detected",
        description: "Your current location has been detected successfully.",
      })
    } catch (error) {
      console.error("Error getting location:", error)
      setLocationStatus("error")
      toast({
        title: "Location detection failed",
        description: "Could not detect your location. Please enter your address manually.",
        variant: "destructive",
      })
    }
  }

  // Save progress without submitting
  const saveProgress = async () => {
    if (!userId) {
      toast({
        title: "Cannot Save Progress",
        description: "You need to be logged in to save your progress.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const values = form.getValues()

      // Prepare data for saving
      const draftData = {
        user_id: userId,
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        business_name: values.businessName,
        business_type: values.businessType,
        latitude: coordinates.latitude || null,
        longitude: coordinates.longitude || null,
        additional_info: values.additional_info || "",
        updated_at: new Date().toISOString(),
      }

      // Check if we already have a draft
      if (formData) {
        // Update existing draft
        const { error } = await supabase.from("agent_drafts").update(draftData).eq("user_id", userId)

        if (error) throw error
      } else {
        // Create new draft
        const { error } = await supabase.from("agent_drafts").insert({
          ...draftData,
          created_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          registration_status: "in_progress",
        },
      })

      toast({
        title: "Progress Saved",
        description: "Your registration progress has been saved. You can continue later.",
      })
    } catch (err) {
      console.error("Error saving progress:", err)
      toast({
        title: "Save Failed",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)
      setSubmissionStatus("idle")
      setErrorMessage("")

      // Get geolocation if not provided
      if (!coordinates.latitude || !coordinates.longitude) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
          })

          data.latitude = position.coords.latitude
          data.longitude = position.coords.longitude
        } catch (err) {
          console.error("Error getting geolocation:", err)
          // Use default Philippines coordinates if geolocation fails
          data.latitude = 14.5995
          data.longitude = 120.9842
        }
      } else {
        data.latitude = coordinates.latitude
        data.longitude = coordinates.longitude
      }

      // Submit to Supabase with retry logic
      let retries = 0
      const maxRetries = 3
      let error = null

      while (retries < maxRetries) {
        try {
          const { error: submissionError } = await supabase.from("agents").insert({
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            business_name: data.businessName,
            business_type: data.businessType,
            location: {
              latitude: data.latitude,
              longitude: data.longitude,
            },
            additional_info: data.additional_info,
            status: "pending", // Default status
            user_id: userId,
          })

          if (!submissionError) {
            error = null
            break // Success, exit the retry loop
          }

          error = submissionError
          retries++
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retrying
        } catch (e) {
          error = e
          retries++
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retrying
        }
      }

      if (error) throw error

      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          registration_status: "completed",
        },
      })

      // Delete the draft if it exists
      if (userId) {
        await supabase.from("agent_drafts").delete().eq("user_id", userId)
      }

      // Show success message
      setSubmissionStatus("success")
      toast({
        title: "Registration Successful",
        description: "Your application has been submitted for review.",
      })

      // Voice feedback for success
      if (voiceAssistantEnabled) {
        speak("Your application has been successfully submitted. We will review your information and contact you soon.")
      }

      // Redirect after a short delay to allow the user to see the success message
      setTimeout(() => {
        // Call onSuccess callback if provided
        onSuccess?.()

        // Redirect to confirmation page if no callback provided
        if (!onSuccess) {
          router.push("/register/confirmation")
        }
      }, 2000)
    } catch (err) {
      console.error("Error submitting form:", err)
      setSubmissionStatus("error")
      setErrorMessage(
        err instanceof Error ? err.message : "There was an error submitting your application. Please try again.",
      )
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      })

      // Voice feedback for error
      if (voiceAssistantEnabled) {
        speak("There was an error submitting your application. Please check your information and try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form error state when user makes changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (submissionStatus === "error") {
        setSubmissionStatus("idle")
        setErrorMessage("")
      }
    })
    return () => subscription.unsubscribe()
  }, [form, submissionStatus])

  return (
    <Card className={embedded ? "shadow-none border-0" : ""}>
      <CardHeader className="relative">
        <div className="absolute right-6 top-6 flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVoiceAssistant}
                  className={voiceAssistantEnabled ? "bg-primary/10" : ""}
                >
                  {voiceAssistantEnabled ? (
                    <Volume2 className="h-4 w-4 text-primary" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {voiceAssistantEnabled ? "Disable voice assistant" : "Enable voice assistant"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardTitle>PlataPay Agent Registration</CardTitle>
        <CardDescription>Fill out the form below to register as a PlataPay agent</CardDescription>
      </CardHeader>
      <CardContent>
        {submissionStatus === "success" && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Registration Successful</AlertTitle>
            <AlertDescription className="text-green-700">
              Your application has been submitted for review. We will contact you soon.
            </AlertDescription>
          </Alert>
        )}

        {submissionStatus === "error" && (
          <Alert className="mb-6 bg-red-50 border-red-200" variant="destructive">
            <AlertTitle>Registration Failed</AlertTitle>
            <AlertDescription>
              {errorMessage || "There was an error submitting your application. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className={activeField === "name" ? "ring-2 ring-primary/20 rounded-md p-2 -m-2" : ""}>
                    <div className="flex items-center justify-between">
                      <FormLabel>Full Name</FormLabel>
                      <div className="flex items-center gap-1">
                        {voiceAssistantEnabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVoiceInstructions("name")}
                            className="text-muted-foreground"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        )}
                        {isSpeechRecognitionSupported && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVoiceInput("name")}
                            className={activeField === "name" ? "text-primary" : "text-muted-foreground"}
                          >
                            {isListening && activeField === "name" ? (
                              <MicOff className="h-4 w-4" />
                            ) : (
                              <Mic className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
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
                  <FormItem className={activeField === "email" ? "ring-2 ring-primary/20 rounded-md p-2 -m-2" : ""}>
                    <div className="flex items-center justify-between">
                      <FormLabel>Email Address</FormLabel>
                      <div className="flex items-center gap-1">
                        {voiceAssistantEnabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVoiceInstructions("email")}
                            className="text-muted-foreground"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        )}
                        {isSpeechRecognitionSupported && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVoiceInput("email")}
                            className={activeField === "email" ? "text-primary" : "text-muted-foreground"}
                          >
                            {isListening && activeField === "email" ? (
                              <MicOff className="h-4 w-4" />
                            ) : (
                              <Mic className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <FormControl>
                      <Input type="email" placeholder="juan@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className={activeField === "phone" ? "ring-2 ring-primary/20 rounded-md p-2 -m-2" : ""}>
                    <div className="flex items-center justify-between">
                      <FormLabel>Phone Number</FormLabel>
                      <div className="flex items-center gap-1">
                        {voiceAssistantEnabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVoiceInstructions("phone")}
                            className="text-muted-foreground"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        )}
                        {isSpeechRecognitionSupported && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVoiceInput("phone")}
                            className={activeField === "phone" ? "text-primary" : "text-muted-foreground"}
                          >
                            {isListening && activeField === "phone" ? (
                              <MicOff className="h-4 w-4" />
                            ) : (
                              <Mic className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <FormControl>
                      <Input placeholder="09123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem
                    className={activeField === "businessName" ? "ring-2 ring-primary/20 rounded-md p-2 -m-2" : ""}
                  >
                    <div className="flex items-center justify-between">
                      <FormLabel>Business Name</FormLabel>
                      <div className="flex items-center gap-1">
                        {voiceAssistantEnabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVoiceInstructions("businessName")}
                            className="text-muted-foreground"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        )}
                        {isSpeechRecognitionSupported && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVoiceInput("businessName")}
                            className={activeField === "businessName" ? "text-primary" : "text-muted-foreground"}
                          >
                            {isListening && activeField === "businessName" ? (
                              <MicOff className="h-4 w-4" />
                            ) : (
                              <Mic className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <FormControl>
                      <Input placeholder="Your Business Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem
                    className={activeField === "businessType" ? "ring-2 ring-primary/20 rounded-md p-2 -m-2" : ""}
                  >
                    <div className="flex items-center justify-between">
                      <FormLabel>Business Type</FormLabel>
                      <div className="flex items-center gap-1">
                        {voiceAssistantEnabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVoiceInstructions("businessType")}
                            className="text-muted-foreground"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        )}
                        {isSpeechRecognitionSupported && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVoiceInput("businessType")}
                            className={activeField === "businessType" ? "text-primary" : "text-muted-foreground"}
                          >
                            {isListening && activeField === "businessType" ? (
                              <MicOff className="h-4 w-4" />
                            ) : (
                              <Mic className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <FormControl>
                      <Input placeholder="e.g. Retail Store, Pharmacy, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className={activeField === "address" ? "ring-2 ring-primary/20 rounded-md p-2 -m-2" : ""}>
                  <div className="flex items-center justify-between">
                    <FormLabel>Business Address</FormLabel>
                    <div className="flex items-center gap-1">
                      {voiceAssistantEnabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVoiceInstructions("address")}
                          className="text-muted-foreground"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      )}
                      {isSpeechRecognitionSupported && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVoiceInput("address")}
                          className={activeField === "address" ? "text-primary" : "text-muted-foreground"}
                        >
                          {isListening && activeField === "address" ? (
                            <MicOff className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <FormControl>
                    <Textarea placeholder="123 Main St, Manila, Philippines" {...field} />
                  </FormControl>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={detectLocation}
                      disabled={locationStatus === "loading"}
                      className="text-xs"
                    >
                      {locationStatus === "loading" ? (
                        <>
                          <span className="mr-1">Detecting...</span>
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        </>
                      ) : (
                        "Detect My Location"
                      )}
                    </Button>
                    {locationStatus === "success" && <span className="text-xs text-green-600">Location detected</span>}
                  </div>
                  <FormDescription>Please provide your complete business address</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additional_info"
              render={({ field }) => (
                <FormItem
                  className={activeField === "additional_info" ? "ring-2 ring-primary/20 rounded-md p-2 -m-2" : ""}
                >
                  <div className="flex items-center justify-between">
                    <FormLabel>Additional Information</FormLabel>
                    <div className="flex items-center gap-1">
                      {voiceAssistantEnabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVoiceInstructions("additional_info")}
                          className="text-muted-foreground"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      )}
                      {isSpeechRecognitionSupported && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVoiceInput("additional_info")}
                          className={activeField === "additional_info" ? "text-primary" : "text-muted-foreground"}
                        >
                          {isListening && activeField === "additional_info" ? (
                            <MicOff className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <FormControl>
                    <Textarea placeholder="Any additional information about your business" {...field} />
                  </FormControl>
                  <FormDescription>Optional: Provide any additional details about your business</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4">
              {userId && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={saveProgress}
                  disabled={isSaving || isSubmitting}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Progress
                    </>
                  )}
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={isSubmitting || isSaving}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>
          By submitting this form, you agree to PlataPay's{" "}
          <a href="https://platapay.com/terms" className="underline" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="https://platapay.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
