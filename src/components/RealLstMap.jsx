import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CalendarDays, LocateFixed, MapPin, Minus, MousePointerClick, Plus, Thermometer } from 'lucide-react'
import { useFilters } from '../context'

const BANGLADESH_BOUNDS = [[20.5, 88.0], [26.8, 92.8]]

const DHAKA_POINTS = [
  ['Dhamrai', 90.1802, 23.918, 33.8, 29.4, 2.1], ['Savar', 90.256, 23.8583, 34.6, 29.8, 2.5],
  ['Uttara', 90.3795, 23.8759, 35.1, 30.4, 2.8], ['Turag', 90.3478, 23.8845, 34.8, 30.0, 2.6],
  ['Pallabi', 90.3668, 23.8245, 38.3, 31.3, 4.4], ['Cantonment', 90.3939, 23.827, 35.4, 30.2, 2.9],
  ['Mirpur', 90.3654, 23.8067, 39.1, 31.6, 4.8], ['Gulshan', 90.4152, 23.7925, 36.7, 30.8, 3.7],
  ['Badda', 90.4267, 23.7806, 38.4, 31.4, 4.5], ['Mohammadpur', 90.3589, 23.7662, 38.8, 31.3, 4.6],
  ['Tejgaon', 90.391, 23.7639, 40.2, 32.0, 5.2], ['Dhanmondi', 90.376, 23.7465, 37.4, 30.9, 3.9],
  ['Ramna', 90.401, 23.737, 40.5, 32.1, 5.3], ['Khilgaon', 90.4249, 23.7449, 39.3, 31.6, 4.9],
  ['Sabujbagh', 90.4292, 23.7312, 39.5, 31.7, 5.0], ['Demra', 90.4827, 23.7216, 40.0, 31.9, 5.1],
  ['Shyampur', 90.4302, 23.685, 41.0, 32.2, 5.5], ['Keraniganj', 90.3535, 23.698, 37.1, 30.7, 3.8],
  ['Nawabganj', 90.1636, 23.6582, 32.8, 28.9, 1.9], ['Dohar', 90.1424, 23.5883, 31.9, 28.4, 1.6],
]

const MODE = {
  lst: { badge: 'Interactive LST', range: 'LST · 34–42°C', colors: ['#15803d', '#84cc16', '#facc15', '#f97316', '#dc2626'], district: '#15803d', marker: '#0f766e' },
  uhi: { badge: 'Interactive UHI', range: 'UHI · +2.5–+5.7°C', colors: ['#2563eb', '#8b5cf6', '#facc15', '#f97316', '#be123c'], district: '#2563eb', marker: '#6d28d9' },
}

