import { createClient } from "@supabase/supabase-js"
import type { Database } from "../types/supabase"
import { setupDatabaseSchema } from "../lib/database-schema"
import * as readline from "readline"

// Create readline interface for secure input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Promisify the question function
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer)
    })
  })
}

async function createAdmin() {
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set")
    process.exit(1)
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  console.log("Setting up database schema...")

  // First, ensure the database schema is set up
  const schemaResult = await setupDatabaseSchema()

  if (!schemaResult.success) {
    console.error("Failed to set up database schema:", schemaResult.error)
    process.exit(1)
  }

  console.log("\n=== PlataPay Admin Creation ===\n")

  try {
    // Get admin details securely
    const email = await question("Enter admin email: ")
    const password = await question(
      "Enter admin password (min 8 chars, must include uppercase, lowercase, number, and special char): ",
    )
    const fullName = await question("Enter admin full name: ")

    // Validate inputs
    if (!email.includes("@") || !email.includes(".")) {
      console.error("Error: Please enter a valid email address")
      process.exit(1)
    }

    if (password.length < 8) {
      console.error("Error: Password must be at least 8 characters")
      process.exit(1)
    }

    // Password strength check
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      console.error("Error: Password must include uppercase, lowercase, number, and special character")
      process.exit(1)
    }

    if (!fullName || fullName.length < 2) {
      console.error("Error: Please enter a valid full name")
      process.exit(1)
    }

    console.log("\nCreating admin user...")

    // Create admin user in auth.users
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin
      user_metadata: {
        role: "admin",
        full_name: fullName,
      },
    })

    if (adminError) {
      if (adminError.message.includes("already exists")) {
        console.error("Error: A user with this email already exists")
      } else {
        console.error("Error creating admin:", adminError.message)
      }
      process.exit(1)
    }

    console.log("Admin user created successfully:", adminUser.user.id)

    // Create admin profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      user_id: adminUser.user.id,
      display_name: fullName,
      role: "admin",
    })

    if (profileError) {
      console.error("Error creating admin profile:", profileError.message)
      console.log("Warning: Admin user was created but profile creation failed")
      process.exit(1)
    }

    console.log("\nAdmin creation completed successfully!")
    console.log(`Email: ${email}`)
    console.log(`Role: admin`)
    console.log("\nYou can now sign in to the application portal with these credentials.")
  } catch (error) {
    console.error("Unexpected error:", error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Run the admin creation function
createAdmin()
