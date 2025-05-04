import { type NextRequest, NextResponse } from "next/server"
import { generateResponse, type Message } from "@/lib/ai"
import { createServerClient } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { messages, userId, conversationId } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required and must be an array" }, { status: 400 })
    }

    // Get user session if userId is provided
    let user = null
    if (userId) {
      const supabase = createServerClient()
      const { data } = await supabase.auth.admin.getUserById(userId)
      user = data.user

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
    }

    const { text, error } = await generateResponse(messages as Message[], userId, conversationId)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
