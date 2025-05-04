import { groq } from "@ai-sdk/groq"
import { generateText, streamText } from "ai"
import { createServerClient } from "./supabase"

// Use Groq's Mixtral 8x7B model for best performance/quality balance
const MODEL = "mixtral-8x7b-32768"

// System prompt for the voice assistant
const SYSTEM_PROMPT = `
You are a helpful voice assistant that responds to user queries concisely and accurately.
Keep responses brief and conversational - under 3 sentences when possible.
If you don't know something, say so rather than making up information.
`

export type Message = {
  role: "user" | "assistant"
  content: string
}

// Generate a complete response
export async function generateResponse(messages: Message[], userId?: string, conversationId?: string) {
  try {
    // Format messages for the AI model
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Get the last user message as the prompt
    const lastUserMessage = messages.findLast((msg) => msg.role === "user")?.content || ""

    // Generate response
    const { text } = await generateText({
      model: groq(MODEL),
      messages: formattedMessages,
      system: SYSTEM_PROMPT,
    })

    // Save conversation to Supabase if userId is provided
    if (userId && conversationId) {
      await saveMessageToSupabase(conversationId, "assistant", text)
    }

    return { text, error: null }
  } catch (error) {
    console.error("Error generating AI response:", error)
    return {
      text: null,
      error: "Failed to generate response. Please try again.",
    }
  }
}

// Stream a response for real-time feedback
export async function streamResponse(
  messages: Message[],
  userId?: string,
  conversationId?: string,
  onChunk?: (chunk: string) => void,
) {
  try {
    // Format messages for the AI model
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    let fullResponse = ""

    // Stream the response
    const result = streamText({
      model: groq(MODEL),
      messages: formattedMessages,
      system: SYSTEM_PROMPT,
      onChunk: ({ chunk }) => {
        if (chunk.type === "text-delta") {
          fullResponse += chunk.text
          onChunk?.(chunk.text)
        }
      },
    })

    // When streaming completes, save to Supabase if userId is provided
    result.text.then(async (text) => {
      if (userId && conversationId) {
        await saveMessageToSupabase(conversationId, "assistant", text)
      }
    })

    return result
  } catch (error) {
    console.error("Error streaming AI response:", error)
    throw new Error("Failed to stream response")
  }
}

// Save message to Supabase
async function saveMessageToSupabase(conversationId: string, role: "user" | "assistant", content: string) {
  try {
    const supabase = createServerClient()

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role,
      content,
    })
  } catch (error) {
    console.error("Error saving message to Supabase:", error)
  }
}

// Create a new conversation
export async function createConversation(userId: string, title?: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title: title || "New Conversation",
      })
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error creating conversation:", error)
    throw error
  }
}

// Get conversation history
export async function getConversationHistory(conversationId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) throw error

    return data as Message[]
  } catch (error) {
    console.error("Error fetching conversation history:", error)
    throw error
  }
}

// Command recognition system
export async function recognizeCommand(input: string) {
  try {
    const supabase = createServerClient()

    // Get all commands from the database
    const { data: commands, error } = await supabase.from("commands").select("*")

    if (error) throw error

    // Check if input matches any command patterns
    for (const command of commands) {
      const pattern = new RegExp(command.pattern, "i")
      if (pattern.test(input)) {
        return {
          matched: true,
          command: command.name,
          description: command.description,
        }
      }
    }

    return { matched: false }
  } catch (error) {
    console.error("Error recognizing command:", error)
    return { matched: false, error }
  }
}
