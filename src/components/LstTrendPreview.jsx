import { Activity, CalendarDays, TrendingUp } from 'lucide-react'
import { useFilters } from '../context'
import { CITIES } from '../config'

const series = {
  dhaka: [31.2, 32.4, 34.8, 36.1, 37.4, 36.8, 38.2],
  sylhet: [29.4, 30.6, 32.1, 33.5, 34.2, 33.8, 35.1],
}

function formatDate(value) {
  if (!value) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

export default function LstTrendPreview() {
  const { filters } = useFilters()
  const city = CITIES.find((item) => item.id === filters.city) || CITIES[0]
  const values = series[city.id] || series.dhaka
  const points = values.map((value, index) => `${46 + index * 57},${310 - (value - 28) * 20}`).join(' ')
  const area = `46,330 ${points} 388,330`

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800"><TrendingUp size={14} className="text-orange-500" aria-hidden="true" /> {city.name} temperature trend</p>
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-700 ring-1 ring-inset ring-orange-100">7-year outlook</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#07152d]">
        <svg viewBox="0 0 440 390" role="img" aria-label={`Illustrative LST trend for ${city.name}`} className="block h-96 w-full">
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fb7185" stopOpacity=".55" /><stop offset="1" stopColor="#fb7185" stopOpacity="0" /></linearGradient>
            <linearGradient id="trend-line" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#38bdf8" /><stop offset=".5" stopColor="#facc15" /><stop offset="1" stopColor="#fb7185" /></linearGradient>
          </defs>
          {[90, 150, 210, 270, 330].map((y, index) => <g key={y}><line x1="46" x2="400" y1={y} y2={y} stroke="#93c5fd" strokeOpacity=".13" /><text x="12" y={y + 4} fill="#94a3b8" fontSize="9">{40 - index * 3}°</text></g>)}
          <polygon points={area} fill="url(#trend-fill)" />
          <polyline points={points} fill="none" stroke="url(#trend-line)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {values.map((value, index) => <g key={`${value}-${index}`}><circle cx={46 + index * 57} cy={310 - (value - 28) * 20} r="5" fill="#fff" stroke={index === values.length - 1 ? '#fb7185' : '#38bdf8'} strokeWidth="3" /><text x={46 + index * 57} y="354" textAnchor="middle" fill="#cbd5e1" fontSize="9">{2034 + index}</text></g>)}
        </svg>
        <div className="absolute left-3 top-3 rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-white backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-200">Average LST</p>
          <p className="mt-1 text-lg font-bold">36.8°C <span className="text-xs font-semibold text-rose-400">+1.7°C</span></p>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-white/15 bg-slate-950/85 px-3 py-2.5 text-[10px] text-slate-300 backdrop-blur-md">
          <span className="inline-flex items-center gap-1.5"><Activity size={12} className="text-cyan-400" aria-hidden="true" /> Gradual warming pattern</span>
          <span className="font-semibold text-rose-300">Peak 38.2°C</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-2 font-semibold text-blue-800"><CalendarDays size={13} aria-hidden="true" /> {formatDate(filters.date)}</span>
        <span className="rounded-lg bg-amber-50 px-2.5 py-2 font-semibold text-amber-800">Illustrative trend · {filters.scenario.toUpperCase()}</span>
      </div>
    </div>
  )
}
