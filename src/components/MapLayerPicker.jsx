import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Layers2, X } from 'lucide-react'
import { HAS_TOMTOM_KEY, MAP_TYPES } from '../mapLayers'

export default function MapLayerPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const dismiss = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  const close = () => {
    setOpen(false)
    buttonRef.current?.focus()
  }

  return (
    <div ref={rootRef} className="relative">
      <button ref={buttonRef} type="button" aria-expanded={open} aria-controls={panelId} aria-label={`Map layers: ${MAP_TYPES[value].label}`} onClick={() => setOpen((current) => !current)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        <Layers2 size={16} className="text-indigo-600" aria-hidden="true" />
        Layers <span className="border-l border-slate-200 pl-2 font-medium text-slate-500">{MAP_TYPES[value].label}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} role="region" aria-label="Map layers" className="absolute left-0 top-full z-20 mt-3 w-[min(320px,calc(100vw-4rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/15">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Map type</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">Choose your view of the city</p>
            </div>
            <button type="button" onClick={close} aria-label="Close map layers" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-600"><X size={16} aria-hidden="true" /></button>
          </div>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Basemap style">
            {Object.entries(MAP_TYPES).map(([id, { label, description, icon: Icon, requiresKey }]) => (
              <button key={id} type="button" disabled={requiresKey && !HAS_TOMTOM_KEY} aria-pressed={value === id} title={requiresKey && !HAS_TOMTOM_KEY ? 'Map data is not connected yet' : description} onClick={() => { onChange(id); close() }} className={`group rounded-xl border p-1.5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 ${value === id ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50'}`}>
                <span className="map-style-preview relative mb-1.5 flex h-12 items-center justify-center overflow-hidden rounded-lg" data-style={id}>
                  <Icon size={20} strokeWidth={1.8} className="relative drop-shadow-sm" aria-hidden="true" />
                  {value === id && <span className="absolute right-1 top-1 rounded-full bg-indigo-600 p-0.5 text-white"><Check size={9} strokeWidth={3} aria-hidden="true" /></span>}
                </span>
                <span className="text-[11px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 border-t border-slate-100 pt-3 text-[10px] leading-4 text-slate-500">The Traffic switch works across all map types.</p>
        </div>
      )}
    </div>
  )
}
