import { ArrowUpRight, Building2, Droplets, HeartPulse, MapPin, ShieldCheck, TreePine } from 'lucide-react'
import { useFilters } from '../context'
import { CITIES } from '../config'

const actions = [
  {
    title: 'Expand Urban Greenery',
    detail: 'Prioritize roadside trees and connected shade corridors in critical wards.',
    target: '+12% canopy',
    impact: 'Up to −1.4°C',
    priority: 'High priority',
    icon: TreePine,
    color: '#34d399',
    surface: 'from-emerald-400/15 to-emerald-400/[0.03]',
  },
  {
    title: 'Scale Cool Roofs',
    detail: 'Apply high-albedo coatings to dense residential and public buildings.',
    target: '2.8 km² roofs',
    impact: 'Up to −1.1°C',
    priority: 'High priority',
    icon: Building2,
    color: '#38bdf8',
    surface: 'from-sky-400/15 to-sky-400/[0.03]',
  },
  {
    title: 'Protect Blue Networks',
    detail: 'Restore canals, retention ponds and permeable edges around growth zones.',
    target: '+18% retention',
    impact: 'Lower flood heat',
    priority: 'Medium priority',
    icon: Droplets,
    color: '#60a5fa',
    surface: 'from-blue-400/15 to-blue-400/[0.03]',
  },
  {
    title: 'Heat Action Planning',
    detail: 'Activate ward alerts, cooling points and outreach for vulnerable residents.',
    target: '18 risk zones',
    impact: '1.24M protected',
    priority: 'Immediate',
    icon: HeartPulse,
    color: '#fb7185',
    surface: 'from-rose-400/15 to-rose-400/[0.03]',
  },
]

export default function Recommendations() {
  const { filters } = useFilters()
  const city = CITIES.find((item) => item.id === filters.city) || CITIES[0]

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-950/10 bg-[#07152d] shadow-[0_18px_38px_-26px_rgba(15,23,42,0.95)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <MapPin size={15} className="text-cyan-400" aria-hidden="true" />
            Priority actions for {city.name}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Targeted interventions based on the current heat-risk profile</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-200 ring-1 ring-inset ring-emerald-300/20">
          <ShieldCheck size={13} aria-hidden="true" /> 4 priority actions
        </span>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ title, detail, target, impact, priority, icon: Icon, color, surface }, index) => (
          <article key={title} className={`group relative flex min-h-[228px] flex-col overflow-hidden rounded-xl border border-white/10 bg-linear-to-br ${surface} p-4 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_30px_-20px_rgba(0,0,0,0.85)] motion-reduce:transform-none motion-reduce:transition-none`}>
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl" style={{ backgroundColor: `${color}24` }} aria-hidden="true" />
            <div className="relative flex items-start justify-between gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07]" style={{ color }}>
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="text-[10px] font-bold tabular-nums text-slate-500">0{index + 1}</span>
            </div>

            <h3 className="relative mt-4 text-[15px] font-semibold text-white">{title}</h3>
            <p className="relative mt-2 text-[11px] leading-5 text-slate-300">{detail}</p>

            <div className="relative mt-auto grid grid-cols-2 gap-2 pt-4">
              <div className="rounded-lg border border-white/[0.08] bg-slate-950/30 px-2.5 py-2">
                <span className="block text-[8px] font-bold uppercase tracking-[0.1em] text-slate-500">Target</span>
                <strong className="mt-1 block text-[11px] text-white">{target}</strong>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-slate-950/30 px-2.5 py-2">
                <span className="block text-[8px] font-bold uppercase tracking-[0.1em] text-slate-500">Impact</span>
                <strong className="mt-1 block text-[11px]" style={{ color }}>{impact}</strong>
              </div>
            </div>

            <div className="relative mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color }}>{priority}</span>
              <ArrowUpRight size={14} className="text-slate-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-blue-950/45 px-4 py-2.5 text-[10px] text-blue-200">
        <span>Illustrative planning guidance · Validate with local field data</span>
        <span className="font-semibold uppercase tracking-[0.1em]">{filters.scenario}</span>
      </div>
    </div>
  )
}
