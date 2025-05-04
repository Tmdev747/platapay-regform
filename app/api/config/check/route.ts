import { NextResponse } from "next/server"

export async function GET() {
  // Check if essential environment variables are set
  const checks = {
    mapbox: !!process.env.MAPBOX_TOKEN,
    supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    elevenlabs: !!(process.env.ELEVEN_LABS_API_KEY && process.env.ELEVEN_LABS_VOICE_ID),
    groq: !!process.env.GROQ_API_KEY,
  }

  // Don't expose actual values, just whether they're set or not
  return NextResponse.json({
    status: "success",
    configured: checks,
    allConfigured: Object.values(checks).every(Boolean),
  })
}
