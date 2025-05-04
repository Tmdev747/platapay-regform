"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { createBrowserClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

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
  status: "pending" | "approved" | "rejected"
}

interface AgentMapProps {
  height?: string
  showSearch?: boolean
  initialZoom?: number
}

export function AgentMap({ height = "400px", showSearch = true, initialZoom = 5 }: AgentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)

  // Center of Philippines
  const [lng, setLng] = useState(121.774)
  const [lat, setLat] = useState(12.8797)
  const [zoom, setZoom] = useState(initialZoom)

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
          setError("The agents table doesn't exist yet. Please set up your database schema first.")
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

      // Update state when map moves
      map.current.on("move", () => {
        if (map.current) {
          setLng(Number.parseFloat(map.current.getCenter().lng.toFixed(4)))
          setLat(Number.parseFloat(map.current.getCenter().lat.toFixed(4)))
          setZoom(Number.parseFloat(map.current.getZoom().toFixed(2)))
        }
      })

      // Fetch agents once map is loaded
      map.current.on("load", fetchAgents)
    } catch (err) {
      console.error("Error initializing map:", err)
      setError("Failed to initialize map. Please check your Mapbox API key.")
    }

    // Clean up on unmount
    return () => {
      map.current?.remove()
    }
  }, [lng, lat, zoom, mapboxToken])

  // Add markers for agents
  useEffect(() => {
    if (!map.current || loading || agents.length === 0) return

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove())
    markers.current = []

    // Filter agents if search query exists
    const filteredAgents = searchQuery
      ? agents.filter(
          (agent) =>
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.address.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : agents

    // Add markers for each agent
    filteredAgents.forEach((agent) => {
      // Create custom marker element
      const markerEl = document.createElement("div")
      markerEl.className = "agent-marker"
      markerEl.style.backgroundImage = `url(/icons/map-pin.svg)`
      markerEl.style.width = "32px"
      markerEl.style.height = "32px"
      markerEl.style.backgroundSize = "cover"
      markerEl.style.cursor = "pointer"

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <strong>${agent.name}</strong>
        <p>${agent.address}</p>
      `)

      // Add marker to map
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([agent.location.longitude, agent.location.latitude])
        .setPopup(popup)
        .addTo(map.current!)

      // Add click event to marker
      markerEl.addEventListener("click", () => {
        setSelectedAgent(agent)
      })

      // Store marker reference for cleanup
      markers.current.push(marker)
    })

    // Fit map to markers if there are any
    if (filteredAgents.length > 0 && filteredAgents.length !== agents.length) {
      const bounds = new mapboxgl.LngLatBounds()
      filteredAgents.forEach((agent) => {
        bounds.extend([agent.location.longitude, agent.location.latitude])
      })
      map.current.fitBounds(bounds, { padding: 50 })
    }
  }, [agents, loading, searchQuery])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The search effect is handled by the useEffect above
  }

  // Fly to agent location
  const flyToAgent = (agent: Agent) => {
    if (!map.current) return

    map.current.flyTo({
      center: [agent.location.longitude, agent.location.latitude],
      zoom: 14,
      essential: true,
    })
    setSelectedAgent(agent)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          PlataPay Agent Locations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSearch && (
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              placeholder="Search by name or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        )}

        {error ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="text-center p-4 max-w-md">
              <p className="text-red-500 font-medium">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error.includes("database schema") ? (
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
        ) : (
          <div className="relative" style={{ height }}>
            <div ref={mapContainer} className="h-full w-full rounded-md overflow-hidden" />
            {(loading || !mapboxToken) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Map coordinates display */}
            <div className="absolute bottom-0 left-0 bg-white/80 dark:bg-gray-900/80 px-2 py-1 text-xs rounded-tr-md">
              Lng: {lng} | Lat: {lat} | Zoom: {zoom}
            </div>
          </div>
        )}

        {/* Selected agent details */}
        {selectedAgent && (
          <div className="mt-4 p-4 border rounded-md bg-muted/20">
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

        {/* Agent list for mobile */}
        {agents.length > 0 && (
          <div className="md:hidden mt-4">
            <h3 className="font-semibold mb-2">Nearby Agents</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-2 border rounded-md cursor-pointer hover:bg-muted/50"
                  onClick={() => flyToAgent(agent)}
                >
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.address}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
