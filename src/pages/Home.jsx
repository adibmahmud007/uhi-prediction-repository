import { Link } from 'react-router-dom'
import Card from '../components/Card'
import KpiCard from '../components/KpiCard'
import LstMap from '../components/RealLstMap'
import LstTrendPreview from '../components/LstTrendPreview'
import HeatRiskDistribution from '../components/HeatRiskDistribution'
import SeasonalComparison from '../components/SeasonalComparison'
import EnvironmentalFactors from '../components/EnvironmentalFactors'
import HotspotEvolution from '../components/HotspotEvolution'
import Recommendations from '../components/Recommendations'
import { WIDGETS, KPIS } from '../config'

const Placeholder = ({ h = 'h-48' }) => (
  <div className={`${h} grid place-items-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400`}>
    Chart placeholder
  </div>
)

export default function Home({ isRevealing, waitForStartupLogo }) {
  return (
    <div className={`grid grid-cols-1 gap-[36px] ${isRevealing ? 'prediction-results-reveal' : ''}`}>
      <section aria-labelledby="metrics-heading" className="space-y-4">
        <div className="prediction-results-heading flex flex-wrap items-center justify-between gap-3 border-b border-slate-300/60 pb-4">
          <div className="border-l-2 border-accent pl-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Key indicators</p>
            <h2 id="metrics-heading" className="text-lg font-semibold tracking-tight text-slate-900">Heat & environment overview</h2>
          </div>
        </div>
        <div className="prediction-kpi-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {KPIS.map((metric) => <KpiCard key={metric.id} metric={metric} waitForStartupLogo={waitForStartupLogo} />)}
        </div>
      </section>
      <div className="prediction-widget-grid grid grid-cols-1 gap-3 lg:grid-cols-12">
        {WIDGETS.map((w) => (
          <Card
            key={w.id}
            title={w.title}
            titleClassName="text-base/5 font-bold tracking-tight text-slate-950"
            className={w.span}
            action={<Link to={`/${w.id}`} className="shrink-0 text-xs font-semibold text-accent hover:underline">Details</Link>}
          >
            {w.id === 'lst-map' && <LstMap />}
            {w.id === 'uhi-map' && <LstMap mode="uhi" />}
            {w.id === 'lst-trend' && <LstTrendPreview />}
            {w.id === 'hotspot-distribution' && <HeatRiskDistribution />}
            {w.id === 'seasonal' && <SeasonalComparison />}
            {w.id === 'env-factors' && <EnvironmentalFactors />}
            {w.id === 'hotspot-evolution' && <HotspotEvolution />}
            {w.id === 'recommendations' && <Recommendations />}
            {!['lst-map', 'uhi-map', 'lst-trend', 'hotspot-distribution', 'seasonal', 'env-factors', 'hotspot-evolution', 'recommendations'].includes(w.id) && <Placeholder />}
          </Card>
        ))}
      </div>
    </div>
  )
}
