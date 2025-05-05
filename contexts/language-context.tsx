"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "fil"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translations
const translations = {
  en: {
    // Form labels
    "form.fullName": "Full Name",
    "form.email": "Email Address",
    "form.phone": "Phone Number",
    "form.businessName": "Business Name",
    "form.businessType": "Business Type",
    "form.address": "Business Address",
    "form.additionalInfo": "Additional Information",

    // Placeholders
    "placeholder.fullName": "Juan Dela Cruz",
    "placeholder.email": "juan@example.com",
    "placeholder.phone": "09123456789",
    "placeholder.businessName": "Your Business Name",
    "placeholder.businessType": "e.g. Retail Store, Pharmacy, etc.",
    "placeholder.address": "123 Main St, Manila, Philippines",
    "placeholder.additionalInfo": "Any additional information about your business",

    // Buttons
    "button.saveProgress": "Save Progress",
    "button.submit": "Submit Application",
    "button.detectLocation": "Detect My Location",

    // Messages
    "message.locationDetected": "Location detected",
    "message.locationFailed": "Could not detect your location. Please enter your address manually.",
    "message.registrationSuccess": "Your application has been submitted for review.",
    "message.registrationFailed": "There was an error submitting your application. Please try again.",
    "message.draftSaved": "Your registration progress has been saved. You can continue later.",
    "message.draftLoaded": "Your previously saved registration data has been loaded.",

    // Form descriptions
    "description.address": "Please provide your complete business address",
    "description.additionalInfo": "Optional: Provide any additional details about your business",

    // Headers
    "header.registration": "PlataPay Agent Registration",
    "header.registrationDesc": "Fill out the form below to register as a PlataPay agent",

    // Footer
    "footer.terms": "By submitting this form, you agree to PlataPay's",
    "footer.termsLink": "Terms of Service",
    "footer.and": "and",
    "footer.privacyLink": "Privacy Policy",

    // Confirmation page
    "confirmation.title": "Registration Successful!",
    "confirmation.subtitle": "Thank you for registering as a PlataPay agent",
    "confirmation.hello": "Hello",
    "confirmation.submitted": "Your application has been submitted and is now pending review.",
    "confirmation.whatNext": "What happens next?",
    "confirmation.step1": "Our team will review your application within 2-3 business days.",
    "confirmation.step2":
      "You will receive an email notification once your application is approved or if additional information is needed.",
    "confirmation.step3": "After approval, you'll receive your PlataPay agent credentials and onboarding materials.",
    "confirmation.print": "Print Confirmation",
    "confirmation.findAgents": "Find Nearby Agents",
    "confirmation.dashboard": "Go to Dashboard",
    "confirmation.questions": "Have questions? Contact our support team at",
  },
  fil: {
    // Form labels
    "form.fullName": "Buong Pangalan",
    "form.email": "Email Address",
    "form.phone": "Numero ng Telepono",
    "form.businessName": "Pangalan ng Negosyo",
    "form.businessType": "Uri ng Negosyo",
    "form.address": "Address ng Negosyo",
    "form.additionalInfo": "Karagdagang Impormasyon",

    // Placeholders
    "placeholder.fullName": "Juan Dela Cruz",
    "placeholder.email": "juan@example.com",
    "placeholder.phone": "09123456789",
    "placeholder.businessName": "Pangalan ng Iyong Negosyo",
    "placeholder.businessType": "hal. Tindahan, Botika, atbp.",
    "placeholder.address": "123 Main St, Maynila, Pilipinas",
    "placeholder.additionalInfo": "Anumang karagdagang impormasyon tungkol sa iyong negosyo",

    // Buttons
    "button.saveProgress": "I-save ang Progress",
    "button.submit": "Isumite ang Aplikasyon",
    "button.detectLocation": "Tukuyin ang Aking Lokasyon",

    // Messages
    "message.locationDetected": "Natukoy ang lokasyon",
    "message.locationFailed": "Hindi matukoy ang iyong lokasyon. Mangyaring ilagay ang iyong address nang manu-mano.",
    "message.registrationSuccess": "Ang iyong aplikasyon ay naisumite na para sa pagsusuri.",
    "message.registrationFailed": "Nagkaroon ng error sa pagsumite ng iyong aplikasyon. Pakisubukang muli.",
    "message.draftSaved": "Nai-save na ang iyong registration progress. Maaari mong ipagpatuloy mamaya.",
    "message.draftLoaded": "Ang iyong naka-save na registration data ay na-load na.",

    // Form descriptions
    "description.address": "Mangyaring ibigay ang kumpletong address ng iyong negosyo",
    "description.additionalInfo": "Opsyonal: Magbigay ng anumang karagdagang detalye tungkol sa iyong negosyo",

    // Headers
    "header.registration": "Pagpaparehistro ng PlataPay Agent",
    "header.registrationDesc": "Punan ang form sa ibaba upang magparehistro bilang PlataPay agent",

    // Footer
    "footer.terms": "Sa pagsumite ng form na ito, sumasang-ayon ka sa",
    "footer.termsLink": "Mga Tuntunin ng Serbisyo",
    "footer.and": "at",
    "footer.privacyLink": "Patakaran sa Privacy",

    // Confirmation page
    "confirmation.title": "Matagumpay ang Pagpaparehistro!",
    "confirmation.subtitle": "Salamat sa pagpaparehistro bilang PlataPay agent",
    "confirmation.hello": "Kumusta",
    "confirmation.submitted": "Ang iyong aplikasyon ay naisumite na at kasalukuyang nakabinbin para sa pagsusuri.",
    "confirmation.whatNext": "Ano ang susunod na mangyayari?",
    "confirmation.step1": "Susuriin ng aming team ang iyong aplikasyon sa loob ng 2-3 araw ng trabaho.",
    "confirmation.step2":
      "Makakatanggap ka ng email notification kapag naaprubahan na ang iyong aplikasyon o kung kailangan ng karagdagang impormasyon.",
    "confirmation.step3":
      "Pagkatapos maaprubahan, makakatanggap ka ng iyong PlataPay agent credentials at mga materyales para sa onboarding.",
    "confirmation.print": "I-print ang Kumpirmasyon",
    "confirmation.findAgents": "Maghanap ng Mga Kalapit na Agent",
    "confirmation.dashboard": "Pumunta sa Dashboard",
    "confirmation.questions": "May mga katanungan? Makipag-ugnayan sa aming support team sa",
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  // Load language preference from localStorage on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "fil")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
