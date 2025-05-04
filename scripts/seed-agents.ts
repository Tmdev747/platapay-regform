import { createClient } from "@supabase/supabase-js"
import type { Database } from "../types/supabase"
import { setupDatabaseSchema } from "../lib/database-schema"

// Sample agent data for the Philippines
const sampleAgents = [
  {
    name: "Manila Financial Services",
    email: "manila@example.com",
    phone: "09123456789",
    address: "123 Rizal Ave, Ermita, Manila, 1000 Metro Manila",
    location: {
      latitude: 14.5995,
      longitude: 120.9842,
    },
    status: "approved",
  },
  {
    name: "Cebu Money Transfer",
    email: "cebu@example.com",
    phone: "09234567890",
    address: "456 Osmeña Blvd, Cebu City, 6000 Cebu",
    location: {
      latitude: 10.3157,
      longitude: 123.8854,
    },
    status: "approved",
  },
  {
    name: "Davao Financial Center",
    email: "davao@example.com",
    phone: "09345678901",
    address: "789 C.M. Recto St, Davao City, 8000 Davao del Sur",
    location: {
      latitude: 7.0707,
      longitude: 125.6087,
    },
    status: "approved",
  },
  {
    name: "Baguio Payment Solutions",
    email: "baguio@example.com",
    phone: "09456789012",
    address: "101 Session Road, Baguio City, 2600 Benguet",
    location: {
      latitude: 16.4023,
      longitude: 120.596,
    },
    status: "approved",
  },
  {
    name: "Iloilo Money Express",
    email: "iloilo@example.com",
    phone: "09567890123",
    address: "202 General Luna St, Iloilo City, 5000 Iloilo",
    location: {
      latitude: 10.7202,
      longitude: 122.5621,
    },
    status: "approved",
  },
  {
    name: "Cagayan de Oro Remittance",
    email: "cdo@example.com",
    phone: "09678901234",
    address: "303 Corrales Ave, Cagayan de Oro, 9000 Misamis Oriental",
    location: {
      latitude: 8.4542,
      longitude: 124.6319,
    },
    status: "approved",
  },
  {
    name: "Bacolod Cash Services",
    email: "bacolod@example.com",
    phone: "09789012345",
    address: "404 Lacson St, Bacolod City, 6100 Negros Occidental",
    location: {
      latitude: 10.6713,
      longitude: 122.9511,
    },
    status: "approved",
  },
  {
    name: "Zamboanga Transfer Hub",
    email: "zamboanga@example.com",
    phone: "09890123456",
    address: "505 Mayor Jaldon St, Zamboanga City, 7000 Zamboanga del Sur",
    location: {
      latitude: 6.9214,
      longitude: 122.079,
    },
    status: "approved",
  },
  {
    name: "Batangas Financial Center",
    email: "batangas@example.com",
    phone: "09901234567",
    address: "606 P. Burgos St, Batangas City, 4200 Batangas",
    location: {
      latitude: 13.7565,
      longitude: 121.0583,
    },
    status: "approved",
  },
  {
    name: "Naga City Money Services",
    email: "naga@example.com",
    phone: "09012345678",
    address: "707 Magsaysay Ave, Naga City, 4400 Camarines Sur",
    location: {
      latitude: 13.6192,
      longitude: 123.1944,
    },
    status: "approved",
  },
]

async function seedAgents() {
  // Create Supabase client
  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  console.log("Setting up database schema...")

  // First, ensure the database schema is set up
  const schemaResult = await setupDatabaseSchema()

  if (!schemaResult.success) {
    console.error("Failed to set up database schema:", schemaResult.error)
    return
  }

  console.log("Seeding agents...")

  try {
    // Insert sample agents
    const { data, error } = await supabase.from("agents").insert(sampleAgents).select()

    if (error) {
      throw error
    }

    console.log(`Successfully seeded ${data.length} agents`)
  } catch (error) {
    console.error("Error seeding agents:", error)
  }
}

// Run the seed function
seedAgents()
