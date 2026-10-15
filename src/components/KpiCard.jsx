import Card from './Card'

const themes = {
  'predicted-lst': { accent: 'from-amber-400 to-orange-500', icon: 'from-amber-500 to-orange-600 shadow-orange-500/20' },
  'uhi-intensity': { accent: 'from-orange-400 to-rose-500', icon: 'from-orange-500 to-rose-600 shadow-rose-500/20' },
  'hotspot-area': { accent: 'from-violet-400 to-indigo-500', icon: 'from-violet-500 to-indigo-600 shadow-violet-500/20' },
  'high-risk-population': { accent: 'from-blue-400 to-indigo-500', icon: 'from-blue-500 to-indigo-600 shadow-indigo-500/20' },
  'vegetation-cover': { accent: 'from-emerald-400 to-teal-500', icon: 'from-emerald-500 to-teal-600 shadow-emerald-500/20' },
  'water-bodies': { accent: 'from-cyan-400 to-blue-500', icon: 'from-cyan-500 to-blue-600 shadow-cyan-500/20' },
}

export default function KpiCard({ metric }) {
  const { label, value, unit, description, icon: Icon } = metric
  const theme = themes[metric.id] || themes['water-bodies']

  return (
    <Card className="relative flex h-full min-w-0 flex-col overflow-hidden shadow-[0_4px_16px_-8px_rgba(30,64,175,0.24)]">
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-linear-to-r ${theme.accent}`} aria-hidden="true" />
      <div className="mb-4 flex items-center gap-3">
        <div className={`inline-flex shrink-0 rounded-xl bg-linear-to-br p-2.5 text-white shadow-md ring-1 ring-inset ring-white/20 ${theme.icon}`}>
          <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
        </div>
        <span className="h-px flex-1 bg-linear-to-r from-blue-200 to-blue-50" aria-hidden="true" />
      </div>
      <h3 className="min-h-10 text-xs font-semibold leading-5 tracking-wide text-blue-700">{label}</h3>
      <p className="mb-5 mt-1 flex flex-wrap items-baseline gap-x-1.5 text-blue-950">
        <span className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] tabular-nums">{value}</span>
        <span className="text-sm font-medium text-blue-600">{unit}</span>
      </p>
      <div className="-mx-4 -mb-4 mt-auto min-h-18 border-t border-blue-300/30 bg-linear-to-r from-blue-700 via-indigo-700 to-indigo-800 px-4 py-3">
        <p className="text-xs font-medium leading-5 text-blue-50">{description}</p>
      </div>
    </Card>
  )
}