function formatDate(value) {
  if (!value) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function popupMarkup(point, color) {
  const [name, , , lst, air, uhi] = point
  return `
    <div class="real-map-popup-card">
      <strong>${name}</strong>
      <div class="real-map-popup-values">
        <span><small>LST</small><b style="color:${color}">${lst.toFixed(1)}°C</b></span>
        <span><small>TEMP</small><b>${air.toFixed(1)}°C</b></span>
        <span><small>UHI</small><b>+${uhi.toFixed(1)}°C</b></span>
      </div>
    </div>`
}

export default function RealLstMap({ mode = 'lst' }) {
  const { filters } = useFilters()
  const visual = MODE[mode] || MODE.lst
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const boundsRef = useRef({ country: L.latLngBounds(BANGLADESH_BOUNDS), dhaka: null })
  const markersRef = useRef([])
  const [ready, setReady] = useState(false)
  const [zoom, setZoom] = useState(7)
  const [focused, setFocused] = useState(false)
  const [moving, setMoving] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined

    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      doubleClickZoom: !coarsePointer,
      dragging: !coarsePointer,
      touchZoom: false,
      boxZoom: !coarsePointer,
      keyboard: true,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      preferCanvas: true,
    })
    mapRef.current = map
    map.fitBounds(BANGLADESH_BOUNDS, { padding: [8, 8], animate: false })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    L.control.scale({ imperial: false, position: 'bottomleft', maxWidth: 90 }).addTo(map)

    map.createPane('heatZones')
    map.getPane('heatZones').style.zIndex = '340'
    map.getPane('heatZones').style.pointerEvents = 'none'
    const heatRenderer = L.svg({ pane: 'heatZones', padding: 0.5 })

    const heatColor = (point) => {
      const value = mode === 'uhi' ? point[5] : point[3]
      if (value >= (mode === 'uhi' ? 5.1 : 40)) return visual.colors[4]
      if (value >= (mode === 'uhi' ? 4.2 : 38)) return visual.colors[3]
      if (value >= (mode === 'uhi' ? 3.4 : 36)) return visual.colors[2]
      return visual.colors[1]
    }

    const dhakaBounds = L.latLngBounds(DHAKA_POINTS.map(([, lng, lat]) => [lat, lng])).pad(0.16)
    boundsRef.current.dhaka = dhakaBounds

    DHAKA_POINTS.forEach((point, index) => {
      const [name, lng, lat] = point
      const color = heatColor(point)
      const value = mode === 'uhi' ? point[5] : point[3]
      const normalized = mode === 'uhi'
        ? Math.max(0, Math.min(1, (value - 1.5) / 4.2))
        : Math.max(0, Math.min(1, (value - 31) / 10))
      const outerRadius = mode === 'uhi' ? 8200 + normalized * 4200 : 7800 + normalized * 4400

      ;[
        { scale: 1, opacity: 0.028 },
        { scale: 0.68, opacity: 0.055 },
        { scale: 0.4, opacity: 0.1 },
        { scale: 0.2, opacity: 0.18 },
      ].forEach((ring) => {
        L.circle([lat, lng], {
          pane: 'heatZones',
          renderer: heatRenderer,
          radius: outerRadius * ring.scale,
          stroke: false,
          fillColor: color,
          fillOpacity: ring.opacity + normalized * 0.025,
          className: 'real-map-heat-zone',
          interactive: false,
        }).addTo(map)
      })

      const icon = L.divIcon({
        className: 'real-map-marker',
        html: `<span style="--point-color:${mode === 'lst' ? '#ffffff' : visual.marker};--point-ink:${mode === 'lst' ? '#0b1220' : '#ffffff'};--point-border:${mode === 'lst' ? '#0b1220' : 'rgba(255,255,255,.9)'}">${index + 1}</span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10],
      })
      const marker = L.marker([lat, lng], { icon, title: name, opacity: 0 })
        .bindTooltip(name, { permanent: true, direction: 'top', offset: [0, -10], className: 'real-map-label' })
        .bindPopup(popupMarkup(point, color), { className: 'real-map-popup', maxWidth: 240, closeButton: true })
        .addTo(map)
      markersRef.current.push(marker)
    })

    let active = true
    fetch('/bangladesh-districts.geojson')
      .then((response) => {
        if (!response.ok) throw new Error('District data unavailable')
        return response.json()
      })
      .then((data) => {
        if (!active || !mapRef.current) return
        const boundaryColor = mode === 'uhi' ? '#e879f9' : '#fb923c'
        L.geoJSON(data, {
          style: (feature) => feature.properties?.shapeName === 'Dhaka'
            ? { color: '#e0f2fe', weight: 7, fillOpacity: 0, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }
            : { opacity: 0, fillOpacity: 0 },
          interactive: false,
        }).addTo(map)
        const districtLayer = L.geoJSON(data, {
          style: (feature) => feature.properties?.shapeName === 'Dhaka'
            ? { color: boundaryColor, weight: 2.5, fillColor: visual.district, fillOpacity: 0.1, opacity: 1, lineCap: 'round', lineJoin: 'round' }
            : { color: '#4f6f91', weight: 0.5, fillColor: '#0f2747', fillOpacity: 0.02, opacity: 0.3 },
          interactive: false,
        }).addTo(map)
        boundsRef.current.country = districtLayer.getBounds().pad(0.03)
      })
      .catch(() => {})

    const updateMarkerVisibility = () => {
      const currentZoom = map.getZoom()
      const showMarkers = currentZoom >= 8.5
      const showLabels = currentZoom >= 10.25
      markersRef.current.forEach((marker) => {
        marker.setOpacity(showMarkers ? 1 : 0)
        const markerElement = marker.getElement()
        if (markerElement) markerElement.style.pointerEvents = showMarkers ? 'auto' : 'none'
        const tooltipElement = marker.getTooltip()?.getElement()
        if (tooltipElement) tooltipElement.style.opacity = showLabels ? '1' : '0'
      })
      setZoom(currentZoom)
    }
    const onMoveStart = () => setMoving(true)
    const onMoveEnd = () => {
      setMoving(false)
      updateMarkerVisibility()
    }
    map.on('zoomend', updateMarkerVisibility)
    map.on('movestart', onMoveStart)
    map.on('moveend', onMoveEnd)
    updateMarkerVisibility()

    const resizeObserver = new ResizeObserver(() => map.invalidateSize({ animate: false }))
    resizeObserver.observe(containerRef.current)
    window.setTimeout(() => {
      if (mapRef.current) {
        map.invalidateSize({ animate: false })
        setReady(true)
      }
    }, 0)

    return () => {
      active = false
      resizeObserver.disconnect()
      markersRef.current = []
      map.off()
      map.remove()
      mapRef.current = null
    }
  }, [mode, visual.colors, visual.district])

  const zoomIn = () => mapRef.current?.zoomIn(0.5, { animate: true })
  const zoomOut = () => mapRef.current?.zoomOut(0.5, { animate: true })
  const toggleFocus = () => {
    const map = mapRef.current
    if (!map || moving) return
    const nextFocused = !focused
    setFocused(nextFocused)
    setMoving(true)
    map.flyToBounds(nextFocused ? boundsRef.current.dhaka : boundsRef.current.country, {
      padding: nextFocused ? [24, 24] : [8, 8],
      maxZoom: nextFocused ? 10.5 : 7,
      duration: 1.25,
      easeLinearity: 0.18,
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800"><MapPin size={14} className="text-rose-500" aria-hidden="true" /> Dhaka District, Bangladesh</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-700 ring-1 ring-inset ring-indigo-100"><MousePointerClick size={12} aria-hidden="true" /> {visual.badge}</span>
      </div>

      <div className="relative isolate h-96 overflow-hidden rounded-2xl border border-slate-700 bg-[#07152d] shadow-inner">
        <div ref={containerRef} className="lst-map real-lst-map h-full w-full" aria-label={`Real street map showing ${mode === 'uhi' ? 'UHI' : 'LST'} monitoring points in Dhaka`} />
        {!ready && <div role="status" className="pointer-events-none absolute inset-0 z-[600] grid place-items-center bg-[#07152d] text-xs font-semibold text-blue-100">Loading real map…</div>}

        <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg border border-white/15 bg-slate-950/85 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.11em] text-white shadow-lg backdrop-blur-md"><Thermometer size={11} className="mr-1 inline text-blue-200" aria-hidden="true" /> {visual.range}</div>

        <div className="absolute right-3 top-3 z-[500] flex flex-col overflow-hidden rounded-xl border border-white/30 bg-white/95 text-slate-700 shadow-lg backdrop-blur-md">
          <button type="button" aria-label="Zoom in" title="Zoom in" disabled={zoom >= 19 || moving} onClick={zoomIn} className="grid h-9 w-9 place-items-center hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-300"><Plus size={16} strokeWidth={2.3} aria-hidden="true" /></button>
          <button type="button" aria-label={focused ? 'Zoom out to Bangladesh' : 'Focus Dhaka locations'} title={focused ? 'Zoom out to Bangladesh' : 'Focus Dhaka locations'} disabled={moving} onClick={toggleFocus} className="grid h-9 w-9 place-items-center border-y border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-wait disabled:text-indigo-300"><LocateFixed size={15} strokeWidth={2.2} className={moving ? 'animate-pulse' : ''} aria-hidden="true" /></button>
          <button type="button" aria-label="Zoom out" title="Zoom out" disabled={zoom <= 5 || moving} onClick={zoomOut} className="grid h-9 w-9 place-items-center hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-300"><Minus size={16} strokeWidth={2.3} aria-hidden="true" /></button>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[500] rounded-xl border border-white/15 bg-slate-950/88 px-3 py-2 shadow-lg backdrop-blur-md">
          <div className="h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${visual.colors.join(',')})` }} />
        </div>
      </div>

      <div className="text-[10px]">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-2 font-semibold text-blue-800"><CalendarDays size={13} aria-hidden="true" /> {formatDate(filters.date)}</span>
      </div>
    </div>
  )
}
