import { Metadata } from 'next'
import GeoPageClient from './GeoPageClient'

export const metadata: Metadata = {
  title: 'Geo Demo',
  description: 'Use your browser to share your approximate location data.',
}

export default function GeoPage() {
  return <GeoPageClient />
}
