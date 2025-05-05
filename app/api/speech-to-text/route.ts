import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const mimeType = (formData.get("mimeType") as string) || audioFile.type

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    if (audioFile.size === 0) {
      return NextResponse.json({ error: "Audio file is empty" }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    try {
      console.log(`Processing audio file: ${audioFile.name}, type: ${mimeType}, size: ${audioFile.size} bytes`)

      // Convert file to buffer
      const buffer = Buffer.from(await audioFile.arrayBuffer())

      // Create a file object that OpenAI can use
      const file = new File([buffer], audioFile.name, { type: mimeType })

      // Call OpenAI API for transcription
      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
        language: "tl", // Set to Tagalog for better recognition
      })

      if (!transcription.text) {
        return NextResponse.json({ error: "No transcription returned from API" }, { status: 500 })
      }

      return NextResponse.json({ text: transcription.text })
    } catch (openaiError: any) {
      console.error("OpenAI API error:", openaiError)

      // Handle specific OpenAI errors
      if (openaiError.status === 401) {
        return NextResponse.json({ error: "Invalid OpenAI API key" }, { status: 401 })
      }

      // Check if the error is related to file format
      if (openaiError.message && openaiError.message.includes("format")) {
        return NextResponse.json(
          { error: "Unsupported audio format. Please try a different browser or device." },
          { status: 415 },
        )
      }

      return NextResponse.json(
        { error: `OpenAI API error: ${openaiError.message || "Unknown error"}` },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Server error processing audio:", error)
    return NextResponse.json(
      { error: `Failed to transcribe audio: ${error.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}
