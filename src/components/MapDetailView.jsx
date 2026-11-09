import { Activity, AlertTriangle, CalendarDays, MapPinned, Radio, ThermometerSun, TrendingUp, Users } from 'lucide-react'
import RealLstMap from './RealLstMap'
import { useFilters } from '../context'
import { CITIES } from '../config'

const monitoringZones = [
  { name: 'Mirpur', lst: '39.1°C', uhi: '+4.8°C', risk: 'High' },
  { name: 'Tejgaon', lst: '40.2°C', uhi: '+5.2°C', risk: 'Critical' },
  { name: 'Ramna', lst: '40.5°C', uhi: '+5.3°C', risk: 'Critical' },
  { name: 'Shyampur', lst: '41.0°C', uhi: '+5.5°C', risk: 'Critical' },
]

const detailContent = {
  lst: {
    eyebrow: 'Land surface temperature',
    summary: [
      { label: 'Average LST', value: '36.8°C', icon: ThermometerSun, color: 'text-orange-600', surface: 'bg-orange-50 ring-orange-100' },
      { label: 'Peak LST', value: '41.0°C', icon: TrendingUp, color: 'text-rose-600', surface: 'bg-rose-50 ring-rose-100' },
      { label: 'Hotspot Area', value: '128.4 km²', icon: MapPinned, color: 'text-violet-600', surface: 'bg-violet-50 ring-violet-100' },
      { label: 'Monitoring Points', value: '38', icon: Radio, color: 'text-blue-600', surface: 'bg-blue-50 ring-blue-100' },
    ],
    scaleLabel: 'Thermal severity profile',
    scaleStart: '31°C',
    scaleEnd: '42°C',
    gradient: 'from-emerald-500 via-amber-400 to-rose-600',
  },
  uhi: {
    eyebrow: 'Urban heat island intensity',
    summary: [
      { label: 'Mean Intensity', value: '+4.2°C', icon: Activity, color: 'text-fuchsia-600', surface: 'bg-fuchsia-50 ring-fuchsia-100' },
      { label: 'Peak Intensity', value: '+5.5°C', icon: TrendingUp, color: 'text-rose-600', surface: 'bg-rose-50 ring-rose-100' },
      { label: 'High-risk Zones', value: '12', icon: AlertTriangle, color: 'text-amber-600', surface: 'bg-amber-50 ring-amber-100' },
      { label: 'Population Exposed', value: '1.24 M', icon: Users, color: 'text-blue-600', surface: 'bg-blue-50 ring-blue-100' },
    ],
    scaleLabel: 'UHI severity profile',
    scaleStart: '+1.5°C',
    scaleEnd: '+5.7°C',
    gradient: 'from-blue-600 via-violet-500 to-rose-600',
  },
}

function formatDate(value) {
  if (!value) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

export default function MapDetailView({ mode = 'lst' }) {
  const { filters } = useFilters()
  const city = CITIES.find((item) => item.id === filters.city) || CITIES[0]
  const content = detailContent[mode] || detailContent.lst

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.55)] sm:p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">{content.eyebrow}</p>
            <h2 className="mt-1 text-base font-bold text-slate-900">Interactive spatial analysis</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-2 text-blue-800 ring-1 ring-inset ring-blue-100">
              <CalendarDays size={13} aria-hidden="true" /> {formatDate(filters.date)}
            </span>
            <span className="rounded-lg bg-indigo-50 px-2.5 py-2 uppercase tracking-[0.08em] text-indigo-700 ring-1 ring-inset ring-indigo-100">{filters.scenario}</span>
          </div>
        </div>
        <RealLstMap mode={mode} expanded />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.55)] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Analysis summary</p>
              <h2 className="mt-1 text-base font-bold text-slate-900">{city.name} thermal profile</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700 ring-1 ring-inset ring-emerald-100">Model output</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {content.summary.map(({ label, value, icon: Icon, color, surface }) => (
              <div key={label} className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset ${surface}`}>
                  <Icon size={15} strokeWidth={1.9} className={color} aria-hidden="true" />
                </span>
                <p className="mt-2 text-[10px] font-medium text-slate-500">{label}</p>
                <p className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
              <span>{content.scaleLabel}</span>
              <span>Low → High</span>
            </div>
            <div className={`mt-2.5 h-2.5 rounded-full bg-linear-to-r ${content.gradient}`} />
            <div className="mt-1.5 flex justify-between text-[9px] font-bold text-slate-500 tabular-nums">
              <span>{content.scaleStart}</span>
              <span>{content.scaleEnd}</span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_36px_-28px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Priority locations</p>
              <h2 className="mt-1 text-base font-bold text-slate-900">Monitoring zone insights</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-rose-700 ring-1 ring-inset ring-rose-100">
              <Radio size={11} aria-hidden="true" /> Live view
            </span>
          </div>

          <div className="divide-y divide-slate-200 px-4 sm:px-5">
            {monitoringZones.map((zone, index) => (
              <div key={zone.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0b1220] text-[10px] font-bold text-white shadow-sm">{String(index + 1).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{zone.name}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-500">LST {zone.lst} · UHI {zone.uhi}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ring-1 ring-inset ${zone.risk === 'Critical' ? 'bg-rose-50 text-rose-700 ring-rose-100' : 'bg-orange-50 text-orange-700 ring-orange-100'}`}>{zone.risk}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-blue-50/60 px-4 py-3 text-[10px] font-medium leading-5 text-blue-800 sm:px-5">
            Select any numbered point on the map to inspect its complete LST, air temperature and UHI profile.
          </div>
        </section>
      </div>
    </div>
  )
}
