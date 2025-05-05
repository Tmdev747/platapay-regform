import { createClient } from "@supabase/supabase-js"
import type { Database } from "../types/supabase"
import { setupDatabaseSchema } from "../lib/database-schema"
import * as crypto from "crypto"

// Function to hash passwords (for demonstration - in production, use Supabase Auth)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

async function seedAdminAndApplicants() {
  // Create Supabase client
  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  console.log("Setting up database schema...")

  // First, ensure the database schema is set up
  const schemaResult = await setupDatabaseSchema()

  if (!schemaResult.success) {
    console.error("Failed to set up database schema:", schemaResult.error)
    return
  }

  console.log("Creating admin user...")

  try {
    // Create admin user in auth.users
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: "admin@platapay.com",
      password: "Admin123!",
      email_confirm: true,
      user_metadata: {
        role: "admin",
        full_name: "System Administrator",
      },
    })

    if (adminError) {
      // If user already exists, this is fine
      if (adminError.message.includes("already exists")) {
        console.log("Admin user already exists, skipping creation")
      } else {
        throw adminError
      }
    } else {
      console.log("Created admin user:", adminUser.user.id)

      // Create admin profile
      const { error: profileError } = await supabase.from("user_profiles").insert({
        user_id: adminUser.user.id,
        display_name: "System Administrator",
        role: "admin",
      })

      if (profileError && !profileError.message.includes("duplicate")) {
        throw profileError
      }
    }

    // Sample applicant data
    const sampleApplicants = [
      {
        email: "applicant1@example.com",
        password: "Password123!",
        name: "Juan Dela Cruz",
        phone: "09123456789",
        business_name: "JDC Enterprises",
        business_type: "Sari-sari Store",
      },
      {
        email: "applicant2@example.com",
        password: "Password123!",
        name: "Maria Santos",
        phone: "09234567890",
        business_name: "Santos General Merchandise",
        business_type: "Convenience Store",
      },
      {
        email: "applicant3@example.com",
        password: "Password123!",
        name: "Pedro Reyes",
        phone: "09345678901",
        business_name: "Reyes Money Services",
        business_type: "Remittance Center",
      },
    ]

    console.log("Creating sample applicants...")

    // Create sample applicants
    for (const applicant of sampleApplicants) {
      try {
        // Create user in auth.users
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          email: applicant.email,
          password: applicant.password,
          email_confirm: true,
          user_metadata: {
            full_name: applicant.name,
            phone: applicant.phone,
          },
        })

        if (userError) {
          // If user already exists, skip
          if (userError.message.includes("already exists")) {
            console.log(`User ${applicant.email} already exists, skipping`)
            continue
          } else {
            throw userError
          }
        }

        const userId = userData.user.id
        console.log(`Created user: ${userId}`)

        // Create agent draft for the applicant
        const { error: draftError } = await supabase.from("agent_drafts").insert({
          user_id: userId,
          name: applicant.name,
          email: applicant.email,
          phone: applicant.phone,
          business_name: applicant.business_name,
          business_type: applicant.business_type,
          address: "Sample Address, Manila, Philippines",
          latitude: 14.5995 + (Math.random() * 0.1 - 0.05),
          longitude: 120.9842 + (Math.random() * 0.1 - 0.05),
          additional_info: "This is a sample applicant created by the seeding script.",
        })

        if (draftError) {
          throw draftError
        }

        console.log(`Created agent draft for ${applicant.email}`)
      } catch (error) {
        console.error(`Error creating applicant ${applicant.email}:`, error)
      }
    }

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seed function
seedAdminAndApplicants()
