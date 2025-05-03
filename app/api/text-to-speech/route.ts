import { NextResponse } from "next/server"

// Voice ID is kept for backward compatibility but not used for new generation
const VOICE_ID: string = "NgAcehsHf3YdZ2ERfilE" // Madam Lyn's voice ID

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY

    if (!ELEVEN_LABS_API_KEY) {
      return NextResponse.json({ error: "Missing API credentials" }, { status: 500 })
    }

    // Make the text-to-speech request with the specific voice ID
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`ElevenLabs API error: ${errorText}`)
      throw new Error(`ElevenLabs API error: ${errorText}`)
    }

    // Get the audio data as an ArrayBuffer
    const audioData = await response.arrayBuffer()

    // Return the audio data with the appropriate content type
    return new Response(audioData, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("Error generating speech:", error)
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 })
  }
}
