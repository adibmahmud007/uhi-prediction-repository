import Card from './Card'

export default function KpiCard({ metric }) {
  const { label, value, unit, description, icon: Icon } = metric

  return (
    <Card className="relative flex h-full min-w-0 flex-col overflow-hidden border-slate-200 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.38)] transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-[0_12px_28px_-16px_rgba(15,23,42,0.42)] motion-reduce:transition-none">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[#0b1220]" aria-hidden="true" />
      <div className="mb-4 flex items-center gap-3 pt-0.5">
        <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-[#0b1220] bg-slate-50 text-[#0b1220] shadow-[0_6px_14px_-6px_rgba(11,18,32,0.5)]">
          <Icon size={20} strokeWidth={1.65} aria-hidden="true" />
        </div>
        <span className="h-px flex-1 bg-[#0b1220]/25" aria-hidden="true" />
      </div>
      <h3 className="min-h-10 text-[13px] font-semibold leading-5 tracking-[0.01em] text-[#0b1220]">{label}</h3>
      <p className="mb-5 mt-1 flex flex-wrap items-baseline gap-x-1.5 text-slate-950">
        <span className="text-[2.15rem] font-bold leading-tight tracking-[-0.045em] tabular-nums">{value}</span>
        <span className="text-[15px] font-semibold text-[#0b1220]">{unit}</span>
      </p>
      <div className="-mx-4 -mb-4 mt-auto min-h-18 border-t border-[#0b1220] bg-[#0b1220] px-4 py-3.5">
        <p className="text-[13px] font-medium leading-5.5 tracking-[0.005em] text-slate-100">{description}</p>
      </div>
    </Card>
  )
}
