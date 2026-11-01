import { Building2, CloudRain, Droplets, Leaf, MapPin, Thermometer, Waves, Wind } from 'lucide-react'
import { useFilters } from '../context'
import { CITIES } from '../config'

const factorsByCity = {
  dhaka: [
    { label: 'NDVI', value: '0.23', icon: Leaf, color: 'text-emerald-400', surface: 'bg-emerald-400/10 ring-emerald-300/15' },
    { label: 'NDBI', value: '0.41', icon: Building2, color: 'text-orange-400', surface: 'bg-orange-400/10 ring-orange-300/15' },
    { label: 'NDWI', value: '0.12', icon: Waves, color: 'text-cyan-400', surface: 'bg-cyan-400/10 ring-cyan-300/15' },
    { label: 'Humidity', value: '68%', icon: Droplets, color: 'text-blue-400', surface: 'bg-blue-400/10 ring-blue-300/15' },
    { label: 'Wind Speed', value: '8.7 km/h', icon: Wind, color: 'text-indigo-300', surface: 'bg-indigo-400/10 ring-indigo-300/15' },
    { label: 'Rainfall', value: '0.0 mm', icon: CloudRain, color: 'text-sky-400', surface: 'bg-sky-400/10 ring-sky-300/15' },
    { label: 'Average Temperature', value: '32.6°C', icon: Thermometer, color: 'text-rose-400', surface: 'bg-rose-400/10 ring-rose-300/15' },
  ],
  sylhet: [
    { label: 'NDVI', value: '0.38', icon: Leaf, color: 'text-emerald-400', surface: 'bg-emerald-400/10 ring-emerald-300/15' },
    { label: 'NDBI', value: '0.29', icon: Building2, color: 'text-orange-400', surface: 'bg-orange-400/10 ring-orange-300/15' },
    { label: 'NDWI', value: '0.21', icon: Waves, color: 'text-cyan-400', surface: 'bg-cyan-400/10 ring-cyan-300/15' },
    { label: 'Humidity', value: '76%', icon: Droplets, color: 'text-blue-400', surface: 'bg-blue-400/10 ring-blue-300/15' },
    { label: 'Wind Speed', value: '7.4 km/h', icon: Wind, color: 'text-indigo-300', surface: 'bg-indigo-400/10 ring-indigo-300/15' },
    { label: 'Rainfall', value: '1.8 mm', icon: CloudRain, color: 'text-sky-400', surface: 'bg-sky-400/10 ring-sky-300/15' },
    { label: 'Average Temperature', value: '29.8°C', icon: Thermometer, color: 'text-rose-400', surface: 'bg-rose-400/10 ring-rose-300/15' },
  ],
}

export default function EnvironmentalFactors() {
  const { filters } = useFilters()
  const city = CITIES.find((item) => item.id === filters.city) || CITIES[0]
  const factors = factorsByCity[city.id] || factorsByCity.dhaka

  return (
    <div className="flex h-[304px] flex-col overflow-hidden rounded-2xl border border-blue-950/10 bg-[#07152d] shadow-[0_16px_32px_-24px_rgba(15,23,42,0.9)]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-100">
          <MapPin size={13} className="text-cyan-400" aria-hidden="true" />
          {city.name} conditions
        </span>
        <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-300 ring-1 ring-inset ring-emerald-300/20">
          Current
        </span>
      </div>

      <dl className="flex min-h-0 flex-1 flex-col divide-y divide-white/[0.07] px-3 py-1">
        {factors.map(({ label, value, icon: Icon, color, surface }) => (
          <div key={label} className="group flex min-h-0 flex-1 items-center justify-between gap-3 py-1">
            <dt className="flex min-w-0 items-center gap-2.5 text-[11px] font-medium text-slate-200">
              <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${surface}`}>
                <Icon size={14} strokeWidth={2} className={color} aria-hidden="true" />
              </span>
              <span className="truncate">{label}</span>
            </dt>
            <dd className={`shrink-0 text-[11px] font-bold tabular-nums ${color}`}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
