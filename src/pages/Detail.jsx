import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Card from '../components/Card'
import { WIDGETS } from '../config'

export default function Detail() {
  const { id } = useParams()
  const w = WIDGETS.find((x) => x.id === id)
  if (!w) return <Navigate to="/" replace />

  return (
    <div className="space-y-3">
      <div>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <h1 className="mt-1 text-xl font-bold">{w.title}</h1>
        <p className="text-sm text-slate-500">{w.desc}</p>
      </div>
      <Card title="Main view">
        <div className="grid h-80 place-items-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">Full-size visual</div>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        <Card title="Analysis"><p className="text-sm text-slate-400">Detailed analysis for this component goes here.</p></Card>
        <Card title="Comparison"><p className="text-sm text-slate-400">Compare with 2025 baseline or another city.</p></Card>
      </div>
    </div>
  )
}
