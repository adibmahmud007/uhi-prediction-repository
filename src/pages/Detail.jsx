import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Card from '../components/Card'
import MapDetailView from '../components/MapDetailView'
import { WIDGETS } from '../config'

export default function Detail() {
  const { id } = useParams()
  const w = WIDGETS.find((x) => x.id === id)
  if (!w) return <Navigate to="/" replace />
  const isMapDetail = id === 'lst-map' || id === 'uhi-map'

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-300/70 pb-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 transition-colors hover:text-blue-900 hover:underline">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Detailed spatial analysis</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{w.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{w.desc}</p>
      </div>
      {isMapDetail ? (
        <MapDetailView mode={id === 'uhi-map' ? 'uhi' : 'lst'} />
      ) : (
        <>
          <Card title="Main view">
            <div className="grid h-80 place-items-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">Full-size visual</div>
          </Card>
          <div className="grid gap-3 md:grid-cols-2">
            <Card title="Analysis"><p className="text-sm text-slate-400">Detailed analysis for this component goes here.</p></Card>
            <Card title="Comparison"><p className="text-sm text-slate-400">Compare with 2025 baseline or another city.</p></Card>
          </div>
        </>
      )}
    </div>
  )
}
