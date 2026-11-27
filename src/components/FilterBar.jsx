import { CalendarDays, ChevronDown, Clock3, Layers3, MapPin, Play } from 'lucide-react'
import { useFilters } from '../context'
import { CITIES, SCALES, SCENARIOS } from '../config'

const field = 'dashboard-filter-field block h-12 w-full min-w-0 rounded-xl py-2 pl-10 text-[15px] font-bold tracking-[0.01em]'
const labelStyle = 'flex min-w-0 flex-col gap-2 text-[13px] font-semibold tracking-[0.015em] text-white'
const iconStyle = 'pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-sky-300'

function Select({ label, value, onChange, options, icon: Icon }) {
  return (
    <label className={labelStyle}>
      {label}
      <span className="relative block">
        <Icon size={17} strokeWidth={1.8} className={iconStyle} aria-hidden="true" />
        <select className={`${field} cursor-pointer appearance-none pr-9`} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <ChevronDown size={16} strokeWidth={2} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sky-200" aria-hidden="true" />
      </span>
    </label>
  )
}

export default function FilterBar({ onRunPrediction }) {
  const { filters: f, set } = useFilters()

  const handleSubmit = (event) => {
    event.preventDefault()
    onRunPrediction()
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="grid min-w-0 grid-cols-1 items-end gap-4 min-[420px]:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1fr_1fr_auto]">
        <legend className="sr-only">Prediction filters</legend>
        <Select label="Location" value={f.city} onChange={(v) => set('city', v)} options={CITIES} icon={MapPin} />
        <label className={labelStyle}>
          Prediction date
          <span className="relative block">
            <CalendarDays size={17} strokeWidth={1.8} className={iconStyle} aria-hidden="true" />
            <input type="date" className={`${field} pr-3`} value={f.date} min="2026-01-01" max="2050-12-31" required onChange={(e) => set('date', e.target.value)} />
          </span>
        </label>
        <Select label="Temporal scale" value={f.scale} onChange={(v) => set('scale', v)} options={SCALES} icon={Clock3} />
        <Select label="Scenario" value={f.scenario} onChange={(v) => set('scenario', v)} options={SCENARIOS} icon={Layers3} />
        <button type="submit" className="dashboard-run-button inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-200 min-[420px]:col-span-2 lg:col-span-1">
          <Play size={15} strokeWidth={2} aria-hidden="true" />
          Run prediction
        </button>
      </fieldset>
    </form>
  )
}
