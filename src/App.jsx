import { useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import FilterBar from './components/FilterBar'
import PredictionLoading from './components/PredictionLoading'
import Footer from './components/Footer'
import ScrollToTopButton from './components/ScrollToTopButton'
import SpaceBackdrop from './components/SpaceBackdrop'
import Home from './pages/Home'
import Detail from './pages/Detail'
import LandingPage from './pages/LandingPage'

const DEMO_PREDICTION_MS = 5800
const RESULT_REVEAL_MS = 1100

export default function App() {
  const [open, setOpen] = useState(false)
  const [predictionPhase, setPredictionPhase] = useState('idle')
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === '/'
  const isPredicting = predictionPhase === 'predicting'
  const isRevealing = predictionPhase === 'revealing'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname, isPredicting])

  useEffect(() => {
    if (predictionPhase === 'idle') return undefined

    const timer = window.setTimeout(
      () => setPredictionPhase(isPredicting ? 'revealing' : 'idle'),
      isPredicting ? DEMO_PREDICTION_MS : RESULT_REVEAL_MS,
    )
    return () => window.clearTimeout(timer)
  }, [predictionPhase, isPredicting])

  const runPrediction = () => {
    if (isPredicting) return
    setPredictionPhase('predicting')
    if (location.pathname !== '/dashboard') navigate('/dashboard')
  }

  if (isLanding) return <LandingPage />

  const predictionStatus = (
    <div role="status" className="sr-only">
      {isPredicting ? 'Running demo LST and UHI prediction.' : isRevealing ? 'Demo prediction results are ready.' : ''}
    </div>
  )

  if (isPredicting) {
    return (
      <>
        {predictionStatus}
        <PredictionLoading duration={DEMO_PREDICTION_MS} />
      </>
    )
  }

  return (
    <>
      {predictionStatus}
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <ScrollToTopButton />
      <div className="flex min-h-screen flex-col">
        <header className="dashboard-header border-b font-sans">
          <SpaceBackdrop variant="dashboard" />
          <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 min-[1600px]:w-[88%] min-[1600px]:max-w-none min-[1600px]:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="navigation-panel" className="dashboard-header-menu group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-200">
                <span className="relative block h-4 w-5" aria-hidden="true">
                  <span className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-sky-50 transition-transform duration-200 motion-reduce:transition-none ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
                  <span className={`absolute left-0 top-[7px] h-0.5 rounded-full bg-sky-300 transition-[width,opacity] duration-200 motion-reduce:transition-none ${open ? 'w-5 opacity-0' : 'w-3.5 group-hover:w-5'}`} />
                  <span className={`absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-sky-50 transition-transform duration-200 motion-reduce:transition-none ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
                </span>
              </button>
              <img src="/logo-header-dark-bg.png" alt="Urban Heat Island Analytics logo" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" />
              <div className="min-w-0">
                <h1 className="text-base font-bold leading-tight tracking-tight text-white sm:text-xl">Urban Heat Island Analytics</h1>
                <p className="mt-1 text-xs font-medium leading-5 text-blue-100/85 sm:text-sm">Predicted LST and UHI for <span className="font-semibold text-blue-50">Dhaka</span> and <span className="font-semibold text-blue-50">Sylhet</span></p>
              </div>
            </div>
            <div className="p-3 sm:px-4">
              <FilterBar onRunPrediction={runPrediction} />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 min-[1600px]:w-[88%] min-[1600px]:max-w-none min-[1600px]:px-6">
          <Routes>
            <Route path="/dashboard" element={<Home isRevealing={isRevealing} />} />
            <Route path="/:id" element={<Detail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}
