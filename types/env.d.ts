// This file extends the NodeJS namespace to include our environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    // Server-side environment variables
    MAPBOX_TOKEN: string

    // Public environment variables
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    NEXT_PUBLIC_APP_URL: string
  }
}
