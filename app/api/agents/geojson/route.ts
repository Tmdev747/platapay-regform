import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Only fetch approved agents
    const { data: agents, error } = await supabase.from("agents").select("*").eq("status", "approved")

    if (error) {
      console.error("Error fetching agents:", error)
      return NextResponse.json({ error: "Failed to fetch agent data" }, { status: 500 })
    }

    // Convert to GeoJSON format
    const geojson = {
      type: "FeatureCollection",
      features: agents.map((agent) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [agent.location.longitude, agent.location.latitude],
        },
        properties: {
          id: agent.id,
          name: agent.name,
          address: agent.address,
          phone: agent.phone,
          email: agent.email,
        },
      })),
    }

    return NextResponse.json(geojson)
  } catch (error) {
    console.error("Error generating GeoJSON:", error)
    return NextResponse.json({ error: "Failed to generate GeoJSON data" }, { status: 500 })
  }
}
