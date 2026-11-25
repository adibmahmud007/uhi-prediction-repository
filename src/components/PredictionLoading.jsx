import { CITIES } from '../config'
import { useFilters } from '../context'
import PredictionGlobe from './PredictionGlobe'

export default function PredictionLoading({ duration }) {
  const { filters } = useFilters()
  const city = CITIES.find((item) => item.id === filters.city) ?? CITIES[0]

  return (
    <section
      aria-labelledby="prediction-loading-heading"
      className="prediction-loading-panel grid w-full justify-items-center overflow-hidden rounded-2xl border border-slate-800 text-center shadow-lg shadow-slate-900/10"
      style={{ '--prediction-duration': `${duration}ms` }}
    >
      <PredictionGlobe duration={duration} />

      <div className="w-full border-t border-white/10 bg-[#091425] px-5 py-5 sm:py-6">
        <h2 id="prediction-loading-heading" className="text-2xl font-bold tracking-tight text-balance text-white sm:text-3xl">
          UHI &amp; LST Prediction Loading
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Preparing demo results for <span className="font-semibold text-sky-100">{city.name}</span>
        </p>
        <div aria-hidden="true" className="mx-auto mt-5 h-1 w-full max-w-56 overflow-hidden rounded-full bg-slate-700/80 motion-reduce:hidden">
          <div className="prediction-loading-progress h-full rounded-full bg-linear-to-r from-blue-500 via-sky-400 to-sky-200" />
        </div>
        <p className="mt-3 text-[10px] text-slate-400">Earth imagery: NASA Blue Marble</p>
      </div>
    </section>
  )
}
