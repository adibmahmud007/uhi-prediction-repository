import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { X, LayoutDashboard, ChevronRight } from 'lucide-react'
import { WIDGETS } from '../config'

const link = ({ isActive }) =>
  `group flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200 motion-reduce:transition-none ${
    isActive
      ? 'border-blue-300/30 bg-linear-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white shadow-md shadow-black/20'
      : 'border-transparent text-blue-100 hover:border-white/10 hover:bg-white/5 hover:text-white'
  }`

function SidebarLink({ to, end, icon: Icon, title, onClose }) {
  return (
    <NavLink to={to} end={end} className={link} onClick={onClose}>
      {({ isActive }) => (
        <>
          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${isActive ? 'bg-white/15 text-white ring-white/20' : 'bg-white/5 text-blue-200 ring-white/10 group-hover:text-white'}`}>
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 leading-5">{title}</span>
          <ChevronRight size={15} className={`shrink-0 transition-opacity duration-200 motion-reduce:transition-none ${isActive ? 'text-blue-100 opacity-100' : 'text-blue-200 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`} aria-hidden="true" />
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        id="navigation-panel"
        aria-hidden={!open}
        inert={open ? undefined : ''}
        className={`fixed inset-y-0 left-0 z-50 flex w-88 max-w-[calc(100vw-1rem)] flex-col border-r border-white/10 bg-gray-800 font-sans text-white shadow-2xl shadow-black/30 transition-transform duration-200 motion-reduce:transition-none ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-5">
          <img src="/logo-header-dark-bg.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-5 tracking-tight text-white">Urban Heat Island</p>
            <p className="mt-0.5 text-xs font-semibold tracking-wide text-blue-200">Analytics</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-100 transition-colors duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200 motion-reduce:transition-none"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Main navigation" className="sidebar-scroll min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4">
          <div className="space-y-2">
            <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200/80">Overview</p>
            <SidebarLink to="/" end icon={LayoutDashboard} title="Dashboard" onClose={onClose} />
          </div>
          <div className="space-y-2 border-t border-white/10 pt-4">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200/80">Detailed analysis</p>
            {WIDGETS.map(({ id, title, icon }) => (
              <SidebarLink key={id} to={`/${id}`} icon={icon} title={title} onClose={onClose} />
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
}
