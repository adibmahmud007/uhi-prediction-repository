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
  ['Ashulia', 90.3289577, 23.8969898, 35.8, 30.2, 2.9], ['Hemayetpur', 90.2708736, 23.7935258, 36.5, 30.7, 3.3],
  ['Jahangirnagar University', 90.264258, 23.8824055, 34.2, 29.4, 1.9], ['Kalampur', 90.154259, 23.918176, 34.0, 29.2, 1.8],
  ['Kushura', 90.1252229, 23.9702646, 33.4, 28.9, 1.5], ['Joypara', 90.1203861, 23.6181725, 33.7, 29.1, 1.8],
  ['Bandura', 90.1105974, 23.6596373, 34.1, 29.3, 2.0], ['Kalakopa', 90.1437453, 23.6607983, 34.5, 29.6, 2.2],
  ['Agla', 90.230112, 23.6490058, 33.9, 29.2, 1.9], ['Narisha', 90.1510744, 23.5576483, 33.1, 28.8, 1.5],
  ['Kailail', 90.2491664, 23.6868965, 34.0, 29.2, 1.8], ['Sholla', 90.1706388, 23.7097034, 33.7, 29.1, 1.7],
  ['Bhakurta', 90.2827261, 23.769577, 35.6, 30.0, 2.7], ['Dhoiar', 90.0419089, 23.6503517, 32.9, 28.7, 1.4],
  ['Nannar', 90.1759077, 23.8833918, 34.4, 29.5, 2.1], ['Rowail', 90.1794889, 23.8454314, 34.2, 29.3, 1.9],
  ['Baisakanda', 90.1534396, 23.999909, 33.6, 29.0, 1.6], ['Zirabo', 90.3212269, 23.9132163, 35.3, 29.8, 2.5],
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

export default function RealLstMap({ mode = 'lst', expanded = false }) {
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
    const mobilePanThreshold = map.getZoom() + 0.2

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    L.control.scale({ imperial: false, position: 'bottomleft', maxWidth: 90 }).addTo(map)

    map.createPane('heatZones')
    map.getPane('heatZones').style.zIndex = '340'
    map.getPane('heatZones').style.pointerEvents = 'none'
    const heatRenderer = L.svg({ pane: 'heatZones', padding: 0.5 })
    let districtLayer = null

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
    Promise.all([
      fetch('/bangladesh-districts.geojson').then((response) => {
        if (!response.ok) throw new Error('District data unavailable')
        return response.json()
      }),
      fetch('/dhaka-district-full.geojson')
        .then((response) => {
          if (!response.ok) throw new Error('Full-resolution Dhaka boundary unavailable')
          return response.json()
        })
        .catch(() => null),
    ])
      .then(([countryData, fullDhakaData]) => {
        if (!active || !mapRef.current) return
        const fullDhakaFeature = fullDhakaData?.features?.find((feature) => feature.properties?.shapeName === 'Dhaka')
        const data = fullDhakaFeature
          ? {
              ...countryData,
              features: countryData.features.map((feature) => (
                feature.properties?.shapeName === 'Dhaka' ? fullDhakaFeature : feature
              )),
            }
          : countryData
        const boundaryColor = mode === 'uhi' ? '#e879f9' : '#fb923c'
        L.geoJSON(data, {
          style: (feature) => feature.properties?.shapeName === 'Dhaka'
            ? { color: '#e0f2fe', weight: 7, fillOpacity: 0, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }
            : { opacity: 0, fillOpacity: 0 },
          interactive: false,
        }).addTo(map)
        const closeBoundaryView = map.getZoom() >= 8.5
        districtLayer = L.geoJSON(data, {
          style: (feature) => feature.properties?.shapeName === 'Dhaka'
            ? { color: closeBoundaryView ? '#020617' : boundaryColor, weight: closeBoundaryView ? 3.5 : 2.5, fillColor: visual.district, fillOpacity: 0.1, opacity: 1, lineCap: 'round', lineJoin: 'round' }
            : expanded
              ? closeBoundaryView
                ? { weight: 0, fillOpacity: 0, opacity: 0 }
                : { color: '#38bdf8', weight: 1, fillColor: '#2563eb', fillOpacity: 0.075, opacity: 0.62, lineCap: 'round', lineJoin: 'round' }
              : { color: '#4f6f91', weight: 0.5, fillColor: '#0f2747', fillOpacity: 0.02, opacity: 0.3 },
          interactive: false,
        }).addTo(map)
        boundsRef.current.country = districtLayer.getBounds().pad(0.03)
      })
      .catch(() => {})

    const updateMarkerVisibility = () => {
      const currentZoom = map.getZoom()
      if (coarsePointer) {
        const enableTouchNavigation = currentZoom > mobilePanThreshold
        if (enableTouchNavigation) {
          map.dragging.enable()
          map.touchZoom.enable()
        } else {
          map.dragging.disable()
          map.touchZoom.disable()
        }
      }
      if (districtLayer) {
        const closeBoundaryView = currentZoom >= 8.5
        const boundaryColor = mode === 'uhi' ? '#e879f9' : '#fb923c'
        districtLayer.setStyle((feature) => feature.properties?.shapeName === 'Dhaka'
          ? { color: closeBoundaryView ? '#020617' : boundaryColor, weight: closeBoundaryView ? 3.5 : 2.5, fillColor: visual.district, fillOpacity: 0.1, opacity: 1, lineCap: 'round', lineJoin: 'round' }
          : expanded
            ? closeBoundaryView
              ? { weight: 0, fillOpacity: 0, opacity: 0 }
              : { color: '#38bdf8', weight: 1, fillColor: '#2563eb', fillOpacity: 0.075, opacity: 0.62, lineCap: 'round', lineJoin: 'round' }
            : { color: '#4f6f91', weight: 0.5, fillColor: '#0f2747', fillOpacity: 0.02, opacity: 0.3 })
      }
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
  }, [expanded, mode, visual.colors, visual.district])

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

      <div className={`relative isolate overflow-hidden rounded-2xl border border-slate-700 bg-[#07152d] shadow-inner ${expanded ? 'h-[500px] sm:h-[560px] lg:h-[620px]' : 'h-96'}`}>
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
