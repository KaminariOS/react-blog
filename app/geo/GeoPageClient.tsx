'use client'

import { useEffect, useState } from 'react'
import DeviceLocation from '@/components/DeviceLocation'

export default function GeoPageClient() {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <div className="space-y-8 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Geolocation Demo
        </h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          Click the button below to ask your browser for permission and we will display the returned
          coordinates.
        </p>
      </div>
      {hasMounted ? (
        <DeviceLocation />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
          Preparing geolocation widget…
        </div>
      )}
    </div>
  )
}
