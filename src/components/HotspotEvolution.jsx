import { AlertTriangle, CalendarRange, GitBranch, MapPin, TrendingUp } from 'lucide-react'
import { useFilters } from '../context'
import { CITIES } from '../config'

const evolutionByCity = {
  dhaka: {
    years: ['2025', '2030', '2035', '2040', '2045'],
    areas: [72, 84, 98, 113, 128.4],
    zones: [7, 9, 12, 15, 18],
  },
  sylhet: {
    years: ['2025', '2030', '2035', '2040', '2045'],
    areas: [48, 56, 68, 81, 94],
    zones: [4, 6, 8, 10, 13],
  },
}

const chart = { left: 52, right: 730, top: 26, bottom: 214, min: 40, max: 140 }

function chartPoint(value, index, length) {
  const x = chart.left + index * ((chart.right - chart.left) / (length - 1))
  const y = chart.bottom - ((value - chart.min) / (chart.max - chart.min)) * (chart.bottom - chart.top)
  return { x, y }
}

export default function HotspotEvolution() {
  const { filters } = useFilters()
  const city = CITIES.find((item) => item.id === filters.city) || CITIES[0]
  const data = evolutionByCity[city.id] || evolutionByCity.dhaka
  const points = data.areas.map((value, index) => chartPoint(value, index, data.areas.length))
  const pointString = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const areaString = `${chart.left},${chart.bottom} ${pointString} ${chart.right},${chart.bottom}`
  const growth = Math.round(((data.areas.at(-1) - data.areas[0]) / data.areas[0]) * 100)

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-950/10 bg-[#07152d] shadow-[0_18px_38px_-26px_rgba(15,23,42,0.95)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <MapPin size={15} className="text-cyan-400" aria-hidden="true" />
            {city.name} hotspot expansion
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Projected growth of heat-affected urban area</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-200 ring-1 ring-inset ring-indigo-300/20">
          <CalendarRange size={13} aria-hidden="true" /> 2025–2045 outlook
        </span>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[250px_minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          <div className="col-span-2 rounded-xl border border-rose-300/15 bg-linear-to-br from-rose-400/15 to-orange-400/5 p-3.5 lg:col-span-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-rose-200">
              <TrendingUp size={13} aria-hidden="true" /> Projected area
            </span>
            <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-white tabular-nums">
              {data.areas.at(-1)} <span className="text-sm font-semibold text-rose-200">km²</span>
            </p>
            <p className="mt-1 text-[11px] font-medium text-rose-200/80">+{growth}% from the 2025 baseline</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
            <GitBranch size={15} className="text-violet-300" aria-hidden="true" />
            <p className="mt-2 text-xl font-bold text-white tabular-nums">{data.zones.at(-1)}</p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-400">Critical zones</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
            <AlertTriangle size={15} className="text-amber-300" aria-hidden="true" />
            <p className="mt-2 text-xl font-bold text-white tabular-nums">High</p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-400">Growth pressure</p>
          </div>
        </div>

        <div className="relative min-h-[280px] overflow-hidden rounded-xl border border-white/10 bg-blue-950/35 p-2 sm:p-3">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-3xl" aria-hidden="true" />
          <svg viewBox="0 0 760 260" role="img" aria-label={`${city.name} hotspot area rises from ${data.areas[0]} to ${data.areas.at(-1)} square kilometres between 2025 and 2045`} className="relative block h-full min-h-[260px] w-full">
            <defs>
              <linearGradient id="evolution-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fb7185" stopOpacity=".48" />
                <stop offset="1" stopColor="#fb7185" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="evolution-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#38bdf8" />
                <stop offset=".52" stopColor="#facc15" />
                <stop offset="1" stopColor="#fb7185" />
              </linearGradient>
              <filter id="evolution-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {[40, 60, 80, 100, 120, 140].map((tick) => {
              const { y } = chartPoint(tick, 0, data.areas.length)
              return (
                <g key={tick}>
                  <line x1={chart.left} x2={chart.right} y1={y} y2={y} stroke="#93c5fd" strokeOpacity=".12" strokeDasharray="4 6" />
                  <text x="10" y={y + 4} fill="#94a3b8" fontSize="10">{tick}</text>
                </g>
              )
            })}

            <polygon points={areaString} fill="url(#evolution-area)" />
            <polyline points={pointString} fill="none" stroke="url(#evolution-line)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#evolution-glow)" />

            {points.map(({ x, y }, index) => (
              <g key={data.years[index]}>
                <circle cx={x} cy={y} r="6" fill="#07152d" stroke={index === points.length - 1 ? '#fb7185' : '#38bdf8'} strokeWidth="3" />
                <text x={x} y={y - 14} textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">{data.areas[index]}</text>
                <text x={x} y="243" textAnchor="middle" fill="#94a3b8" fontSize="10">{data.years[index]}</text>
              </g>
            ))}
          </svg>
          <span className="pointer-events-none absolute left-3 top-3 rounded-lg border border-white/10 bg-slate-950/70 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.11em] text-blue-100 backdrop-blur-md">
            Hotspot area · km²
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-blue-950/45 px-4 py-2.5 text-[10px] text-blue-200">
        <span>Illustrative urban heat expansion model</span>
        <span className="font-semibold uppercase tracking-[0.1em]">{filters.scenario}</span>
      </div>
    </div>
  )
}
