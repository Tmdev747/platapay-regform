"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Search } from "lucide-react"
import { calculateDistance } from "@/lib/geo-utils"

interface Store {
  id: string
  properties: {
    name: string
    address: string
    phone: string
    email: string
  }
  geometry: {
    coordinates: [number, number] // [longitude, latitude]
  }
}

interface StoreLocatorProps {
  height?: string
}

export function StoreLocator({ height = "600px" }: StoreLocatorProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)

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

  // Fetch stores data
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/agents/geojson")
        if (!response.ok) {
          throw new Error("Failed to fetch stores data")
        }
        const data = await response.json()
        setStores(data.features)
        setFilteredStores(data.features)
      } catch (err) {
        console.error("Error fetching stores:", err)
        setError("Failed to load store data")
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken || loading) return

    try {
      mapboxgl.accessToken = mapboxToken

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [121.774, 12.8797], // Philippines
        zoom: 5,
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

      // Add geolocate control
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
      map.current.addControl(geolocateControl)

      // Listen for geolocate events
      geolocateControl.on("geolocate", (e: any) => {
        const { longitude, latitude } = e.coords
        setUserLocation([longitude, latitude])
      })

      // Add markers when map loads
      map.current.on("load", () => {
        addMarkersToMap()
      })
    } catch (err) {
      console.error("Error initializing map:", err)
      setError("Failed to initialize map")
    }

    return () => {
      map.current?.remove()
    }
  }, [mapboxToken, loading])

  // Add markers to map
  const addMarkersToMap = () => {
    if (!map.current || filteredStores.length === 0) return

    // Create bounds to fit all markers
    const bounds = new mapboxgl.LngLatBounds()

    // Add markers for each store
    filteredStores.forEach((store) => {
      const [lng, lat] = store.geometry.coordinates

      // Create custom marker element
      const markerEl = document.createElement("div")
      markerEl.className = "store-marker"
      markerEl.style.backgroundImage = `url(/icons/map-pin.svg)`
      markerEl.style.width = "32px"
      markerEl.style.height = "32px"
      markerEl.style.backgroundSize = "cover"
      markerEl.style.cursor = "pointer"

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <strong>${store.properties.name}</strong>
        <p>${store.properties.address}</p>
      `)

      // Add marker to map
      new mapboxgl.Marker(markerEl).setLngLat([lng, lat]).setPopup(popup).addTo(map.current!)

      // Add click event to marker
      markerEl.addEventListener("click", () => {
        setSelectedStore(store)
      })

      // Extend bounds
      bounds.extend([lng, lat])
    })

    // Fit map to bounds
    map.current.fitBounds(bounds, { padding: 50 })
  }

  // Update markers when filtered stores change
  useEffect(() => {
    if (!map.current || loading) return

    // Clear existing markers
    const markers = document.querySelectorAll(".mapboxgl-marker")
    markers.forEach((marker) => marker.remove())

    // Add new markers
    addMarkersToMap()
  }, [filteredStores])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setFilteredStores(stores)
      return
    }

    const filtered = stores.filter((store) => {
      const { name, address } = store.properties
      const query = searchQuery.toLowerCase()
      return name.toLowerCase().includes(query) || address.toLowerCase().includes(query)
    })

    setFilteredStores(filtered)
  }

  // Fly to store location
  const handleStoreClick = (store: Store) => {
    if (!map.current) return

    const [lng, lat] = store.geometry.coordinates
    map.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      essential: true,
    })
    setSelectedStore(store)
  }

  // Calculate distance from user
  const getDistance = (coordinates: [number, number]) => {
    if (!userLocation) return null

    const [storeLng, storeLat] = coordinates
    const [userLng, userLat] = userLocation
    const distance = calculateDistance(userLat, userLng, storeLat, storeLng)

    return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Find PlataPay Agents
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="p-4 border-r border-b md:border-b-0">
            <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
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

            <div className="h-[400px] md:h-[500px] overflow-y-auto space-y-2 pr-2">
              {filteredStores.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No agents found</p>
              ) : (
                filteredStores.map((store) => (
                  <div
                    key={store.id}
                    className={`p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedStore?.id === store.id ? "bg-muted border-primary" : ""
                    }`}
                    onClick={() => handleStoreClick(store)}
                  >
                    <h3 className="font-medium">{store.properties.name}</h3>
                    <p className="text-sm text-muted-foreground">{store.properties.address}</p>
                    {userLocation && (
                      <p className="text-xs mt-1 text-primary">{getDistance(store.geometry.coordinates)} away</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Map */}
          <div className="relative col-span-1 md:col-span-2 lg:col-span-3" style={{ height }}>
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
                    Please check your database connection and Mapbox API key.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected store details */}
        {selectedStore && (
          <div className="p-4 border-t">
            <h3 className="font-semibold text-lg">{selectedStore.properties.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedStore.properties.address}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                <strong>Phone:</strong> {selectedStore.properties.phone}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {selectedStore.properties.email}
              </p>
            </div>
            {userLocation && (
              <div className="mt-4">
                <Button
                  onClick={() => {
                    const [lng, lat] = selectedStore.geometry.coordinates
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank")
                  }}
                  className="w-full sm:w-auto"
                >
                  Get Directions
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
