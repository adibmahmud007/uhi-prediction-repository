import Card from './Card'

const colors = {
  copper: { accent: 'bg-amber-700/70', icon: 'bg-amber-50 text-amber-800 ring-amber-800/10' },
  slate: { accent: 'bg-slate-500', icon: 'bg-slate-100 text-slate-600 ring-slate-600/10' },
  teal: { accent: 'bg-teal-600', icon: 'bg-teal-50 text-teal-800 ring-teal-800/10' },
  blue: { accent: 'bg-sky-700/80', icon: 'bg-sky-50 text-sky-800 ring-sky-800/10' },
}

export default function KpiCard({ metric }) {
  const { label, value, unit, description, icon: Icon, color } = metric
  const theme = colors[color] || colors.slate

  return (
    <Card className="relative flex h-full min-w-0 flex-col overflow-hidden shadow-[0_2px_8px_-4px_rgba(15,23,42,0.15)]">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${theme.accent}`} aria-hidden="true" />
      <div className="mb-4 flex items-center gap-3">
        <div className={`inline-flex shrink-0 rounded-lg p-2.5 ring-1 ring-inset ${theme.icon}`}>
          <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
        </div>
        <span className="h-px flex-1 bg-slate-100" aria-hidden="true" />
      </div>
      <h3 className="min-h-10 text-xs font-semibold leading-5 tracking-wide text-slate-500">{label}</h3>
      <p className="mb-5 mt-1 flex flex-wrap items-baseline gap-x-1.5 text-slate-900">
        <span className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] tabular-nums">{value}</span>
        <span className="text-sm font-medium text-slate-500">{unit}</span>
      </p>
      <p className="mt-auto min-h-14 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">{description}</p>
    </Card>
  )
}
