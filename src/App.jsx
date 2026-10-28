import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import FilterBar from './components/FilterBar'
import StartupLogoModal from './components/StartupLogoModal'
import Home from './pages/Home'
import Detail from './pages/Detail'

export default function App() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <StartupLogoModal />
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <header className="border-b border-blue-900/60 bg-gray-800 font-sans shadow-[0_8px_28px_-16px_rgba(15,23,42,0.5)]">
        <div className="mx-auto max-w-7xl space-y-5 px-4 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="navigation-panel" className="group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-slate-100 shadow-sm shadow-black/20 transition-[background-color,border-color,box-shadow] duration-200 hover:border-blue-200 hover:bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-200 motion-reduce:transition-none">
              <span className="relative block h-4 w-5" aria-hidden="true">
                <span className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-slate-800 transition-transform duration-200 motion-reduce:transition-none ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
                <span className={`absolute left-0 top-[7px] h-0.5 rounded-full bg-indigo-600 transition-[width,opacity] duration-200 motion-reduce:transition-none ${open ? 'w-5 opacity-0' : 'w-3.5 group-hover:w-5'}`} />
                <span className={`absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-slate-800 transition-transform duration-200 motion-reduce:transition-none ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
              </span>
            </button>
            <img src="/logo-header-dark-bg.png" alt="Urban Heat Island Analytics logo" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" />
            <div className="min-w-0">
              <h1 className="text-base font-bold leading-tight tracking-tight text-white sm:text-xl">Urban Heat Island Analytics</h1>
              <p className="mt-1 text-xs font-medium leading-5 text-blue-100/85 sm:text-sm">Predicted LST and UHI for <span className="font-semibold text-blue-50">Dhaka</span> and <span className="font-semibold text-blue-50">Sylhet</span></p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <FilterBar />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:id" element={<Detail />} />
        </Routes>
      </main>
    </>
  )
}
