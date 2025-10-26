// Temporary augmentation until react-leaflet exposes full MapContainer props in its types.
declare module 'react-leaflet' {
  interface MapContainerProps {
    center?: [number, number]
  }
}
