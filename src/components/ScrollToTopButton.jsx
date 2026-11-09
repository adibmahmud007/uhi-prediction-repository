import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 320)
    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      title="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed right-3 top-1/2 z-[700] grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/25 bg-[#0b1220]/95 text-cyan-200 shadow-[0_12px_30px_-8px_rgba(2,6,23,0.72)] backdrop-blur-md transition-[opacity,transform,visibility,background-color,color] duration-300 hover:bg-blue-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-cyan-300 active:scale-95 lg:hidden motion-reduce:transition-none ${visible ? 'visible opacity-100' : 'invisible translate-x-4 opacity-0'}`}
    >
      <span className="absolute inset-1 rounded-full border border-white/[0.07]" aria-hidden="true" />
      <ArrowUp size={20} strokeWidth={2.3} className="relative" aria-hidden="true" />
    </button>
  )
}
