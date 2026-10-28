import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

const LOGO_SRC = '/sparrso-popup-transparent.png'

export default function StartupLogoModal() {
  const [visible, setVisible] = useState(true)
  const [canClose, setCanClose] = useState(false)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!visible) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => {
      setCanClose(true)
      window.requestAnimationFrame(() => closeRef.current?.focus())
    }, 2000)

    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = previousOverflow
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="SPARRSO Urban Heat Island Analytics logo">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px]" aria-hidden="true" />
      <div className="absolute inset-0 bg-blue-400/[0.04]" aria-hidden="true" />
      <div className="relative z-10 h-[min(500px,calc(100vh-2rem))] w-[min(600px,calc(100vw-2rem))]">
        {canClose && (
          <button ref={closeRef} type="button" onClick={() => setVisible(false)} aria-label="Close logo" className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-lg transition-[background-color,color,transform] duration-200 hover:scale-105 hover:bg-slate-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 motion-reduce:transition-none">
            <X size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>
        )}
        <img src={LOGO_SRC} alt="SPARRSO Urban Heat Island Analytics" className="h-full w-full object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.45)]" />
      </div>
    </div>
  )
}
