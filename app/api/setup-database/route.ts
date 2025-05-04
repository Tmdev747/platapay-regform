import { NextResponse } from "next/server"
import { setupDatabaseSchema } from "@/lib/database-schema"
import { createSQLFunctions } from "./sql-functions"
import { setupDatabaseFallback } from "./fallback"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    // First, try the primary method
    try {
      // Create the necessary SQL functions
      const functionsResult = await createSQLFunctions()

      if (functionsResult.success) {
        // Then set up the database schema
        const result = await setupDatabaseSchema()

        if (result.success) {
          return NextResponse.json({
            success: true,
            message: "Database schema setup complete",
          })
        }
      }
    } catch (primaryError) {
      console.error("Primary setup method failed:", primaryError)
    }

    // If primary method fails, try direct SQL execution
    try {
      const supabase = createServerClient()

      // Try to execute SQL directly using the REST API
      const { error } = await supabase.from("_direct_sql").select("*").limit(1)

      // If the table doesn't exist, we'll get an error, which is expected
      if (error && error.message.includes('relation "_direct_sql" does not exist')) {
        // This is expected, continue with fallback
      } else if (error) {
        throw error
      }

      // Try fallback method
      const fallbackResult = await setupDatabaseFallback()

      if (fallbackResult.success) {
        return NextResponse.json({
          success: true,
          message: "Database schema setup complete (fallback method)",
        })
      } else {
        throw fallbackResult.error
      }
    } catch (fallbackError) {
      console.error("Fallback setup method failed:", fallbackError)

      // If all methods fail, return manual instructions
      return NextResponse.json(
        {
          success: false,
          error: "Automatic setup failed. Please use manual setup instructions.",
          manualSetup: true,
          sqlScript: `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create agents table
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

-- Create agent_drafts table
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

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  display_name TEXT,
  role TEXT,
  voice_settings JSONB
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id UUID REFERENCES conversations(id) NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL
);

-- Create commands table
CREATE TABLE IF NOT EXISTS commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  pattern TEXT NOT NULL
);`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in setup-database API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error,
      },
      { status: 500 },
    )
  }
}
