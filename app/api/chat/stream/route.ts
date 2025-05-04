import type { NextRequest } from "next/server"
import { streamResponse, type Message } from "@/lib/ai"
import { createServerClient } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { messages, userId, conversationId } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required and must be an array" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get user session if userId is provided
    let user = null
    if (userId) {
      const supabase = createServerClient()
      const { data } = await supabase.auth.admin.getUserById(userId)
      user = data.user

      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    const encoder = new TextEncoder()

    // Start streaming the response
    streamResponse(messages as Message[], userId, conversationId, (chunk) => {
      writer.write(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
    })
      .then(async (result) => {
        // When streaming is complete
        await result.text
        writer.write(encoder.encode("data: [DONE]\n\n"))
        writer.close()
      })
      .catch(async (error) => {
        console.error("Error streaming response:", error)
        writer.write(encoder.encode(`data: ${JSON.stringify({ error: "Streaming error" })}\n\n`))
        writer.close()
      })

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error in stream API route:", error)
    return new Response(JSON.stringify({ error: "Failed to process streaming request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
