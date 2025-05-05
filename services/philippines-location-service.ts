// This service fetches Philippines location data from the PhilGIS API

const API_BASE_URL = "https://psgc.gitlab.io/api"

export interface Region {
  code: string
  name: string
  regionName?: string
}

export interface Province {
  code: string
  name: string
  regionCode: string
}

export interface City {
  code: string
  name: string
  provinceCode: string
  cityClass?: string
}

export interface Municipality {
  code: string
  name: string
  provinceCode: string
}

export interface Barangay {
  code: string
  name: string
  municipalityCode?: string
  cityCode?: string
}

export async function getRegions(): Promise<Region[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/regions`)
    if (!response.ok) throw new Error("Failed to fetch regions")
    const data = await response.json()
    return data.map((region: any) => ({
      code: region.code,
      name: region.name,
      regionName: region.regionName,
    }))
  } catch (error) {
    console.error("Error fetching regions:", error)
    return []
  }
}

export async function getProvincesByRegion(regionCode: string): Promise<Province[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/regions/${regionCode}/provinces`)
    if (!response.ok) throw new Error(`Failed to fetch provinces for region ${regionCode}`)
    const data = await response.json()
    return data.map((province: any) => ({
      code: province.code,
      name: province.name,
      regionCode: province.regionCode,
    }))
  } catch (error) {
    console.error(`Error fetching provinces for region ${regionCode}:`, error)
    return []
  }
}

export async function getCitiesByProvince(provinceCode: string): Promise<City[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/provinces/${provinceCode}/cities`)
    if (!response.ok) throw new Error(`Failed to fetch cities for province ${provinceCode}`)
    const data = await response.json()
    return data.map((city: any) => ({
      code: city.code,
      name: city.name,
      provinceCode: city.provinceCode,
      cityClass: city.cityClass,
    }))
  } catch (error) {
    console.error(`Error fetching cities for province ${provinceCode}:`, error)
    return []
  }
}

export async function getMunicipalitiesByProvince(provinceCode: string): Promise<Municipality[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/provinces/${provinceCode}/municipalities`)
    if (!response.ok) throw new Error(`Failed to fetch municipalities for province ${provinceCode}`)
    const data = await response.json()
    return data.map((municipality: any) => ({
      code: municipality.code,
      name: municipality.name,
      provinceCode: municipality.provinceCode,
    }))
  } catch (error) {
    console.error(`Error fetching municipalities for province ${provinceCode}:`, error)
    return []
  }
}

export async function getBarangaysByCity(cityCode: string): Promise<Barangay[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cities/${cityCode}/barangays`)
    if (!response.ok) throw new Error(`Failed to fetch barangays for city ${cityCode}`)
    const data = await response.json()
    return data.map((barangay: any) => ({
      code: barangay.code,
      name: barangay.name,
      cityCode: barangay.cityCode,
    }))
  } catch (error) {
    console.error(`Error fetching barangays for city ${cityCode}:`, error)
    return []
  }
}

export async function getBarangaysByMunicipality(municipalityCode: string): Promise<Barangay[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/municipalities/${municipalityCode}/barangays`)
    if (!response.ok) throw new Error(`Failed to fetch barangays for municipality ${municipalityCode}`)
    const data = await response.json()
    return data.map((barangay: any) => ({
      code: barangay.code,
      name: barangay.name,
      municipalityCode: barangay.municipalityCode,
    }))
  } catch (error) {
    console.error(`Error fetching barangays for municipality ${municipalityCode}:`, error)
    return []
  }
}
