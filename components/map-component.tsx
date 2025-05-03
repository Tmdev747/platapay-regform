"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"

interface MapComponentProps {
  initialLat: number
  initialLng: number
  onLocationSelect: (lat: number, lng: number) => void
}

export default function MapComponent({ initialLat, initialLng, onLocationSelect }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<L.Map | null>(null)
  const [marker, setMarker] = useState<L.Marker | null>(null)

  useEffect(() => {
    // Make sure Leaflet is available in the browser
    if (typeof window !== "undefined" && mapRef.current && !map) {
      // Initialize the map
      const mapInstance = L.map(mapRef.current).setView([initialLat, initialLng], 15)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance)

      // Add a draggable marker
      const markerInstance = L.marker([initialLat, initialLng], {
        draggable: true,
      }).addTo(mapInstance)

      // Update coordinates when marker is dragged
      markerInstance.on("dragend", () => {
        const position = markerInstance.getLatLng()
        onLocationSelect(position.lat, position.lng)
      })

      // Update coordinates when map is clicked
      mapInstance.on("click", (e) => {
        markerInstance.setLatLng(e.latlng)
        onLocationSelect(e.latlng.lat, e.latlng.lng)
      })

      setMap(mapInstance)
      setMarker(markerInstance)

      // Clean up on unmount
      return () => {
        mapInstance.remove()
      }
    }
  }, [initialLat, initialLng, onLocationSelect, map])

  // Update marker position if initialLat/initialLng props change
  useEffect(() => {
    if (map && marker && (marker.getLatLng().lat !== initialLat || marker.getLatLng().lng !== initialLng)) {
      marker.setLatLng([initialLat, initialLng])
      map.setView([initialLat, initialLng], map.getZoom())
    }
  }, [map, marker, initialLat, initialLng])

  return <div ref={mapRef} className="h-full w-full" />
}
