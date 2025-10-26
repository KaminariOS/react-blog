'use client'

import 'leaflet/dist/leaflet.css'

import { Circle, CircleMarker, MapContainer, TileLayer } from 'react-leaflet'

type LocationMapProps = {
  latitude: number
  longitude: number
  accuracy?: number | null
}

export default function LocationMap({ latitude, longitude, accuracy }: LocationMapProps) {
  const center: [number, number] = [latitude, longitude]
  const fallbackAccuracy = accuracy && accuracy > 0 ? Math.min(accuracy, 5000) : 100

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-lg"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <CircleMarker center={center} radius={10} pathOptions={{ color: '#06b6d4', weight: 2 }} />
      <Circle
        center={center}
        radius={fallbackAccuracy}
        pathOptions={{ color: '#67e8f9', opacity: 0.4 }}
      />
    </MapContainer>
  )
}
