"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Navigation, Search } from "lucide-react"
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

interface StoreWithDistance extends Store {
  distance: number
}

interface StoreLocatorWithDistanceProps {
  height?: string
}

export function StoreLocatorWithDistance({ height = "600px" }: StoreLocatorWithDistanceProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [storesWithDistance, setStoresWithDistance] = useState<StoreWithDistance[]>([])
  const [filteredStores, setFilteredStores] = useState<StoreWithDistance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStore, setSelectedStore] = useState<StoreWithDistance | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const [userAddress, setUserAddress] = useState<string | null>(null)

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
      } catch (err) {
        console.error("Error fetching stores:", err)
        setError("Failed to load store data")
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [])

  // Calculate distances when user location changes
  useEffect(() => {
    if (!userLocation || stores.length === 0) return

    const storesWithDist = stores.map((store) => {
      const [storeLng, storeLat] = store.geometry.coordinates
      const [userLng, userLat] = userLocation
      const distance = calculateDistance(userLat, userLng, storeLat, storeLng)
      return { ...store, distance }
    })

    // Sort by distance
    storesWithDist.sort((a, b) => a.distance - b.distance)
    setStoresWithDistance(storesWithDist)
    setFilteredStores(storesWithDist)
  }, [userLocation, stores])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return

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
        reverseGeocode(latitude, longitude)
      })

      // Add markers when map loads
      map.current.on("load", () => {
        // Try to get user location on load
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords
            setUserLocation([longitude, latitude])
            reverseGeocode(latitude, longitude)

            // Fly to user location
            map.current?.flyTo({
              center: [longitude, latitude],
              zoom: 10,
              essential: true,
            })
          },
          (error) => {
            console.error("Error getting user location:", error)
          },
        )
      })
    } catch (err) {
      console.error("Error initializing map:", err)
      setError("Failed to initialize map")
    }

    return () => {
      map.current?.remove()
    }
  }, [mapboxToken])

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/mapbox?operation=geocode&lat=${lat}&lng=${lng}`)
      if (!response.ok) {
        throw new Error("Failed to geocode location")
      }
      const data = await response.json()
      if (data.features && data.features.length > 0) {
        setUserAddress(data.features[0].place_name)
      }
    } catch (err) {
      console.error("Error geocoding:", err)
    }
  }

  // Add markers to map
  useEffect(() => {
    if (!map.current || filteredStores.length === 0) return

    // Clear existing markers
    const markers = document.querySelectorAll(".mapboxgl-marker")
    markers.forEach((marker) => marker.remove())

    // Create bounds to fit all markers
    const bounds = new mapboxgl.LngLatBounds()

    // Add user location marker if available
    if (userLocation) {
      const [lng, lat] = userLocation

      // Create custom marker element for user
      const userMarkerEl = document.createElement("div")
      userMarkerEl.className = "user-marker"
      userMarkerEl.style.width = "20px"
      userMarkerEl.style.height = "20px"
      userMarkerEl.style.borderRadius = "50%"
      userMarkerEl.style.backgroundColor = "#3b82f6"
      userMarkerEl.style.border = "3px solid white"
      userMarkerEl.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.5)"

      // Add user marker to map
      new mapboxgl.Marker(userMarkerEl)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<strong>Your Location</strong>${userAddress ? `<p>${userAddress}</p>` : ""}`,
          ),
        )
        .addTo(map.current)

      // Extend bounds
      bounds.extend([lng, lat])
    }

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
        ${userLocation ? `<p><strong>Distance:</strong> ${formatDistance(store.distance)}</p>` : ""}
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
    if (bounds.isEmpty()) return
    map.current.fitBounds(bounds, { padding: 50 })
  }, [filteredStores, userLocation, userAddress])

  // Format distance
  const formatDistance = (distance: number) => {
    return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setFilteredStores(storesWithDistance)
      return
    }

    const filtered = storesWithDistance.filter((store) => {
      const { name, address } = store.properties
      const query = searchQuery.toLowerCase()
      return name.toLowerCase().includes(query) || address.toLowerCase().includes(query)
    })

    setFilteredStores(filtered)
  }

  // Fly to store location
  const handleStoreClick = (store: StoreWithDistance) => {
    if (!map.current) return

    const [lng, lat] = store.geometry.coordinates
    map.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      essential: true,
    })
    setSelectedStore(store)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Find Nearest PlataPay Agents
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

            {userLocation && userAddress && (
              <div className="mb-4 p-3 bg-muted/50 rounded-md">
                <p className="text-sm font-medium">Your Location</p>
                <p className="text-xs text-muted-foreground">{userAddress}</p>
              </div>
            )}

            <div className="h-[350px] md:h-[450px] overflow-y-auto space-y-2 pr-2">
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
                      <p className="text-xs mt-1 text-primary font-medium">{formatDistance(store.distance)} away</p>
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
              {userLocation && (
                <p className="text-sm">
                  <strong>Distance:</strong> {formatDistance(selectedStore.distance)}
                </p>
              )}
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
                  <Navigation className="mr-2 h-4 w-4" />
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
