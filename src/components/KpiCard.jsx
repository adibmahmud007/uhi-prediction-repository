import Card from './Card'

const themes = {
  'predicted-lst': { accent: 'from-amber-300/80 to-orange-400/20', text: 'text-amber-200', icon: 'border-amber-200/20 bg-amber-300/[0.08] text-amber-200', description: 'text-amber-100/80', glow: 'bg-amber-400/10' },
  'uhi-intensity': { accent: 'from-rose-300/80 to-orange-400/20', text: 'text-rose-200', icon: 'border-rose-200/20 bg-rose-300/[0.08] text-rose-200', description: 'text-rose-100/80', glow: 'bg-rose-400/10' },
  'hotspot-area': { accent: 'from-violet-300/80 to-indigo-400/20', text: 'text-violet-200', icon: 'border-violet-200/20 bg-violet-300/[0.08] text-violet-200', description: 'text-violet-100/80', glow: 'bg-violet-400/10' },
  'high-risk-population': { accent: 'from-sky-300/80 to-blue-400/20', text: 'text-sky-200', icon: 'border-sky-200/20 bg-sky-300/[0.08] text-sky-200', description: 'text-sky-100/80', glow: 'bg-sky-400/10' },
  'vegetation-cover': { accent: 'from-emerald-300/80 to-teal-400/20', text: 'text-emerald-200', icon: 'border-emerald-200/20 bg-emerald-300/[0.08] text-emerald-200', description: 'text-emerald-100/80', glow: 'bg-emerald-400/10' },
  'water-bodies': { accent: 'from-cyan-300/80 to-blue-400/20', text: 'text-cyan-200', icon: 'border-cyan-200/20 bg-cyan-300/[0.08] text-cyan-200', description: 'text-cyan-100/80', glow: 'bg-cyan-400/10' },
}

export default function KpiCard({ metric }) {
  const { label, value, unit, description, icon: Icon } = metric
  const theme = themes[metric.id] || themes['water-bodies']

  return (
    <Card className="relative flex h-full min-w-0 flex-col overflow-hidden border-blue-950/55 bg-[#0a1b2d]/80 shadow-[0_16px_38px_-18px_rgba(3,18,38,0.82)] ring-1 ring-inset ring-blue-400/10 transition-[border-color,box-shadow] duration-200 hover:border-blue-800/70 hover:shadow-[0_20px_44px_-18px_rgba(5,37,72,0.88)] motion-reduce:transition-none">
      <div className="absolute inset-0 scale-110 bg-cover bg-center opacity-55 blur-[4px] saturate-75" style={{ backgroundImage: "url('/kpi-glass-city.png')" }} aria-hidden="true" />
      <div className="absolute inset-0 backdrop-blur-[10px]" style={{ background: 'radial-gradient(ellipse at center, rgba(20, 61, 88, 0.42) 0%, rgba(6, 21, 38, 0.76) 72%, rgba(3, 11, 23, 0.88) 100%)' }} aria-hidden="true" />
      <div className={`absolute -right-10 -top-12 h-32 w-32 rounded-full blur-3xl ${theme.glow}`} aria-hidden="true" />
      <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
      <div className={`absolute inset-x-0 top-0 z-20 h-0.5 bg-linear-to-r ${theme.accent}`} aria-hidden="true" />
      <div className="relative z-10 mb-3 flex items-center gap-3 pt-0.5">
        <div className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-[0_6px_14px_-7px_rgba(14,116,144,0.55)] backdrop-blur-xl ${theme.icon}`}>
          <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
        </div>
        <span className="h-px flex-1 bg-blue-200/15" aria-hidden="true" />
      </div>
      <h3 className={`relative z-10 min-h-8 text-[13px] font-medium leading-5 tracking-[0.01em] ${theme.text}`}>{label}</h3>
      <p className="relative z-10 mb-3 mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-white">
        <span className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] tabular-nums">{value}</span>
        <span className={`text-sm font-medium ${theme.text}`}>{unit}</span>
      </p>
      <div className="relative z-10 -mx-4 -mb-4 mt-auto min-h-14 border-t border-blue-300/10 bg-blue-950/20 px-4 py-2.5 shadow-[inset_0_1px_0_rgba(125,211,252,0.04)] backdrop-blur-xl">
        <p className={`text-[13px] font-medium leading-5.5 tracking-[0.004em] ${theme.description}`}>{description}</p>
      </div>
    </Card>
  )
}
