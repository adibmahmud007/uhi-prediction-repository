import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { CalendarDays, LocateFixed, MapPin, Minus, MousePointerClick, Plus, Thermometer, X } from 'lucide-react'
import { useFilters } from '../context'

const MAP_WIDTH = 440
const MAP_HEIGHT = 390
const ASPECT = MAP_WIDTH / MAP_HEIGHT

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
  lst: { badge: 'Interactive LST', range: 'LST · 34–42°C', colors: ['#15803d', '#84cc16', '#facc15', '#f97316', '#dc2626'] },
  uhi: { badge: 'Interactive UHI', range: 'UHI · +2.5–+5.7°C', colors: ['#2563eb', '#8b5cf6', '#facc15', '#f97316', '#be123c'] },
}

const LABEL_OFFSETS = {
  Dhamrai: [-10, -10], Savar: [-8, -11], Uttara: [0, -12], Turag: [-15, 9], Pallabi: [-16, -9],
  Cantonment: [17, -8], Mirpur: [-15, 10], Gulshan: [15, -8], Badda: [14, 9], Mohammadpur: [-22, 9],
  Tejgaon: [15, 10], Dhanmondi: [-19, 10], Ramna: [14, 9], Khilgaon: [15, 9], Sabujbagh: [17, 9],
  Demra: [15, 0], Shyampur: [15, 11], Keraniganj: [-21, 10], Nawabganj: [0, -11], Dohar: [0, 12],
}

const CONTEXT_DISTRICTS = new Set(['Dhaka', 'Gazipur', 'Tangail', 'Manikganj', 'Munshiganj', 'Narayanganj'])
const MINIMAP_SIZE = {
  1: 'h-24 w-20',
  2: 'h-20 w-16',
  3: 'h-16 w-14',
  4: 'h-14 w-12',
}

function coordinatePairs(value, pairs = []) {
  if (typeof value?.[0] === 'number') pairs.push(value)
  else value?.forEach((item) => coordinatePairs(item, pairs))
  return pairs
}

function geometryRings(geometry) {
  if (geometry.type === 'Polygon') return geometry.coordinates
  return geometry.coordinates.flat()
}

function boundsOf(points) {
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 }
}

function createProjection(features) {
  const coordinates = features.flatMap((feature) => coordinatePairs(feature.geometry.coordinates))
  const geo = boundsOf(coordinates)
  const availableWidth = MAP_WIDTH - 36
  const availableHeight = MAP_HEIGHT - 24
  const scale = Math.min(availableWidth / geo.width, availableHeight / geo.height)
  const offsetX = (MAP_WIDTH - geo.width * scale) / 2
  const offsetY = (MAP_HEIGHT - geo.height * scale) / 2
  return ([lng, lat]) => [offsetX + (lng - geo.minX) * scale, offsetY + (geo.maxY - lat) * scale]
}

