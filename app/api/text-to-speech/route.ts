import type { NextRequest } from "next/server"
import { textToSpeech } from "@/lib/text-to-speech"

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json()

    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const response = await textToSpeech(text, voiceId)

    // Stream the audio response
    return new Response(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("Error in text-to-speech API route:", error)
    return new Response(JSON.stringify({ error: "Failed to convert text to speech" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
