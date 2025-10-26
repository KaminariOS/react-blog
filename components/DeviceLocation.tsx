'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGeolocated } from 'react-geolocated'

const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      Preparing map…
    </div>
  ),
})

export default function DeviceLocation() {
  const [hasRequested, setHasRequested] = useState(false)
  const [isRequestInFlight, setIsRequestInFlight] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)
  const [locationLabel, setLocationLabel] = useState<string | null>(null)
  const [isFetchingLocationLabel, setIsFetchingLocationLabel] = useState(false)
  const [locationLabelError, setLocationLabelError] = useState<string | null>(null)
  const lastFetchedPosition = useRef<string | null>(null)

  const {
    coords,
    timestamp,
    isGeolocationAvailable,
    isGeolocationEnabled,
    positionError,
    getPosition,
  } = useGeolocated({
    suppressLocationOnMount: true,
    positionOptions: {
      enableHighAccuracy: false,
    },
  })

  useEffect(() => {
    if (coords || positionError) {
      setIsRequestInFlight(false)
    }
  }, [coords, positionError])

  useEffect(() => {
    if (!coords) {
      setLocationLabel(null)
      setLocationLabelError(null)
      setIsFetchingLocationLabel(false)
      lastFetchedPosition.current = null
      return
    }

    const key = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`
    if (key === lastFetchedPosition.current) {
      return
    }

    const controller = new AbortController()
    let isActive = true
    setIsFetchingLocationLabel(true)
    setLocationLabel(null)
    setLocationLabelError(null)
    lastFetchedPosition.current = key

    const params = new URLSearchParams({
      latitude: coords.latitude.toString(),
      longitude: coords.longitude.toString(),
      localityLanguage: 'en',
    })

    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Reverse geocode failed (${response.status})`)
        }
        return response.json()
      })
      .then((data) => {
        if (!isActive) return
        const parts = [
          data.city || data.locality || data.localityInfo?.administrative?.[0]?.name,
          data.principalSubdivision,
          data.countryName,
        ].filter(Boolean)

        if (!parts.length) {
          setLocationLabel('Location name unavailable for these coordinates.')
        } else {
          setLocationLabel(parts.join(', '))
        }
      })
      .catch((error) => {
        if (!isActive || controller.signal.aborted) return
        setLocationLabelError(
          error instanceof Error ? error.message : 'Reverse geocoding request failed.'
        )
      })
      .finally(() => {
        if (!isActive) return
        setIsFetchingLocationLabel(false)
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [coords])

  const requestLocation = useCallback(() => {
    setManualError(null)
    setHasRequested(true)

    if (!isGeolocationAvailable) {
      setManualError('Geolocation is not supported by this browser.')
      return
    }

    setIsRequestInFlight(true)
    try {
      getPosition()
    } catch (error) {
      setIsRequestInFlight(false)
      setManualError(error instanceof Error ? error.message : 'Unable to request location.')
    }
  }, [getPosition, isGeolocationAvailable])

  const formattedTimestamp = useMemo(() => {
    if (!timestamp) {
      return null
    }

    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return null
    }
  }, [timestamp])

  const statusMessage = useMemo(() => {
    if (manualError) {
      return manualError
    }

    if (!isGeolocationAvailable) {
      return 'Geolocation is not supported by this browser.'
    }

    if (!isGeolocationEnabled && hasRequested && !positionError && !isRequestInFlight) {
      return 'Location access appears to be disabled. Check your browser permissions.'
    }

    if (positionError) {
      return positionError.message
    }

    if (isRequestInFlight) {
      return 'Requesting your location…'
    }

    if (!coords && hasRequested) {
      return 'Waiting for location details…'
    }

    return null
  }, [
    manualError,
    isGeolocationAvailable,
    isGeolocationEnabled,
    hasRequested,
    positionError,
    isRequestInFlight,
    coords,
  ])

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Share your location
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            We use the browser&apos;s Geolocation API to display your approximate position along
            with a reverse-geocoded place name. Coordinate lookups go straight to BigDataCloud,
            which does not link the location data to identifiable individuals.
          </p>
        </div>
        <button
          type="button"
          onClick={requestLocation}
          className="bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 disabled:bg-primary-300 inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed dark:focus:ring-offset-gray-900"
          disabled={isRequestInFlight}
        >
          {isRequestInFlight ? 'Requesting…' : 'Show my location'}
        </button>
      </div>

      {statusMessage && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{statusMessage}</p>
      )}

      {coords && (
        <div className="mt-6 space-y-6">
          <dl className="grid grid-cols-1 gap-4 text-sm text-gray-900 sm:grid-cols-2 dark:text-gray-100">
            <div className="rounded-md border border-gray-200 p-4 sm:col-span-2 dark:border-gray-700">
              <dt className="font-medium text-gray-700 dark:text-gray-300">Location</dt>
              <dd className="mt-1 text-base">
                {isFetchingLocationLabel && !locationLabel ? (
                  <span className="text-gray-500 dark:text-gray-400">Resolving location…</span>
                ) : locationLabelError ? (
                  <span className="text-red-600 dark:text-red-400">{locationLabelError}</span>
                ) : (
                  (locationLabel ?? 'Waiting for location details…')
                )}
              </dd>
            </div>
            <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
              <dt className="font-medium text-gray-700 dark:text-gray-300">Latitude</dt>
              <dd className="mt-1 font-mono text-base">{coords.latitude.toFixed(2)}</dd>
            </div>
            <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
              <dt className="font-medium text-gray-700 dark:text-gray-300">Longitude</dt>
              <dd className="mt-1 font-mono text-base">{coords.longitude.toFixed(2)}</dd>
            </div>

            {coords.altitude != null && (
              <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                <dt className="font-medium text-gray-700 dark:text-gray-300">Altitude</dt>
                <dd className="mt-1 font-mono text-base">
                  {Math.round(coords.altitude)} meters{' '}
                  {coords.altitudeAccuracy != null
                    ? `(±${Math.round(coords.altitudeAccuracy)} m)`
                    : ''}
                </dd>
              </div>
            )}

            {formattedTimestamp && (
              <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                <dt className="font-medium text-gray-700 dark:text-gray-300">Last updated</dt>
                <dd className="mt-1 font-mono text-base">{formattedTimestamp}</dd>
              </div>
            )}
          </dl>
          <LocationMap
            latitude={coords.latitude}
            longitude={coords.longitude}
            accuracy={coords.accuracy}
          />
        </div>
      )}
    </section>
  )
}
