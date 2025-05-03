"use client"

import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import dynamic from "next/dynamic"
import {
  getRegions,
  getProvincesByRegion,
  getCitiesByProvince,
  getMunicipalitiesByProvince,
  getBarangaysByCity,
  getBarangaysByMunicipality,
  type Region,
  type Province,
  type City,
  type Municipality,
  type Barangay,
} from "@/services/philippines-location-service"

// Import Leaflet dynamically to avoid SSR issues
const MapComponent = dynamic(() => import("../map-component"), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 flex items-center justify-center">Loading map...</div>,
})

export function BusinessLocation() {
  const { register, setValue, watch } = useFormContext()
  const [showMap, setShowMap] = useState(false)
  const [regions, setRegions] = useState<Region[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [loading, setLoading] = useState({
    regions: false,
    provinces: false,
    cities: false,
    municipalities: false,
    barangays: false,
  })
  const [locationType, setLocationType] = useState<"city" | "municipality">("city")

  const region = watch("locationAddress.region")
  const province = watch("locationAddress.province")
  const city = watch("locationAddress.city")
  const municipality = watch("locationAddress.municipality")
  const latitude = watch("latitude")
  const longitude = watch("longitude")

  // Fetch regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      setLoading((prev) => ({ ...prev, regions: true }))
      const data = await getRegions()
      setRegions(data)
      setLoading((prev) => ({ ...prev, regions: false }))
    }

    fetchRegions()
  }, [])

  // Update provinces when region changes
  useEffect(() => {
    if (region) {
      const fetchProvinces = async () => {
        setLoading((prev) => ({ ...prev, provinces: true }))
        const data = await getProvincesByRegion(region)
        setProvinces(data)
        setLoading((prev) => ({ ...prev, provinces: false }))
      }

      fetchProvinces()
      setValue("locationAddress.province", "")
      setCities([])
      setMunicipalities([])
      setBarangays([])
    } else {
      setProvinces([])
    }
  }, [region, setValue])

  // Update cities and municipalities when province changes
  useEffect(() => {
    if (province) {
      const fetchCities = async () => {
        setLoading((prev) => ({ ...prev, cities: true }))
        const citiesData = await getCitiesByProvince(province)
        setCities(citiesData)
        setLoading((prev) => ({ ...prev, cities: false }))
      }

      const fetchMunicipalities = async () => {
        setLoading((prev) => ({ ...prev, municipalities: true }))
        const municipalitiesData = await getMunicipalitiesByProvince(province)
        setMunicipalities(municipalitiesData)
        setLoading((prev) => ({ ...prev, municipalities: false }))
      }

      fetchCities()
      fetchMunicipalities()
      setValue("locationAddress.city", "")
      setValue("locationAddress.municipality", "")
      setBarangays([])
    } else {
      setCities([])
      setMunicipalities([])
    }
  }, [province, setValue])

  // Update barangays when city or municipality changes
  useEffect(() => {
    const fetchBarangays = async () => {
      setLoading((prev) => ({ ...prev, barangays: true }))
      let data: Barangay[] = []

      if (locationType === "city" && city) {
        data = await getBarangaysByCity(city)
      } else if (locationType === "municipality" && municipality) {
        data = await getBarangaysByMunicipality(municipality)
      }

      setBarangays(data)
      setLoading((prev) => ({ ...prev, barangays: false }))
    }

    if ((locationType === "city" && city) || (locationType === "municipality" && municipality)) {
      fetchBarangays()
      setValue("locationAddress.brgy", "")
    } else {
      setBarangays([])
    }
  }, [city, municipality, locationType, setValue])

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
          <Select onValueChange={(value) => setValue("locationAddress.region", value)} disabled={loading.regions}>
            <SelectTrigger>
              <SelectValue placeholder={loading.regions ? "Loading regions..." : "Select Region"} />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
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
            disabled={provinces.length === 0 || loading.provinces}
          >
            <SelectTrigger>
              <SelectValue placeholder={loading.provinces ? "Loading provinces..." : "Select Province"} />
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

      <div className="space-y-2">
        <Label>
          City/Municipality Type <span className="text-red-500">*</span>
        </Label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="locationType"
              value="city"
              checked={locationType === "city"}
              onChange={() => setLocationType("city")}
              className="h-4 w-4 text-[#58317A]"
            />
            <span>City</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="locationType"
              value="municipality"
              checked={locationType === "municipality"}
              onChange={() => setLocationType("municipality")}
              className="h-4 w-4 text-[#58317A]"
            />
            <span>Municipality</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locationType === "city" ? (
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("locationAddress.city", value)}
              disabled={cities.length === 0 || loading.cities}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading.cities ? "Loading cities..." : "Select City"} />
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
        ) : (
          <div className="space-y-2">
            <Label htmlFor="municipality">
              Municipality <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("locationAddress.municipality", value)}
              disabled={municipalities.length === 0 || loading.municipalities}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loading.municipalities ? "Loading municipalities..." : "Select Municipality"}
                />
              </SelectTrigger>
              <SelectContent>
                {municipalities.map((municipality) => (
                  <SelectItem key={municipality.code} value={municipality.code}>
                    {municipality.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="barangay">
            Barangay <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) => setValue("locationAddress.brgy", value)}
            disabled={barangays.length === 0 || loading.barangays}
          >
            <SelectTrigger>
              <SelectValue placeholder={loading.barangays ? "Loading barangays..." : "Select Barangay"} />
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
