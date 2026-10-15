import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

export default function useMapLocation(mapRef, cityId) {
  const [location, setLocation] = useState({ status: 'idle', message: '', accuracy: null })
  const watchRef = useRef(null)
  const requestRef = useRef(0)
  const positionRef = useRef(null)
  const markerRef = useRef(null)
  const accuracyRef = useRef(null)
  const followRef = useRef(false)
  const dragHandlerRef = useRef(() => { followRef.current = false })

  const stopWatch = () => {
    requestRef.current += 1
    if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current)
    watchRef.current = null
    followRef.current = false
  }

  const removeMarkers = () => {
    markerRef.current?.remove()
    accuracyRef.current?.remove()
    markerRef.current = null
    accuracyRef.current = null
    positionRef.current = null
  }

  useEffect(() => {
    followRef.current = false
  }, [cityId])

  useEffect(() => () => {
    stopWatch()
    removeMarkers()
    mapRef.current?.off('dragstart', dragHandlerRef.current)
  }, [mapRef])

  const centerOnLocation = (map, latlng, accuracy) => {
    const bounds = latlng.toBounds(Math.max(accuracy * 2, 20))
    map.fitBounds(bounds, { maxZoom: 16, padding: [35, 35], animate: false })
  }

  const locate = () => {
    const map = mapRef.current
    if (!map) return
    if (!window.isSecureContext || !navigator.geolocation) {
      setLocation({ status: 'error', message: 'Location needs HTTPS or localhost and a browser that supports location access.', accuracy: null })
      return
    }
    if (location.status === 'ready' && positionRef.current && watchRef.current !== null) {
      followRef.current = true
      centerOnLocation(map, positionRef.current.latlng, positionRef.current.accuracy)
      return
    }

    stopWatch()
    removeMarkers()
    followRef.current = true
    const request = requestRef.current
    let firstFix = true
    setLocation({ status: 'locating', message: 'Finding your location. Allow access if your browser asks.', accuracy: null })
    map.off('dragstart', dragHandlerRef.current).on('dragstart', dragHandlerRef.current)
    if (!map.getPane('userLocation')) map.createPane('userLocation').style.zIndex = '650'

    const fail = (error) => {
      if (request !== requestRef.current) return
      // A device can briefly lose its fix before reporting a new position.
      // Only denied permission is fatal; keep listening through transient errors.
      if (error.code === 1) {
        stopWatch()
        removeMarkers()
      }
      const messages = {
        1: 'Location permission is blocked. Allow location in your browser’s site settings, then try again.',
        2: 'Your device could not determine your location. Check location services and try again.',
        3: 'Location request timed out. Check your connection and try again.',
      }
      const lastKnown = positionRef.current ? ' The blue dot shows your last known position.' : ''
      setLocation({ status: 'error', message: (messages[error.code] || 'Your location could not be retrieved. Please try again.') + lastKnown, accuracy: null })
    }

    try {
      watchRef.current = navigator.geolocation.watchPosition(({ coords }) => {
        if (request !== requestRef.current || !mapRef.current) return
        const { latitude, longitude, accuracy } = coords
        const latlng = L.latLng(latitude, longitude)
        positionRef.current = { latlng, accuracy }
        if (!markerRef.current) {
          accuracyRef.current = L.circle(latlng, { radius: accuracy, color: '#2563eb', weight: 1, fillColor: '#3b82f6', fillOpacity: 0.1, interactive: false }).addTo(map)
          markerRef.current = L.circleMarker(latlng, { radius: 8, pane: 'userLocation', color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).bindTooltip('Your location', { direction: 'top', offset: [0, -10] }).addTo(map)
        } else {
          markerRef.current.setLatLng(latlng)
          accuracyRef.current.setLatLng(latlng).setRadius(accuracy)
        }
        if (followRef.current) {
          if (firstFix) centerOnLocation(map, latlng, accuracy)
          else map.panTo(latlng, { animate: false })
        }
        firstFix = false
        setLocation({ status: 'ready', message: 'Your location is shown by the blue dot.', accuracy: Math.round(accuracy) })
      }, fail, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 })
    } catch {
      fail({ code: 1 })
    }
  }

  const stop = () => {
    stopWatch()
    removeMarkers()
    mapRef.current?.off('dragstart', dragHandlerRef.current)
    setLocation({ status: 'idle', message: '', accuracy: null })
  }

  return { ...location, locate, stop, pause: () => { followRef.current = false } }
}
