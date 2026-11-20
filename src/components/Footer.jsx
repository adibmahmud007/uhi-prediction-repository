import { useEffect, useRef, useState } from 'react'
import { Check, Copy, ExternalLink, Globe2, Mail, MapPin, Orbit, Satellite, Waves } from 'lucide-react'

const contactItems = [
  {
    label: 'Official Website',
    value: 'sparrso.gov.bd',
    href: 'https://sparrso.gov.bd',
    icon: Globe2,
  },
  {
    label: 'Official Email',
    value: 'admin@sparrso.gov.bd',
    href: 'mailto:admin@sparrso.gov.bd',
    icon: Mail,
  },
  {
    label: 'Office',
    value: 'Agargaon, Dhaka 1207',
    href: 'https://maps.google.com/?q=SPARRSO+Agargaon+Dhaka',
    icon: MapPin,
  },
]

export default function Footer() {
  const [emailCopied, setEmailCopied] = useState(false)
  const copyFeedbackTimer = useRef(null)

  useEffect(() => () => clearTimeout(copyFeedbackTimer.current), [])

  const copyEmail = async () => {
    await navigator.clipboard.writeText('admin@sparrso.gov.bd')
    setEmailCopied(true)
    clearTimeout(copyFeedbackTimer.current)
    copyFeedbackTimer.current = setTimeout(() => setEmailCopied(false), 1800)
  }

  return (
    <footer className="relative mt-8 overflow-hidden border-t border-blue-800/40 bg-[#0b1220] font-sans text-slate-300">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-400/80 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 top-4 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-cyan-500/[0.07] blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-5 pt-9 sm:pt-10 min-[1600px]:w-[88%] min-[1600px]:max-w-none min-[1600px]:px-6">
        <div className="grid gap-9 border-b border-white/10 pb-8 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1fr] lg:gap-12">
          <div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <img
                src="/sparrso-popup-transparent.png"
                alt="SPARRSO Urban Heat Island Analytics"
                className="h-auto w-36 shrink-0 object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)] sm:w-40"
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Research & Analytics</p>
                <h2 className="mt-2 text-lg font-bold leading-snug tracking-tight text-white">Urban Heat Island Analytics</h2>
                <p className="mt-1.5 text-sm font-semibold text-blue-100">Atmospheric Division, SPARRSO</p>
              </div>
            </div>
            <p className="mt-5 max-w-xl text-[12px] leading-6 text-slate-400">
              A geospatial decision-support dashboard for monitoring land surface temperature, urban heat intensity and environmental risk patterns.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">Institution</p>
            <h3 className="mt-3 text-sm font-semibold leading-6 text-white">Bangladesh Space Research and Remote Sensing Organization</h3>
            <p className="mt-2 text-[12px] leading-5 text-slate-400">Ministry of Defence<br />Government of the People&apos;s Republic of Bangladesh</p>

            <div className="mt-5 flex items-center gap-2.5" aria-label="Research focus">
              {[Satellite, Orbit, Waves].map((Icon, index) => (
                <span key={index} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] text-cyan-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">Connect with SPARRSO</p>
            <div className="mt-3 space-y-2.5">
              {contactItems.map(({ label, value, href, icon: Icon }) => {
                const isEmail = href.startsWith('mailto:')

                return (
                  <div key={label} className="group flex items-center rounded-xl border border-white/[0.08] bg-white/[0.035] transition-[border-color,background-color,transform] duration-200 hover:translate-x-0.5 hover:border-cyan-300/25 hover:bg-white/[0.065] motion-reduce:transform-none motion-reduce:transition-none">
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-cyan-300 ring-1 ring-inset ring-blue-300/10">
                        <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
                        <span className="mt-0.5 block truncate text-[12px] font-medium text-slate-200">{value}</span>
                      </span>
                      {href.startsWith('http') && <ExternalLink size={13} className="shrink-0 text-slate-500 transition-colors group-hover:text-cyan-300" aria-hidden="true" />}
                    </a>
                    {isEmail && (
                      <button
                        type="button"
                        onClick={copyEmail}
                        className="mr-2 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.055] px-2 text-[10px] font-semibold text-slate-300 transition-colors hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        aria-label="Copy official email address"
                      >
                        {emailCopied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                        <span>{emailCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-5 text-[10px] leading-5 text-slate-500 sm:flex-row sm:items-end sm:justify-between">
          <p>© {new Date().getFullYear()} SPARRSO · Atmospheric Division · Urban Heat Island Analytics</p>
          <p className="sm:text-right">
            <span className="block text-slate-400">Developed by <span className="font-semibold text-blue-200">Adib Mahmud</span></span>
            <span className="block">JRF, SPARRSO</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