function featurePath(feature, project) {
  return geometryRings(feature.geometry).map((ring) => ring.map((coordinate, index) => {
    const [x, y] = project(coordinate)
    return `${index ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ') + ' Z').join(' ')
}

function linePath(coordinates, project) {
  return coordinates.map((coordinate, index) => {
    const [x, y] = project(coordinate)
    return `${index ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ')
}

function focusBox(bounds, multiplier, minimumWidth) {
  const width = Math.min(MAP_WIDTH, Math.max(bounds.width * multiplier, bounds.height * multiplier * ASPECT, minimumWidth))
  const height = width / ASPECT
  return { x: bounds.centerX - width / 2, y: bounds.centerY - height / 2, width, height }
}

function useDistrictData() {
  const [features, setFeatures] = useState([])
  useEffect(() => {
    let active = true
    fetch('/bangladesh-districts.geojson')
      .then((response) => {
        if (!response.ok) throw new Error('District boundary data unavailable')
        return response.json()
      })
      .then((data) => { if (active) setFeatures(data.features || []) })
      .catch(() => { if (active) setFeatures([]) })
    return () => { active = false }
  }, [])
  return features
}

function formatDate(value) {
  if (!value) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

export default function LstMap({ mode = 'lst' }) {
  const { filters } = useFilters()
  const features = useDistrictData()
  const visual = MODE[mode] || MODE.lst
  const rawId = useId().replace(/:/g, '')
  const [zoom, setZoom] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)
  const suppressClickRef = useRef(false)

  useEffect(() => setPan({ x: 0, y: 0 }), [zoom])

  const map = useMemo(() => {
    if (!features.length) return null
    const project = createProjection(features)
    const districts = features.map((feature) => {
      const points = coordinatePairs(feature.geometry.coordinates).map(project)
      return { name: feature.properties.shapeName, path: featurePath(feature, project), points, bounds: boundsOf(points) }
    })
    const dhaka = districts.find((district) => district.name === 'Dhaka')
    const locations = DHAKA_POINTS.map(([name, lng, lat, lst, air, uhi]) => ({ name, lst, air, uhi, coordinate: project([lng, lat]) }))
    const districtBounds = boundsOf(dhaka.points)
    const locationBounds = boundsOf(locations.map((location) => location.coordinate))
    const boxes = [
      { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT },
      focusBox(districtBounds, 1.8, 125),
      focusBox(locationBounds, 2, 34),
      focusBox(locationBounds, 1.25, 21),
      focusBox(locationBounds, .92, 15),
    ]
    const rivers = [
      [[90.334, 23.91], [90.347, 23.85], [90.343, 23.79], [90.326, 23.72], [90.36, 23.695], [90.42, 23.69], [90.48, 23.675]],
      [[90.49, 23.91], [90.48, 23.84], [90.475, 23.77], [90.47, 23.7], [90.455, 23.63]],
      [[90.1, 23.625], [90.19, 23.64], [90.28, 23.655], [90.36, 23.67], [90.45, 23.65]],
    ].map((river) => linePath(river, project))
    const byName = Object.fromEntries(locations.map((location) => [location.name, location.coordinate]))
    const roads = [
      ['Dhamrai', 'Savar', 'Mirpur', 'Tejgaon', 'Ramna', 'Shyampur'],
      ['Uttara', 'Cantonment', 'Tejgaon', 'Ramna'],
      ['Gulshan', 'Badda', 'Khilgaon', 'Demra'],
      ['Mohammadpur', 'Dhanmondi', 'Ramna', 'Keraniganj', 'Nawabganj', 'Dohar'],
    ].map((road) => linePath(road.map((name) => {
      const coordinate = byName[name]
      const source = DHAKA_POINTS.find(([pointName]) => pointName === name)
      return source ? [source[1], source[2]] : coordinate
    }), project))
    return { districts, dhaka, locations, boxes, rivers, roads }
  }, [features])

  const selected = selectedIndex === null ? null : map?.locations[selectedIndex]
  const box = map?.boxes[zoom] || { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT }
  const viewBox = { ...box, x: box.x + pan.x, y: box.y + pan.y }
  const unitScale = box.width / MAP_WIDTH
  const gradient = `linear-gradient(90deg, ${visual.colors.join(',')})`
  const heatColor = (location) => {
    const value = mode === 'uhi' ? location.uhi : location.lst
    if (value >= (mode === 'uhi' ? 5.1 : 40)) return visual.colors[4]
    if (value >= (mode === 'uhi' ? 4.2 : 38)) return visual.colors[3]
    if (value >= (mode === 'uhi' ? 3.4 : 36)) return visual.colors[2]
    return visual.colors[1]
  }
  const startPan = (event) => {
    suppressClickRef.current = false
    if (zoom === 0) return
    if (event.target.closest?.('[data-map-marker]')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, panX: pan.x, panY: pan.y, moved: false }
  }
  const movePan = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const rect = event.currentTarget.getBoundingClientRect()
    const dx = event.clientX - drag.clientX
    const dy = event.clientY - drag.clientY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true
    const nextX = drag.panX - dx * box.width / rect.width
    const nextY = drag.panY - dy * box.height / rect.height
    setPan({
      x: Math.min(MAP_WIDTH - box.width - box.x, Math.max(-box.x, nextX)),
      y: Math.min(MAP_HEIGHT - box.height - box.y, Math.max(-box.y, nextY)),
    })
  }
  const endPan = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    suppressClickRef.current = drag.moved
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    dragRef.current = null
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800"><MapPin size={14} className="text-rose-500" aria-hidden="true" /> Dhaka District, Bangladesh</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-700 ring-1 ring-inset ring-indigo-100"><MousePointerClick size={12} aria-hidden="true" /> {visual.badge}</span>
      </div>

      <div className="relative isolate h-96 overflow-hidden rounded-2xl border border-slate-700 bg-[#07152d] shadow-inner">
        {!map ? (
          <div role="status" className="grid h-full place-items-center text-xs font-semibold text-blue-100">Loading Bangladesh map…</div>
        ) : (
          <svg viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} role="img" aria-labelledby={`${rawId}-title ${rawId}-description`} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={endPan} onPointerCancel={endPan} className={`block h-full w-full select-none ${zoom > 0 ? 'cursor-grab active:cursor-grabbing' : ''}`} style={{ touchAction: 'none' }} preserveAspectRatio="xMidYMid meet">
            <title id={`${rawId}-title`}>Bangladesh map with Dhaka District highlighted and 20 selectable locations</title>
            <desc id={`${rawId}-description`}>Use the zoom controls, drag the zoomed map in any direction, then select a numbered location to view its temperature values.</desc>
            <defs>
              <clipPath id={`${rawId}-dhaka-clip`}><path d={map.dhaka.path} /></clipPath>
              <linearGradient id={`${rawId}-heat`} x1="0" y1="1" x2="1" y2="0">
                {visual.colors.map((color, index) => <stop key={color} offset={`${index * 25}%`} stopColor={color} />)}
              </linearGradient>
              <filter id={`${rawId}-texture`} x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency=".22" numOctaves="3" seed={mode === 'uhi' ? '13' : '8'} result="noise" />
                <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
                <feBlend in="SourceGraphic" in2="mono" mode="soft-light" />
              </filter>
              <filter id={`${rawId}-soft`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="1.8" /></filter>
            </defs>

            <rect width="440" height="390" fill="#07152d" />
            {map.districts.map((district) => <path key={district.name} d={district.path} fill={district.name === 'Dhaka' ? mode === 'uhi' ? '#4c3fb0' : '#397448' : '#274a7f'} stroke="#82ace7" strokeWidth={Math.max(.18, .7 * unitScale)} strokeLinejoin="round" opacity={district.name === 'Dhaka' ? 1 : .76} />)}
            <g clipPath={`url(#${rawId}-dhaka-clip)`}>
              <rect width="440" height="390" fill={`url(#${rawId}-heat)`} opacity={zoom === 0 ? '.58' : '.7'} filter={`url(#${rawId}-texture)`} />
              <g filter={`url(#${rawId}-soft)`} opacity=".94">
                {map.locations.map((location) => <circle key={location.name} cx={location.coordinate[0]} cy={location.coordinate[1]} r="3" fill={heatColor(location)} />)}
              </g>
              {map.rivers.map((river, index) => <path key={`river-${index}`} d={river} fill="none" stroke="#0284c7" strokeOpacity=".9" strokeWidth={Math.max(.22, 1.25 * unitScale)} strokeLinecap="round" />)}
              {map.roads.map((road, index) => <path key={`road-${index}`} d={road} fill="none" stroke="#dc2626" strokeOpacity=".78" strokeWidth={Math.max(.13, .65 * unitScale)} strokeLinecap="round" strokeLinejoin="round" />)}
            </g>
            <path d={map.dhaka.path} fill="none" stroke="#fff" strokeWidth={Math.max(.38, 1.8 * unitScale)} strokeLinejoin="round" />

            {zoom <= 1 && map.districts.filter((district) => zoom === 0 ? district.name === 'Dhaka' : CONTEXT_DISTRICTS.has(district.name)).map((district) => (
              <text key={`${district.name}-context`} x={district.bounds.centerX} y={district.bounds.centerY} textAnchor="middle" fontSize={zoom === 0 ? '5.5' : 7.5 * unitScale} fontWeight={district.name === 'Dhaka' ? '800' : '600'} fill={district.name === 'Dhaka' ? '#fef08a' : '#dbeafe'} paintOrder="stroke" stroke="#0f2446" strokeWidth={zoom === 0 ? '1.6' : 2 * unitScale}>{district.name.toUpperCase()}</text>
            ))}

            {zoom > 0 && map.locations.map((location, index) => {
              const [x, y] = location.coordinate
              const active = selectedIndex === index
              const [labelX, labelY] = LABEL_OFFSETS[location.name] || [10, -10]
              return (
                <g key={location.name} data-map-marker="true" role="button" tabIndex="0" aria-label={`${location.name}: select monitoring point`} aria-pressed={active} onClick={() => { if (suppressClickRef.current) { suppressClickRef.current = false; return } setSelectedIndex(index) }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedIndex(index) } }} className="cursor-pointer outline-none">
                  <title>{location.name}</title>
                  {active && <circle cx={x} cy={y} r={13 * unitScale} fill="none" stroke="#fff" strokeWidth={2 * unitScale} />}
                  <circle cx={x} cy={y} r={(active ? 8 : 6.5) * unitScale} fill={active ? '#fff' : '#fef08a'} stroke={active ? '#e11d48' : '#0f172a'} strokeWidth={2 * unitScale} />
                  <text x={x} y={y + 2.4 * unitScale} textAnchor="middle" fontSize={6.5 * unitScale} fontWeight="800" fill={active ? '#be123c' : '#0f172a'}>{index + 1}</text>
                  <text x={x + labelX * unitScale} y={y + labelY * unitScale} textAnchor={labelX < 0 ? 'end' : labelX === 0 ? 'middle' : 'start'} fontSize={7.2 * unitScale} fontWeight="700" fill="#f8fafc" paintOrder="stroke" stroke="#0f172a" strokeWidth={2.2 * unitScale} strokeLinejoin="round">{location.name}</text>
                </g>
              )
            })}
          </svg>
        )}

        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-white/15 bg-slate-950/85 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.11em] text-white shadow-lg backdrop-blur-md"><Thermometer size={11} className="mr-1 inline text-blue-200" aria-hidden="true" /> {visual.range}</div>

        <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-xl border border-white/30 bg-white/95 text-slate-700 shadow-lg backdrop-blur-md">
          <button type="button" aria-label="Zoom in" title="Zoom in" disabled={zoom === 4} onClick={() => setZoom((value) => Math.min(4, value + 1))} className="grid h-9 w-9 place-items-center hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-300"><Plus size={16} strokeWidth={2.3} aria-hidden="true" /></button>
          <button type="button" aria-label="Focus Dhaka locations" title="Focus Dhaka locations" onClick={() => setZoom(3)} className="grid h-9 w-9 place-items-center border-y border-slate-200 hover:bg-indigo-50 hover:text-indigo-700"><LocateFixed size={15} strokeWidth={2.2} aria-hidden="true" /></button>
          <button type="button" aria-label="Zoom out" title="Zoom out" disabled={zoom === 0} onClick={() => setZoom((value) => Math.max(0, value - 1))} className="grid h-9 w-9 place-items-center hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-300"><Minus size={16} strokeWidth={2.3} aria-hidden="true" /></button>
        </div>

        {selected && (
          <div role="status" aria-live="polite" className="absolute right-14 top-3 w-36 rounded-xl border border-white/15 bg-slate-950/92 p-2.5 text-white shadow-xl backdrop-blur-md">
            <button type="button" aria-label="Close location details" onClick={() => setSelectedIndex(null)} className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded text-slate-400 hover:bg-white/10 hover:text-white"><X size={12} aria-hidden="true" /></button>
            <p className="pr-5 text-[11px] font-bold text-blue-100">{selected.name}</p>
            <div className="mt-2 grid grid-cols-3 gap-1 text-center">
              <div className="rounded bg-white/8 px-1 py-1.5"><span className="block text-[7px] text-slate-400">LST</span><strong className="text-[10px] text-rose-300">{selected.lst.toFixed(1)}°</strong></div>
              <div className="rounded bg-white/8 px-1 py-1.5"><span className="block text-[7px] text-slate-400">TEMP</span><strong className="text-[10px] text-orange-300">{selected.air.toFixed(1)}°</strong></div>
              <div className="rounded bg-white/8 px-1 py-1.5"><span className="block text-[7px] text-slate-400">UHI</span><strong className="text-[10px] text-violet-300">+{selected.uhi.toFixed(1)}°</strong></div>
            </div>
          </div>
        )}

        {map && zoom > 0 && (
          <div className={`pointer-events-none absolute bottom-14 right-3 rounded-lg border border-white/20 bg-slate-950/88 p-1 shadow-lg backdrop-blur-md transition-[width,height] duration-200 ${MINIMAP_SIZE[zoom]}`} aria-hidden="true">
            <svg viewBox="0 0 440 390" className="h-full w-full">
              {map.districts.map((district) => <path key={district.name} d={district.path} fill={district.name === 'Dhaka' ? '#f97316' : '#315995'} stroke="#bfdbfe" strokeWidth="1" />)}
              <path d={map.dhaka.path} fill="none" stroke="#fff" strokeWidth="4" />
              <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height} fill="none" stroke="#fef08a" strokeWidth={Math.max(2, 5 * unitScale)} />
            </svg>
            <span className="absolute left-1.5 top-1 text-[7px] font-bold tracking-wider text-white">BD</span>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-xl border border-white/15 bg-slate-950/88 px-3 py-2 shadow-lg backdrop-blur-md">
          <div className="h-2 rounded-full" style={{ background: gradient }} />
        </div>
      </div>

      <div className="text-[10px]">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-2 font-semibold text-blue-800"><CalendarDays size={13} aria-hidden="true" /> {formatDate(filters.date)}</span>
      </div>
    </div>
  )
}
