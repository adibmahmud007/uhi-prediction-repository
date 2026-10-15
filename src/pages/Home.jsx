import { Link } from 'react-router-dom'
import Card from '../components/Card'
import KpiCard from '../components/KpiCard'
import LstMap from '../components/LstMap'
import { WIDGETS, KPIS } from '../config'

const Placeholder = ({ h = 'h-48' }) => (
  <div className={`${h} grid place-items-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400`}>
    Chart placeholder
  </div>
)

export default function Home() {
  return (
    <div className="space-y-6">
      <section aria-labelledby="metrics-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300/60 pb-4">
          <div className="border-l-2 border-accent pl-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Key indicators</p>
            <h2 id="metrics-heading" className="text-lg font-semibold tracking-tight text-slate-900">Heat & environment overview</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {KPIS.map((metric) => <KpiCard key={metric.id} metric={metric} />)}
        </div>
      </section>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {WIDGETS.map((w) => (
          <Card
            key={w.id}
            title={w.title}
            className={w.span}
            action={<Link to={`/${w.id}`} className="text-xs font-semibold text-accent hover:underline">Details</Link>}
          >
            {w.id === 'lst-map' ? <LstMap /> : <Placeholder />}
          </Card>
        ))}
      </div>
    </div>
  )
}
