import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LoadingProvider } from "@/contexts/loading-context"
import { GlobalLoading } from "@/components/global-loading"

const inter = Inter({ subsets: ["latin"] })

// Update the title and description to make it clear this is the agent management portal
export const metadata: Metadata = {
  title: "PlataPay Agent Management Portal",
  description: "Register, manage, and approve PlataPay agents across the Philippines",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LoadingProvider>
            <AuthProvider>
              {children}
              <Toaster />
              <GlobalLoading />
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
