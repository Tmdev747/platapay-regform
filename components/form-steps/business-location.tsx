"use client"

import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import dynamic from "next/dynamic"

// Import Leaflet dynamically to avoid SSR issues
const MapComponent = dynamic(() => import("../map-component"), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 flex items-center justify-center">Loading map...</div>,
})

// Mock location data - in a real app, this would come from an API
const locationData = {
  regions: [
    { code: "NCR", name: "National Capital Region" },
    { code: "CAR", name: "Cordillera Administrative Region" },
    { code: "R1", name: "Region I - Ilocos Region" },
    { code: "R2", name: "Region II - Cagayan Valley" },
    { code: "R3", name: "Region III - Central Luzon" },
    { code: "R4A", name: "Region IV-A - CALABARZON" },
    { code: "R4B", name: "Region IV-B - MIMAROPA" },
    { code: "R5", name: "Region V - Bicol Region" },
    { code: "R6", name: "Region VI - Western Visayas" },
    { code: "R7", name: "Region VII - Central Visayas" },
    { code: "R8", name: "Region VIII - Eastern Visayas" },
    { code: "R9", name: "Region IX - Zamboanga Peninsula" },
    { code: "R10", name: "Region X - Northern Mindanao" },
    { code: "R11", name: "Region XI - Davao Region" },
    { code: "R12", name: "Region XII - SOCCSKSARGEN" },
    { code: "R13", name: "Region XIII - Caraga" },
    { code: "BARMM", name: "Bangsamoro Autonomous Region in Muslim Mindanao" },
  ],
  provinces: {
    NCR: [
      { code: "MNL", name: "Manila" },
      { code: "QZN", name: "Quezon City" },
      { code: "MKT", name: "Makati" },
    ],
    R4A: [
      { code: "CAV", name: "Cavite" },
      { code: "LAG", name: "Laguna" },
      { code: "BAT", name: "Batangas" },
    ],
    // Add more provinces for other regions
  },
  cities: {
    MNL: [{ code: "MNL-C", name: "Manila City" }],
    QZN: [{ code: "QZN-C", name: "Quezon City" }],
    CAV: [
      { code: "CAV-BAC", name: "Bacoor" },
      { code: "CAV-DAS", name: "Dasmariñas" },
      { code: "CAV-TAG", name: "Tagaytay" },
    ],
    // Add more cities for other provinces
  },
  barangays: {
    "CAV-BAC": [
      { code: "BAC-001", name: "Barangay 1" },
      { code: "BAC-002", name: "Barangay 2" },
      { code: "BAC-003", name: "Barangay 3" },
    ],
    // Add more barangays for other cities
  },
}

export function BusinessLocation() {
  const { register, setValue, watch } = useFormContext()
  const [showMap, setShowMap] = useState(false)
  const [provinces, setProvinces] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [barangays, setBarangays] = useState<any[]>([])

  const region = watch("locationAddress.region")
  const province = watch("locationAddress.province")
  const city = watch("locationAddress.city")
  const latitude = watch("latitude")
  const longitude = watch("longitude")

  // Update provinces when region changes
  useEffect(() => {
    if (region && locationData.provinces[region]) {
      setProvinces(locationData.provinces[region])
      setValue("locationAddress.province", "")
      setCities([])
      setBarangays([])
    } else {
      setProvinces([])
    }
  }, [region, setValue])

  // Update cities when province changes
  useEffect(() => {
    if (province && locationData.cities[province]) {
      setCities(locationData.cities[province])
      setValue("locationAddress.city", "")
      setBarangays([])
    } else {
      setCities([])
    }
  }, [province, setValue])

  // Update barangays when city changes
  useEffect(() => {
    if (city && locationData.barangays[city]) {
      setBarangays(locationData.barangays[city])
      setValue("locationAddress.brgy", "")
    } else {
      setBarangays([])
    }
  }, [city, setValue])

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", position.coords.latitude.toFixed(6))
          setValue("longitude", position.coords.longitude.toFixed(6))
        },
        (error) => {
          console.error("Error getting location:", error)
          setShowMap(true)
          // Default to Manila if location access is denied
          setValue("latitude", "14.5995")
          setValue("longitude", "120.9842")
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
      setShowMap(true)
      // Default to Manila
      setValue("latitude", "14.5995")
      setValue("longitude", "120.9842")
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    setValue("latitude", lat.toFixed(6))
    setValue("longitude", lng.toFixed(6))
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-[#4A2A82]">📍 Business Location</h2>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proposedLocation">
          Proposed Business Location for approval <span className="text-red-500">*</span>
        </Label>
        <Input id="proposedLocation" {...register("proposedLocation")} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="region">
            Region <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(value) => setValue("locationAddress.region", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              {locationData.regions.map((region) => (
                <SelectItem key={region.code} value={region.code}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">
            Province <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) => setValue("locationAddress.province", value)}
            disabled={provinces.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Province" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.code} value={province.code}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">
            City/Municipality <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(value) => setValue("locationAddress.city", value)} disabled={cities.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Select City/Municipality" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.code} value={city.code}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="barangay">
            Barangay <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(value) => setValue("locationAddress.brgy", value)} disabled={barangays.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Select Barangay" />
            </SelectTrigger>
            <SelectContent>
              {barangays.map((barangay) => (
                <SelectItem key={barangay.code} value={barangay.code}>
                  {barangay.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="street">
            Street Address <span className="text-red-500">*</span>
          </Label>
          <Input id="street" {...register("locationAddress.street")} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">
            Building/House Number <span className="text-red-500">*</span>
          </Label>
          <Input id="number" {...register("locationAddress.number")} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zipCode">
            Zip Code <span className="text-red-500">*</span>
          </Label>
          <Input id="zipCode" {...register("locationAddress.zipCode")} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="landmark">Nearest Landmark</Label>
          <Input id="landmark" {...register("landmark")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Location Coordinates <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center mb-2">
          <button
            type="button"
            onClick={getLocation}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-[#4A2A82] hover:bg-[#3D2268] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A2A82]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Get My Location
          </button>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A2A82]"
          >
            {showMap ? "Hide Map" : "Show Map"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" {...register("latitude")} readOnly className="bg-gray-50" />
          </div>

          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" {...register("longitude")} readOnly className="bg-gray-50" />
          </div>
        </div>

        {showMap && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              If you denied location access or want to set location manually, please use the map below:
            </p>
            <div className="h-[300px] border border-gray-300 rounded-md overflow-hidden">
              <MapComponent
                initialLat={latitude ? Number.parseFloat(latitude) : 14.5995}
                initialLng={longitude ? Number.parseFloat(longitude) : 120.9842}
                onLocationSelect={handleMapClick}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Drag the marker to set your exact location</p>
          </div>
        )}
      </div>
    </div>
  )
}
