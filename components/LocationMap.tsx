'use client'

import { useEffect, useMemo, useRef } from 'react'

import 'leaflet/dist/leaflet.css'

import L, { Circle, CircleMarker, Map as LeafletMap } from 'leaflet'

type LocationMapProps = {
  latitude: number
  longitude: number
  accuracy?: number | null
}

export default function LocationMap({ latitude, longitude, accuracy }: LocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<CircleMarker | null>(null)
  const accuracyCircleRef = useRef<Circle | null>(null)

  const center = useMemo(() => [latitude, longitude] as L.LatLngTuple, [latitude, longitude])
  const fallbackAccuracy = useMemo(
    () => (accuracy && accuracy > 0 ? Math.min(accuracy, 5000) : 100),
    [accuracy]
  )

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 13,
      scrollWheelZoom: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
      accuracyCircleRef.current = null
    }
  }, [center])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    map.setView(center)

    if (markerRef.current) {
      markerRef.current.setLatLng(center)
    } else {
      markerRef.current = L.circleMarker(center, {
        radius: 10,
        color: '#06b6d4',
        fillColor: '#22d3ee',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map)
    }

    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng(center)
      accuracyCircleRef.current.setRadius(fallbackAccuracy)
    } else {
      accuracyCircleRef.current = L.circle(center, {
        radius: fallbackAccuracy,
        color: '#67e8f9',
        fillColor: '#67e8f9',
        fillOpacity: 0.15,
        weight: 1,
      }).addTo(map)
    }
  }, [center, fallbackAccuracy])

  return <div ref={mapContainerRef} className="h-72 w-full rounded-lg" />
}
