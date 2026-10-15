import { useEffect, useRef, useState } from 'react'
import { Crosshair, ExternalLink, Info, LoaderCircle, LocateFixed, MapPin, Minus, Plus, RefreshCw, TrafficCone } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useFilters } from '../context'
import { CITIES } from '../config'
import MapLayerPicker from './MapLayerPicker'
import { HAS_TOMTOM_KEY, HYBRID_ROADS, MAP_TYPES, TRAFFIC_ATTRIBUTION, trafficTileUrl } from '../mapLayers'
import useMapLocation from '../hooks/useMapLocation'
import { watchTrafficCoverage } from '../trafficCoverage'
const control = 'inline-flex h-10 w-10 items-center justify-center bg-white text-slate-700 transition-colors hover:bg-slate-50 hover:text-indigo-700 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:text-slate-300'

// Track batches rather than one failed tile: a partially loaded map is still usable.
function watchTiles(layer, onStatus) {
  let loaded = 0
  let failed = 0
  let timer
  const events = {
    loading: () => {
      loaded = 0
      failed = 0
      onStatus('loading')
      clearTimeout(timer)
      timer = setTimeout(() => onStatus('error'), 15000)
    },
    tileload: () => { loaded += 1 },
    tileerror: () => { failed += 1 },
    load: () => {
      clearTimeout(timer)
      onStatus(loaded === 0 && failed > 0 ? 'error' : 'ready')
    },
  }
  layer.on(events)
  return () => {
    clearTimeout(timer)
    layer.off(events)
  }
}

