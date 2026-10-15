import { Layers2, Map, Moon, Mountain, Satellite } from 'lucide-react'

const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_API_KEY?.trim()
export const HAS_TOMTOM_KEY = Boolean(TOMTOM_KEY)
const keyQuery = encodeURIComponent(TOMTOM_KEY || '')
const tomtomAttribution = '&copy; <a href="https://www.tomtom.com/copyright/">TomTom</a>'
const satellite = {
  url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Imagery &copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics, GIS User Community',
  maxNativeZoom: 19,
}

export const MAP_TYPES = {
  street: {
    label: 'Street', icon: Map, description: 'Roads and places',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxNativeZoom: 19,
  },
  satellite: { ...satellite, label: 'Satellite', icon: Satellite, description: 'Aerial imagery' },
  hybrid: { ...satellite, label: 'Hybrid', icon: Layers2, description: 'Imagery with roads', requiresKey: true },
  dark: {
    label: 'Dark', icon: Moon, description: 'Night map style', requiresKey: true,
    url: `https://api.tomtom.com/maps/orbis/display/raster/tile/{z}/{x}/{y}?apiVersion=2&style=street-dark&tileSize=256&key=${keyQuery}`,
    attribution: tomtomAttribution, maxNativeZoom: 19,
  },
  terrain: {
    label: 'Terrain', icon: Mountain, description: 'Contours and elevation',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Style &copy; <a href="https://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxNativeZoom: 17,
  },
}

// TomTom's transparent hybrid tiles provide roads and labels above the imagery.
export const HYBRID_ROADS = {
  url: `https://api.tomtom.com/map/1/tile/hybrid/main/{z}/{x}/{y}.png?tileSize=256&key=${keyQuery}`,
  attribution: `Roads ${tomtomAttribution}`,
}

export function trafficTileUrl(dark = false, revision = 0) {
  // A shared two-minute cache bucket refreshes current conditions without per-tile cache busting.
  const refresh = `${Math.floor(Date.now() / 120000)}-${revision}`
  return `https://api.tomtom.com/maps/orbis/traffic/flow/raster/tile/{z}/{x}/{y}?apiVersion=2&key=${keyQuery}&style=${dark ? 'dark' : 'light'}&tileSize=256&refresh=${refresh}`
}

export const TRAFFIC_ATTRIBUTION = `Traffic ${tomtomAttribution}`
