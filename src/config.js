// Single source of truth: sidebar, home grid and detail pages all read this list.
import { Thermometer, Flame, BarChart3, TrendingUp, CalendarDays, Leaf, GitBranch, Lightbulb, MapPin, Users, Droplets } from 'lucide-react'

export const WIDGETS = [
  { id: 'lst-map', title: 'Predicted LST Map', icon: Thermometer, span: 'lg:col-span-5', desc: '...' },
  { id: 'uhi-map', title: 'UHI intensity Map', icon: Flame, span: 'lg:col-span-4', desc: '...' },
  { id: 'hotspot-distribution', title: 'Heat-Risk Distribution', icon: BarChart3, span: 'lg:col-span-3', desc: '...' },
  { id: 'lst-trend', title: 'LST trend', icon: TrendingUp, span: 'lg:col-span-6', desc: '...' },
  { id: 'seasonal', title: 'Seasonal Comparison', icon: CalendarDays, span: 'lg:col-span-3', desc: '...' },
  { id: 'env-factors', title: 'Environmental Factors', icon: Leaf, span: 'lg:col-span-3', desc: '...' },
  { id: 'hotspot-evolution', title: 'Hotspot Evolution', icon: GitBranch, span: 'lg:col-span-6', desc: '...' },
  { id: 'recommendations', title: 'Recommendations', icon: Lightbulb, span: 'lg:col-span-6', desc: '...' },
]

// Illustrative static values for the summary cards; these do not use the filters.
export const KPIS = [
  { id: 'predicted-lst', label: 'Predicted LST', value: '36.8', unit: '°C', description: 'Land surface temperature', icon: Thermometer, color: 'copper' },
  { id: 'uhi-intensity', label: 'UHI Intensity', value: '+4.2', unit: '°C', description: 'Urban–rural temperature gap', icon: Flame, color: 'copper' },
  { id: 'hotspot-area', label: 'Hotspot Area', value: '128.4', unit: 'km²', description: 'Area affected by heat hotspots', icon: MapPin, color: 'slate' },
  { id: 'high-risk-population', label: 'High-risk Population', value: '1.24', unit: 'M', description: 'People exposed to high heat', icon: Users, color: 'slate' },
  { id: 'vegetation-cover', label: 'Vegetation Cover', value: '18.6', unit: '%', description: 'Share of land with vegetation', icon: Leaf, color: 'teal' },
  { id: 'water-bodies', label: 'Water Bodies', value: '6.3', unit: '%', description: 'Share of land covered by water', icon: Droplets, color: 'blue' },
]
export const CITIES = [{ id: 'dhaka', name: 'Dhaka' }, { id: 'sylhet', name: 'Sylhet' }]
export const SCALES = [{ id: 'daily', name: 'Daily' }, { id: 'monthly', name: 'Monthly' }, { id: 'yearly', name: 'Yearly' }]
export const SCENARIOS = [{ id: 'ssp245', name: 'SSP2-4.5' }, { id: 'ssp585', name: 'SSP5-8.5' }]
