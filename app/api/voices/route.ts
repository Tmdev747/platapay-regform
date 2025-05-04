import { type NextRequest, NextResponse } from "next/server"
import { getVoices } from "@/lib/text-to-speech"

export async function GET(req: NextRequest) {
  try {
    const voices = await getVoices()
    return NextResponse.json({ voices })
  } catch (error) {
    console.error("Error in voices API route:", error)
    return NextResponse.json({ error: "Failed to fetch voices" }, { status: 500 })
  }
}
