"use client"

import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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

export function PersonalInfo() {
  const { register, watch, setValue } = useFormContext()
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

  const everCharged = watch("everCharged")
  const declaredBankruptcy = watch("declaredBankruptcy")
  const firstTimeApplying = watch("firstTimeApplying")
  const incomeSource = watch("incomeSource")
  const region = watch("address.region")
  const province = watch("address.province")
  const city = watch("address.city")
  const municipality = watch("address.municipality")

  const needsDetails = everCharged === "yes" || declaredBankruptcy === "yes" || firstTimeApplying === "no"

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
      setValue("address.province", "")
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
      setValue("address.city", "")
      setValue("address.municipality", "")
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
      setValue("address.brgy", "")
    } else {
      setBarangays([])
    }
  }, [city, municipality, locationType, setValue])

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-[#4A2A82]">🧍 Personal Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input id="firstName" {...register("firstName")} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input id="middleName" {...register("middleName")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input id="lastName" {...register("lastName")} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nationality">
            Nationality <span className="text-red-500">*</span>
          </Label>
          <Input id="nationality" {...register("nationality")} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="placeOfBirth">
            Place of Birth <span className="text-red-500">*</span>
          </Label>
          <Input id="placeOfBirth" {...register("placeOfBirth")} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="civilStatus">
            Civil Status <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(value) => setValue("civilStatus", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
              <SelectItem value="separated">Separated</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Gender <span className="text-red-500">*</span>
        </Label>
        <RadioGroup defaultValue="male" onValueChange={(value) => setValue("gender", value)}>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="gender-male" />
              <Label htmlFor="gender-male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="gender-female" />
              <Label htmlFor="gender-female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="gender-other" />
              <Label htmlFor="gender-other">Other</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input id="email" type="email" {...register("email")} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input id="phoneNumber" {...register("phoneNumber")} placeholder="+63" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="idType">
            Valid ID Type <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(value) => setValue("idType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select ID Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="drivers_license">Driver's License</SelectItem>
              <SelectItem value="sss">SSS ID</SelectItem>
              <SelectItem value="gsis">GSIS ID</SelectItem>
              <SelectItem value="philhealth">PhilHealth ID</SelectItem>
              <SelectItem value="voters_id">Voter's ID</SelectItem>
              <SelectItem value="postal_id">Postal ID</SelectItem>
              <SelectItem value="national_id">National ID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="idNumber">
            ID Number <span className="text-red-500">*</span>
          </Label>
          <Input id="idNumber" {...register("idNumber")} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Home Address</Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="region">
              Region <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => setValue("address.region", value)} disabled={loading.regions}>
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
              onValueChange={(value) => setValue("address.province", value)}
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

        <div className="space-y-2 mt-2">
          <Label>
            City/Municipality Type <span className="text-red-500">*</span>
          </Label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="homeLocationType"
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
                name="homeLocationType"
                value="municipality"
                checked={locationType === "municipality"}
                onChange={() => setLocationType("municipality")}
                className="h-4 w-4 text-[#58317A]"
              />
              <span>Municipality</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {locationType === "city" ? (
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("address.city", value)}
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
                onValueChange={(value) => setValue("address.municipality", value)}
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
              onValueChange={(value) => setValue("address.brgy", value)}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Input placeholder="Street" {...register("address.street")} />
          <Input placeholder="No." {...register("address.number")} />
        </div>

        <Input placeholder="Zip Code" {...register("address.zipCode")} className="mt-2" />
        <Input placeholder="Country" defaultValue="Philippines" {...register("address.country")} className="mt-2" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tinNumber">TIN Number</Label>
        <Input id="tinNumber" {...register("tinNumber")} />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Is this your first time applying for PlataPay business partnership?</Label>
          <RadioGroup defaultValue="yes" onValueChange={(value) => setValue("firstTimeApplying", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="firstTime-yes" />
              <Label htmlFor="firstTime-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="firstTime-no" />
              <Label htmlFor="firstTime-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Have you ever been charged of anything other than minor traffic violations?</Label>
          <RadioGroup defaultValue="no" onValueChange={(value) => setValue("everCharged", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="charged-yes" />
              <Label htmlFor="charged-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="charged-no" />
              <Label htmlFor="charged-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Have you ever declared personal bankruptcy?</Label>
          <RadioGroup defaultValue="no" onValueChange={(value) => setValue("declaredBankruptcy", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="bankruptcy-yes" />
              <Label htmlFor="bankruptcy-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="bankruptcy-no" />
              <Label htmlFor="bankruptcy-no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {needsDetails && (
        <div className="space-y-2">
          <Label htmlFor="details">
            If you answered Yes to any of the above, please give details and inclusive dates
          </Label>
          <Textarea id="details" {...register("details")} className="min-h-[100px]" />
        </div>
      )}

      <div className="space-y-2">
        <Label>What is your main source of income?</Label>
        <RadioGroup
          defaultValue="employment"
          onValueChange={(value) => register("incomeSource").onChange({ target: { value } })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="employment" id="income-employment" />
            <Label htmlFor="income-employment">Employment</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="business" id="income-business" />
            <Label htmlFor="income-business">Business</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="income-other" />
            <Label htmlFor="income-other">Other</Label>
          </div>
        </RadioGroup>
      </div>

      {incomeSource === "employment" && (
        <div className="space-y-2">
          <Label htmlFor="employmentCompany">
            If you are employed, kindly state the company or organization you are working for
          </Label>
          <Input id="employmentCompany" {...register("employmentCompany")} />
        </div>
      )}
    </div>
  )
}