export default function LstMap() {
  const { filters } = useFilters()
  const city = CITIES.find((item) => item.id === filters.city) || CITIES[0]
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [basemap, setBasemap] = useState('street')
  const [reload, setReload] = useState(0)
  const [baseStatus, setBaseStatus] = useState('loading')
  const [trafficEnabled, setTrafficEnabled] = useState(HAS_TOMTOM_KEY)
  const [trafficStatus, setTrafficStatus] = useState('idle')
  const [roadsStatus, setRoadsStatus] = useState('idle')
  const [trafficRefresh, setTrafficRefresh] = useState(0)
  const [trafficUpdatedAt, setTrafficUpdatedAt] = useState(null)
  const [viewport, setViewport] = useState({ zoom: city.zoom, lat: city.center[0], lng: city.center[1] })
  const darkTraffic = basemap === 'dark'
  const location = useMapLocation(mapRef, city.id)
  const googleTrafficUrl = `https://www.google.com/maps/@?api=1&map_action=map&center=${viewport.lat},${viewport.lng}&zoom=${Math.round(viewport.zoom)}&basemap=roadmap&layer=traffic`

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const map = L.map(containerRef.current, {
      zoomControl: false, scrollWheelZoom: false, minZoom: 3, maxZoom: 19,
      zoomAnimation: !reduceMotion, fadeAnimation: !reduceMotion, markerZoomAnimation: !reduceMotion,
    }).setView(CITIES[0].center, CITIES[0].zoom)
    mapRef.current = map
    map.createPane('traffic').style.zIndex = '450'
    map.getPane('traffic').style.pointerEvents = 'none'
    map.createPane('roadLabels').style.zIndex = '350'
    map.getPane('roadLabels').style.pointerEvents = 'none'
    L.control.scale({ imperial: false, position: 'bottomleft', maxWidth: 85 }).addTo(map)
    const syncViewport = () => {
      const center = map.getCenter().wrap()
      setViewport({ zoom: map.getZoom(), lat: center.lat, lng: center.lng })
    }
    map.on('moveend zoomend', syncViewport)
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    observer.observe(containerRef.current)
    return () => {
      observer.disconnect()
      map.off('moveend zoomend', syncViewport)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    map.setView(city.center, city.zoom, { animate: false })
    const marker = L.circleMarker(city.center, {
      radius: 7, color: '#ffffff', weight: 3, fillColor: '#4338ca', fillOpacity: 1, pane: 'markerPane',
    }).bindTooltip(`${city.name} city center`, { direction: 'top', offset: [0, -8] }).addTo(map)
    return () => { marker.remove() }
  }, [city])

  useEffect(() => {
    const map = mapRef.current
    const { url, attribution, maxNativeZoom } = MAP_TYPES[basemap]
    const layer = L.tileLayer(url, { attribution, maxNativeZoom, maxZoom: 19 }).setZIndex(0)
    setBaseStatus('loading')
    const stopWatching = watchTiles(layer, setBaseStatus)
    layer.addTo(map)
    return () => {
      stopWatching()
      layer.remove()
    }
  }, [basemap, reload])

  useEffect(() => {
    if (basemap !== 'hybrid' || !HAS_TOMTOM_KEY) {
      setRoadsStatus('idle')
      return
    }
    const layer = L.tileLayer(HYBRID_ROADS.url, { pane: 'roadLabels', attribution: HYBRID_ROADS.attribution, maxZoom: 19 })
    const stopWatching = watchTiles(layer, setRoadsStatus)
    layer.addTo(mapRef.current)
    return () => { stopWatching(); layer.remove() }
  }, [basemap, reload])

  useEffect(() => {
    if (!HAS_TOMTOM_KEY || !trafficEnabled) {
      setTrafficStatus('idle')
      setTrafficUpdatedAt(null)
      return
    }
    const layer = L.tileLayer(
      trafficTileUrl(darkTraffic, trafficRefresh),
      { pane: 'traffic', opacity: 1, crossOrigin: 'anonymous', maxZoom: 19, attribution: TRAFFIC_ATTRIBUTION },
    )
    setTrafficStatus('loading')
    const stopWatching = watchTrafficCoverage(layer, mapRef.current, (status) => {
      setTrafficStatus(status)
      if (['ready', 'empty', 'unknown'].includes(status)) setTrafficUpdatedAt(new Date())
    })
    layer.addTo(mapRef.current)
    const refresh = () => {
      if (document.visibilityState === 'visible') layer.setUrl(trafficTileUrl(darkTraffic, trafficRefresh), true).redraw()
    }
    const interval = setInterval(refresh, 120000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', refresh)
      stopWatching()
      layer.remove()
    }
  }, [trafficEnabled, darkTraffic, trafficRefresh, reload])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <MapPin size={14} className="text-indigo-600" aria-hidden="true" /> Analysis city: {city.name}
        </p>
        <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">Basemap preview</span>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
        <MapLayerPicker value={basemap} onChange={setBasemap} />
        <button type="button" role="switch" aria-checked={trafficEnabled} disabled={!HAS_TOMTOM_KEY} title={HAS_TOMTOM_KEY ? 'Show current traffic conditions' : 'Traffic data is not connected yet'} onClick={() => setTrafficEnabled((value) => !value)} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400 ${trafficEnabled ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'text-slate-600 hover:bg-white'}`}>
          <TrafficCone size={14} aria-hidden="true" /> Traffic
          <span className={`inline-flex h-4 w-7 items-center rounded-full p-0.5 ${trafficEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`} aria-hidden="true">
            <span className={`h-3 w-3 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${trafficEnabled ? 'translate-x-3' : ''}`} />
          </span>
        </button>
      </div>

      <div className="relative isolate h-80 overflow-hidden rounded-xl border border-slate-200 sm:h-90">
        <div ref={containerRef} role="region" className="lst-map h-full w-full" aria-label={`Interactive ${city.name} map. Use arrow keys to pan and plus or minus to zoom.`} />
        <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg border border-slate-200/80 bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm">Zoom {viewport.zoom}</div>
        <div className="absolute right-3 top-3 z-[500] flex flex-col items-end gap-2">
          <div className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 shadow-md shadow-slate-900/10">
            <button type="button" className={control} aria-label="Zoom in" title="Zoom in" disabled={viewport.zoom >= 19} onClick={() => mapRef.current?.zoomIn()}><Plus size={18} aria-hidden="true" /></button>
            <button type="button" className={control} aria-label="Zoom out" title="Zoom out" disabled={viewport.zoom <= 3} onClick={() => mapRef.current?.zoomOut()}><Minus size={18} aria-hidden="true" /></button>
          </div>
          <button type="button" className={`${control} rounded-xl border border-slate-200 shadow-md shadow-slate-900/10 ${location.status === 'ready' ? 'text-blue-600' : ''}`} aria-label="Show my location" title="Show my location" disabled={location.status === 'locating'} onClick={location.locate}>
            {location.status === 'locating' ? <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <LocateFixed size={18} aria-hidden="true" />}
          </button>
          <button type="button" className={`${control} rounded-xl border border-slate-200 shadow-md shadow-slate-900/10`} aria-label={`Reset map to ${city.name}`} title={`Reset map to ${city.name}`} onClick={() => { location.pause(); mapRef.current?.setView(city.center, city.zoom, { animate: false }) }}><Crosshair size={17} aria-hidden="true" /></button>
        </div>
        {baseStatus === 'loading' && (
          <div role="status" className="pointer-events-none absolute bottom-12 left-1/2 z-[500] inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-lg bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-sm"><LoaderCircle size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading map…</div>
        )}
        {baseStatus === 'error' && (
          <div className="pointer-events-none absolute inset-0 z-[500] grid place-items-center p-12">
            <div role="status" className="pointer-events-auto rounded-xl border border-slate-200 bg-white/95 p-4 text-center shadow-lg">
              <p className="text-sm font-semibold text-slate-800">Map tiles could not load</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Check your connection or try another view.</p>
              <button type="button" onClick={() => setReload((value) => value + 1)} className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-indigo-600"><RefreshCw size={13} aria-hidden="true" /> Retry map</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] leading-5 text-slate-500">
        <span>Drag to explore · Pinch or use + / − to zoom</span>
        <span className="tabular-nums">{Math.abs(viewport.lat).toFixed(4)}° {viewport.lat < 0 ? 'S' : 'N'}, {Math.abs(viewport.lng).toFixed(4)}° {viewport.lng < 0 ? 'W' : 'E'}</span>
      </div>
      <div className="space-y-1 border-t border-slate-100 pt-2 text-xs leading-5 text-slate-500">
        {location.status !== 'idle' && (
          <div role="status" className={`mb-2 rounded-lg px-3 py-2 ${location.status === 'error' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>
            <p>{location.message} {location.status === 'ready' && `Accuracy: approximately ${location.accuracy} m.`}</p>
            <button type="button" onClick={location.stop} className="mt-1 rounded text-[11px] font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-blue-600">{location.status === 'locating' ? 'Cancel location' : 'Stop location'}</button>
          </div>
        )}
        <p className="flex items-start gap-1.5"><Info size={13} className="mt-1 shrink-0 text-indigo-500" aria-hidden="true" /> Basemap preview. The LST prediction layer will be added next.</p>
        {roadsStatus === 'error' && <p className="pl-5 text-amber-700">Road labels could not load. <button type="button" onClick={() => setReload((value) => value + 1)} className="rounded font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-indigo-600">Retry labels</button></p>}
        {!HAS_TOMTOM_KEY && <p className="pl-5">Traffic data is not connected yet.</p>}
        {trafficEnabled && (
          <div role="status" className="pl-5">
            {trafficStatus === 'empty' && (
              <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <p className="font-semibold">No live traffic data for this view</p>
                <p className="mt-1 text-[11px] leading-5">The provider returned no road traffic data for this area. This does not mean the roads are clear.</p>
                <a href={googleTrafficUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-8 items-center gap-1.5 rounded font-semibold text-indigo-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-indigo-600">View traffic in Google Maps <ExternalLink size={12} aria-hidden="true" /></a>
              </div>
            )}
            {trafficStatus === 'unknown' && <p>Traffic tiles loaded, but road coverage could not be verified for this view.</p>}
            {trafficStatus === 'error' ? <p>Traffic could not load. <button type="button" onClick={() => setTrafficRefresh((value) => value + 1)} className="rounded font-semibold text-indigo-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-indigo-600">Retry traffic</button></p> : trafficStatus === 'loading' ? 'Loading current traffic…' : trafficStatus === 'ready' ? (
              <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Current traffic:</span>
                {['Congested', 'Slow', 'Free-flow'].map((label, index) => <span key={label} className="inline-flex items-center gap-1"><span aria-hidden="true" className={`h-1.5 w-3 rounded-full ${['bg-red-500', 'bg-amber-400', 'bg-emerald-500'][index]}`} />{label}</span>)}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
                <span>{trafficUpdatedAt && `Updated ${trafficUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} · Refreshes every 2 min</span>
                <button type="button" onClick={() => setTrafficRefresh((value) => value + 1)} className="inline-flex min-h-7 items-center gap-1 rounded px-1 font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600"><RefreshCw size={11} aria-hidden="true" /> Refresh traffic</button>
              </div>
              <p className="text-[10px]">Current road conditions, independent of prediction date. Coverage varies by area.</p>
              </div>
            ) : null}
            {['empty', 'unknown'].includes(trafficStatus) && <button type="button" onClick={() => setTrafficRefresh((value) => value + 1)} className="inline-flex min-h-8 items-center gap-1 rounded px-1 font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600"><RefreshCw size={11} aria-hidden="true" /> Refresh traffic</button>}
          </div>
        )}
      </div>
    </div>
  )
}
