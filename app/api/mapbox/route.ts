import { type NextRequest, NextResponse } from "next/server"

// Get Mapbox token from server environment
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN

export async function GET(request: NextRequest) {
  // Check if token exists
  if (!MAPBOX_TOKEN) {
    console.error("MAPBOX_TOKEN environment variable is not set")
    return NextResponse.json(
      {
        error: "Mapbox token not configured on server",
        message: "Please set the MAPBOX_TOKEN environment variable",
      },
      { status: 500 },
    )
  }

  // Get the operation type from the URL
  const searchParams = request.nextUrl.searchParams
  const operation = searchParams.get("operation")

  if (operation === "token") {
    // Return a temporary token for client use (with limited permissions)
    return NextResponse.json({ token: MAPBOX_TOKEN })
  }

  if (operation === "geocode") {
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Missing latitude or longitude parameters" }, { status: 400 })
    }

    try {
      // Forward the request to Mapbox geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`,
      )

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Error geocoding:", error)
      return NextResponse.json({ error: "Failed to geocode coordinates" }, { status: 500 })
    }
  }

  return NextResponse.json({ error: "Invalid operation" }, { status: 400 })
}
