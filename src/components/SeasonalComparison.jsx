import { MapPin } from 'lucide-react'
import { useFilters } from '../context'
import { CITIES } from '../config'

const years = ['2036', '2037', '2038', '2039', '2040']
const chartBounds = { left: 42, right: 362, top: 24, bottom: 188, min: 22, max: 40 }

const seasonalData = {
  dhaka: [
    { label: 'Pre-monsoon', color: '#fb7185', values: [34.8, 36.4, 35.5, 37.6, 36.7] },
    { label: 'Monsoon', color: '#38bdf8', values: [31.2, 30.4, 32.3, 31.5, 33.1] },
    { label: 'Post-monsoon', color: '#facc15', values: [32.4, 33.6, 32.7, 34.5, 33.8] },
    { label: 'Winter', color: '#a78bfa', values: [25.1, 24.3, 26.1, 25.2, 26.8] },
  ],
  sylhet: [
    { label: 'Pre-monsoon', color: '#fb7185', values: [32.9, 34.1, 33.3, 35.2, 34.5] },
    { label: 'Monsoon', color: '#38bdf8', values: [29.2, 28.5, 30.3, 29.6, 31.0] },
    { label: 'Post-monsoon', color: '#facc15', values: [30.5, 31.6, 30.8, 32.7, 31.9] },
    { label: 'Winter', color: '#a78bfa', values: [23.5, 22.8, 24.6, 23.8, 25.2] },
  ],
}

function pointFor(value, index) {
  const x = chartBounds.left + index * ((chartBounds.right - chartBounds.left) / (years.length - 1))
  const y = chartBounds.bottom - ((value - chartBounds.min) / (chartBounds.max - chartBounds.min)) * (chartBounds.bottom - chartBounds.top)
  return { x, y }
}

export default function SeasonalComparison() {
  const { filters } = useFilters()
  const city = CITIES.find((item) => item.id === filters.city) || CITIES[0]
  const series = seasonalData[city.id] || seasonalData.dhaka
  const ticks = [24, 28, 32, 36, 40]

  return (
    <div className="flex h-[304px] flex-col overflow-hidden rounded-2xl border border-blue-950/10 bg-[#07152d] shadow-[0_16px_32px_-24px_rgba(15,23,42,0.9)]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-100">
          <MapPin size={13} className="text-cyan-400" aria-hidden="true" />
          {city.name} seasonal LST
        </span>
        <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-blue-200 ring-1 ring-inset ring-blue-300/20">
          2036–2040
        </span>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-1.5 px-3 pt-3" aria-label="Season legend">
        {series.map((season) => (
          <div key={season.label} className="flex min-w-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.045] px-2 py-1.5">
            <span className="h-0.5 w-4 shrink-0 rounded-full shadow-[0_0_7px_currentColor]" style={{ backgroundColor: season.color, color: season.color }} aria-hidden="true" />
            <span className="truncate text-[9px] font-semibold text-slate-200">{season.label}</span>
          </div>
        ))}
      </div>

      <div className="relative min-h-0 flex-1 px-1 pb-1 pt-1">
        <div className="absolute left-1/2 top-1/2 h-28 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
        <svg viewBox="0 0 390 222" role="img" aria-label={`${city.name} seasonal temperature comparison from 2036 to 2040`} className="relative block h-full min-h-0 w-full">
          <defs>
            <filter id="season-line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {ticks.map((tick) => {
            const { y } = pointFor(tick, 0)
            return (
              <g key={tick}>
                <line x1={chartBounds.left} x2={chartBounds.right} y1={y} y2={y} stroke="#93c5fd" strokeOpacity=".14" strokeDasharray="3 5" />
                <text x="10" y={y + 3} fill="#94a3b8" fontSize="9">{tick}°</text>
              </g>
            )
          })}

          {years.map((year, index) => {
            const { x } = pointFor(chartBounds.min, index)
            return <text key={year} x={x} y="211" textAnchor="middle" fill="#94a3b8" fontSize="9">{year}</text>
          })}

          {series.map((season) => {
            const points = season.values.map(pointFor)
            return (
              <g key={season.label} filter="url(#season-line-glow)">
                <polyline points={points.map(({ x, y }) => `${x},${y}`).join(' ')} fill="none" stroke={season.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                {points.map(({ x, y }, index) => (
                  <circle key={`${season.label}-${years[index]}`} cx={x} cy={y} r="3.5" fill="#07152d" stroke={season.color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                ))}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
