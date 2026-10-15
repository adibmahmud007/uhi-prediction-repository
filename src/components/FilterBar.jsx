import { CalendarDays, ChevronDown, Clock3, Layers3, MapPin, Play } from 'lucide-react'
import { useFilters } from '../context'
import { CITIES, SCALES, SCENARIOS } from '../config'

const field = 'h-12 w-full min-w-0 rounded-xl border border-white/70 bg-[#f5f7fc] py-2 pl-10 pr-10 text-sm font-semibold tracking-normal text-[#172544] shadow-sm shadow-black/10 transition-[background-color,border-color,box-shadow] duration-200 hover:border-blue-200 hover:bg-white focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-300/25 motion-reduce:transition-none'
const labelStyle = 'flex min-w-0 flex-col gap-2 text-xs font-semibold tracking-wide text-blue-100'
const iconStyle = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-800'

function Select({ label, value, onChange, options, icon: Icon }) {
  return (
    <label className={labelStyle}>
      {label}
      <span className="relative block">
        <Icon size={17} strokeWidth={1.8} className={iconStyle} aria-hidden="true" />
        <select className={`${field} cursor-pointer appearance-none`} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <ChevronDown size={16} strokeWidth={2} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-800" aria-hidden="true" />
      </span>
    </label>
  )
}

export default function FilterBar() {
  const { filters: f, set } = useFilters()
  return (
    <fieldset className="grid min-w-0 grid-cols-1 items-end gap-4 min-[420px]:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1fr_1fr_auto]">
      <legend className="sr-only">Prediction filters</legend>
      <Select label="Location" value={f.city} onChange={(v) => set('city', v)} options={CITIES} icon={MapPin} />
      <label className={labelStyle}>
        Prediction date
        <span className="relative block">
          <CalendarDays size={17} strokeWidth={1.8} className={iconStyle} aria-hidden="true" />
          <input type="date" className={`${field} pr-3 [color-scheme:light]`} value={f.date} min="2026-01-01" max="2050-12-31" onChange={(e) => set('date', e.target.value)} />
        </span>
      </label>
      <Select label="Temporal scale" value={f.scale} onChange={(v) => set('scale', v)} options={SCALES} icon={Clock3} />
      <Select label="Scenario" value={f.scenario} onChange={(v) => set('scenario', v)} options={SCENARIOS} icon={Layers3} />
      <button type="button" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-blue-300/30 bg-linear-to-r from-blue-700 via-indigo-700 to-indigo-800 px-6 text-sm font-semibold text-white shadow-md shadow-black/20 transition-[filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-indigo-950/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-200 active:brightness-95 min-[420px]:col-span-2 lg:col-span-1 motion-reduce:transition-none">
        <Play size={15} strokeWidth={2} aria-hidden="true" />
        Run prediction
      </button>
    </fieldset>
  )
}
