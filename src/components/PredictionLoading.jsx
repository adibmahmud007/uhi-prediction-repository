import { CITIES } from '../config'
import { useFilters } from '../context'
import PredictionGlobe from './PredictionGlobe'

export default function PredictionLoading({ duration }) {
  const { filters } = useFilters()
  const city = CITIES.find((item) => item.id === filters.city) ?? CITIES[0]

  return (
    <main
      aria-labelledby="prediction-loading-heading"
      className="prediction-loading-panel w-full text-center"
      style={{ '--prediction-duration': `${duration}ms` }}
    >
      <PredictionGlobe duration={duration} />

      <div className="prediction-loading-copy border-t border-white/10 bg-[#091425]">
        <h1 id="prediction-loading-heading" className="font-bold tracking-tight text-balance text-white">
          UHI &amp; LST Prediction Loading
        </h1>
        <p className="mt-1.5 text-sm leading-snug text-slate-300">
          Preparing demo results for <span className="font-semibold text-sky-100">{city.name}</span>
        </p>
        <div aria-hidden="true" className="prediction-progress-track mx-auto h-1 w-full max-w-56 overflow-hidden rounded-full bg-slate-700/80 motion-reduce:hidden">
          <div className="prediction-loading-progress h-full rounded-full bg-linear-to-r from-blue-500 via-sky-400 to-sky-200" />
        </div>
        <p className="mt-2 text-[10px] text-slate-400">Earth imagery: NASA Blue Marble</p>
      </div>
    </main>
  )
}
