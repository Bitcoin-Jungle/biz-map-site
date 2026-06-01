import { useState, useCallback } from "react"

export type LocationStatus = "idle" | "requesting" | "granted" | "denied"

export interface UserCoords {
  lat: number
  lon: number
}

export interface UseUserLocationResult {
  coords: UserCoords | null
  status: LocationStatus
  request: () => void
}

export function useUserLocation(): UseUserLocationResult {
  const [coords, setCoords] = useState<UserCoords | null>(null)
  const [status, setStatus] = useState<LocationStatus>("idle")

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("denied")
      return
    }
    setStatus("requesting")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setStatus("granted")
      },
      () => {
        setStatus("denied")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [])

  return { coords, status, request }
}
