"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { createBrowserClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface Agent {
  id: string
  name: string
  location: {
    latitude: number
    longitude: number
  }
  address: string
  phone: string
  email: string
}

export function EmbeddableAgentMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)

  // Center of Philippines
  const [lng] = useState(121.774)
  const [lat] = useState(12.8797)
  const [zoom] = useState(5.5)

  // Fetch Mapbox token from server
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const response = await fetch("/api/mapbox?operation=token")
        if (!response.ok) {
          throw new Error("Failed to fetch Mapbox token")
        }
        const data = await response.json()
        setMapboxToken(data.token)
      } catch (err) {
        console.error("Error fetching Mapbox token:", err)
        setError("Failed to load map. Please try again later.")
      }
    }

    fetchMapboxToken()
  }, [])

  // Fetch agents from Supabase
  const fetchAgents = async () => {
    try {
      setLoading(true)
      const supabase = createBrowserClient()

      // Only fetch approved agents
      const { data, error } = await supabase.from("agents").select("*").eq("status", "approved")

      if (error) {
        // Check if the error is about missing relation
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          setError("Database schema not set up. Please run the database setup first.")
          console.error("Database schema not set up:", error.message)
        } else {
          setError("Failed to load agent data")
          console.error("Error fetching agents:", error)
        }
        setAgents([])
        return
      }

      setAgents(data as Agent[])
    } catch (err) {
      console.error("Error fetching agents:", err)
      setError("Failed to load agent data")
      setAgents([])
    } finally {
      setLoading(false)
    }
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return

    try {
      // Set the token
      mapboxgl.accessToken = mapboxToken

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom: zoom,
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl())

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        }),
      )

      // Send resize event to parent
      map.current.on("load", () => {
        sendResizeMessage()
        fetchAgents()
      })
    } catch (err) {
      console.error("Error initializing map:", err)
      setError("Failed to initialize map")
    }
  }, [lng, lat, zoom, mapboxToken])

  // Add markers for agents
  useEffect(() => {
    if (!map.current || loading || agents.length === 0) return

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove())
    markers.current = []

    // Add markers for each agent
    agents.forEach((agent) => {
      // Create custom marker element
      const markerEl = document.createElement("div")
      markerEl.className = "agent-marker"
      markerEl.style.backgroundImage = `url(/icons/map-pin.svg)`
      markerEl.style.width = "32px"
      markerEl.style.height = "32px"
      markerEl.style.backgroundSize = "cover"
      markerEl.style.cursor = "pointer"

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <strong>${agent.name}</strong>
          <p style="margin: 5px 0;">${agent.address}</p>
          <p style="margin: 5px 0;">Phone: ${agent.phone}</p>
        </div>
      `)

      // Add marker to map
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([agent.location.longitude, agent.location.latitude])
        .setPopup(popup)
        .addTo(map.current!)

      // Add click event to marker
      markerEl.addEventListener("click", () => {
        setSelectedAgent(agent)
        sendResizeMessage()
      })

      // Store marker reference for cleanup
      markers.current.push(marker)
    })

    // Fit map to markers if there are any
    if (agents.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      agents.forEach((agent) => {
        bounds.extend([agent.location.longitude, agent.location.latitude])
      })
      map.current.fitBounds(bounds, { padding: 50 })
    }
  }, [agents, loading])

  // Send resize message to parent window
  const sendResizeMessage = () => {
    if (window.parent && window !== window.parent) {
      const height = mapContainer.current?.offsetHeight || 500
      window.parent.postMessage({ type: "resize", height: height + (selectedAgent ? 150 : 0) }, "*")
    }
  }

  // Listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      sendResizeMessage()
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [selectedAgent])

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <div ref={mapContainer} className="h-full w-full" />
        {(loading || !mapboxToken) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
            <div className="text-center p-4 max-w-md">
              <p className="text-red-500 font-medium">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error.includes("Database schema not set up") ? (
                  <>
                    Please visit{" "}
                    <a href="/setup" className="text-primary underline">
                      the setup page
                    </a>{" "}
                    to initialize your database.
                  </>
                ) : (
                  "Please check your database connection and Mapbox API key."
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected agent details */}
      {selectedAgent && (
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 shadow-lg">
          <h3 className="font-semibold text-lg">{selectedAgent.name}</h3>
          <p className="text-sm text-muted-foreground">{selectedAgent.address}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <strong>Phone:</strong> {selectedAgent.phone}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {selectedAgent.email}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
