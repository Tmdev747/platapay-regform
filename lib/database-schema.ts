import { createServerClient } from "@/lib/supabase"

export async function setupDatabaseSchema() {
  const supabase = createServerClient()

  console.log("Setting up database schema...")

  try {
    // Create extensions if they don't exist
    const { error: extensionError } = await supabase.rpc("create_uuid_extension")

    if (extensionError && !extensionError.message.includes("already exists")) {
      console.error("Error creating extension:", extensionError)
      return { success: false, error: extensionError }
    }

    // Create agents table
    const { error: agentsError } = await supabase.from("_schema_setup").insert({
      table_name: "agents",
      sql: `
        CREATE TABLE IF NOT EXISTS agents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          address TEXT NOT NULL,
          business_name TEXT NOT NULL,
          business_type TEXT NOT NULL,
          location JSONB NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          additional_info TEXT,
          user_id UUID REFERENCES auth.users(id)
        );
      `,
    })

    if (agentsError) {
      console.error("Error creating agents table:", agentsError)
      return { success: false, error: agentsError }
    }

    // Create agent_drafts table
    const { error: draftsError } = await supabase.from("_schema_setup").insert({
      table_name: "agent_drafts",
      sql: `
        CREATE TABLE IF NOT EXISTS agent_drafts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
          name TEXT,
          email TEXT,
          phone TEXT,
          address TEXT,
          business_name TEXT,
          business_type TEXT,
          latitude FLOAT,
          longitude FLOAT,
          additional_info TEXT
        );
      `,
    })

    if (draftsError) {
      console.error("Error creating agent_drafts table:", draftsError)
      return { success: false, error: draftsError }
    }

    // Create user_profiles table
    const { error: profilesError } = await supabase.from("_schema_setup").insert({
      table_name: "user_profiles",
      sql: `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          display_name TEXT,
          role TEXT,
          voice_settings JSONB
        );
      `,
    })

    if (profilesError) {
      console.error("Error creating user_profiles table:", profilesError)
      return { success: false, error: profilesError }
    }

    // Create conversations table
    const { error: conversationsError } = await supabase.from("_schema_setup").insert({
      table_name: "conversations",
      sql: `
        CREATE TABLE IF NOT EXISTS conversations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          title TEXT
        );
      `,
    })

    if (conversationsError) {
      console.error("Error creating conversations table:", conversationsError)
      return { success: false, error: conversationsError }
    }

    // Create messages table
    const { error: messagesError } = await supabase.from("_schema_setup").insert({
      table_name: "messages",
      sql: `
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          conversation_id UUID REFERENCES conversations(id) NOT NULL,
          content TEXT NOT NULL,
          role TEXT NOT NULL
        );
      `,
    })

    if (messagesError) {
      console.error("Error creating messages table:", messagesError)
      return { success: false, error: messagesError }
    }

    // Create commands table
    const { error: commandsError } = await supabase.from("_schema_setup").insert({
      table_name: "commands",
      sql: `
        CREATE TABLE IF NOT EXISTS commands (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          pattern TEXT NOT NULL
        );
      `,
    })

    if (commandsError) {
      console.error("Error creating commands table:", commandsError)
      return { success: false, error: commandsError }
    }

    console.log("Database schema setup complete!")
    return { success: true }
  } catch (error) {
    console.error("Error setting up database schema:", error)
    return { success: false, error }
  }
}
