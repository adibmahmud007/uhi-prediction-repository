import { MapPin } from 'lucide-react'
import { useFilters } from '../context'
import { CITIES } from '../config'

const distributions = {
  dhaka: [
    { label: 'Critical', value: 18, color: '#fb7185' },
    { label: 'High', value: 34, color: '#f97316' },
    { label: 'Moderate', value: 30, color: '#facc15' },
    { label: 'Low', value: 18, color: '#22c55e' },
  ],
  sylhet: [
    { label: 'Critical', value: 11, color: '#fb7185' },
    { label: 'High', value: 26, color: '#f97316' },
    { label: 'Moderate', value: 36, color: '#facc15' },
    { label: 'Low', value: 27, color: '#22c55e' },
  ],
}

export default function HeatRiskDistribution() {
  const { filters } = useFilters()
  const city = CITIES.find((item) => item.id === filters.city) || CITIES[0]
  const data = distributions[city.id] || distributions.dhaka
  const elevatedRisk = data[0].value + data[1].value
  let offset = 0

  return (
    <div className="flex h-[304px] flex-col overflow-hidden rounded-2xl border border-blue-950/10 bg-[#07152d] shadow-[0_16px_32px_-24px_rgba(15,23,42,0.9)]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-100">
          <MapPin size={13} className="text-cyan-400" aria-hidden="true" />
          {city.name} study area
        </span>
        <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-blue-200 ring-1 ring-inset ring-blue-300/20">
          Area share
        </span>
      </div>

      <div className="relative grid min-h-0 flex-1 grid-cols-[1.08fr_0.92fr] items-center gap-2 overflow-hidden px-3 py-3">
        <div className="absolute -left-12 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-44">
          <svg viewBox="0 0 160 160" role="img" aria-label={`${city.name} heat risk distribution: ${data.map((item) => `${item.label} ${item.value} percent`).join(', ')}`} className="block h-auto w-full -rotate-90">
            <circle cx="80" cy="80" r="56" fill="none" stroke="#172554" strokeWidth="25" />
            {data.map((item) => {
              const segmentOffset = offset
              offset += item.value
              return (
                <circle
                  key={item.label}
                  cx="80"
                  cy="80"
                  r="56"
                  pathLength="100"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="25"
                  strokeDasharray={`${Math.max(item.value - 1.4, 0)} ${100 - Math.max(item.value - 1.4, 0)}`}
                  strokeDashoffset={-segmentOffset}
                  strokeLinecap="round"
                />
              )
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
            <strong className="text-2xl font-bold tracking-tight text-white tabular-nums">{elevatedRisk}%</strong>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-blue-200">Elevated risk</span>
          </div>
        </div>

        <div className="space-y-2 pr-1" aria-label="Heat risk legend">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-2 py-1.5">
              <span className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-slate-200">
                <span className="h-2 w-2 shrink-0 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </span>
              <strong className="text-[11px] font-bold text-white tabular-nums">{item.value}%</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 bg-blue-950/50 px-3 py-2 text-[9px] font-medium text-blue-200">
        Illustrative land-area distribution · {filters.scenario.toUpperCase()}
      </div>
    </div>
  )
}
