import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a single supabase client for the entire app
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables for server client")
    // Return a minimal client that will fail gracefully
    return createClient("https://placeholder.supabase.co", "placeholder-key")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}

// Client-side Supabase client with memoization
let browserClient: ReturnType<typeof createClient> | null = null

export const createBrowserClient = () => {
  if (browserClient) return browserClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables for browser client")
    throw new Error("Supabase configuration is missing. Please check your environment variables.")
  }

  browserClient = createClient<Database>(supabaseUrl, supabaseKey)
  return browserClient
}
