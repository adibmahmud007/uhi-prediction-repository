import { useEffect, useMemo, useRef, useState } from 'react'
import Card from './Card'

const GAUGE_START = 150
const GAUGE_SWEEP = 240
const CENTER = { x: 90, y: 86 }
const RADIUS = 61

const gaugeSettings = {
  'predicted-lst': { min: 20, max: 50, step: 0.1, colors: ['#16a34a', '#facc15', '#dc2626'] },
  'uhi-intensity': { min: 0, max: 8, step: 0.1, colors: ['#16a34a', '#facc15', '#dc2626'] },
  'hotspot-area': { min: 0, max: 200, step: 0.1, colors: ['#fecaca', '#f87171', '#b91c1c'] },
  'high-risk-population': { min: 0, max: 2, step: 0.01, colors: ['#e2e8f0', '#94a3b8', '#111827'] },
  'vegetation-cover': { min: 0, max: 50, step: 0.1, colors: ['#bbf7d0', '#4ade80', '#047857'] },
  'water-bodies': { min: 0, max: 20, step: 0.1, colors: ['#bae6fd', '#38bdf8', '#1d4ed8'] },
}

function polarPoint(angle, radius = RADIUS) {
  const radians = (angle * Math.PI) / 180
  return {
    x: CENTER.x + radius * Math.cos(radians),
    y: CENTER.y + radius * Math.sin(radians),
  }
}

function arcPath(startAngle, endAngle) {
  const start = polarPoint(startAngle)
  const end = polarPoint(endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

function cleanText(text = '') {
  return text.replaceAll('Â', '').replaceAll('â€“', '–')
}

function decimalsFor(value) {
  const decimal = String(value).replace('+', '').split('.')[1]
  return decimal?.length || 0
}

export default function KpiCard({ metric }) {
  const { label, value, unit, description } = metric
  const settings = gaugeSettings[metric.id] || gaugeSettings['water-bodies']
  const originalValue = Number.parseFloat(value)
  const decimals = decimalsFor(value)
  const targetPercent = ((originalValue - settings.min) / (settings.max - settings.min)) * 100
  const [percent, setPercent] = useState(0)
  const [dragging, setDragging] = useState(false)
  const svgRef = useRef(null)

  useEffect(() => {
    let frame
    let settleTimer

    const runStartupSweep = () => {
      setPercent(0)
      frame = requestAnimationFrame(() => setPercent(100))
      settleTimer = window.setTimeout(
        () => setPercent(Math.min(100, Math.max(0, targetPercent))),
        900,
      )
    }

    window.addEventListener('startup-logo-closed', runStartupSweep)
    if (window.__startupLogoClosed) {
      setPercent(Math.min(100, Math.max(0, targetPercent)))
    }
    return () => {
      window.removeEventListener('startup-logo-closed', runStartupSweep)
      cancelAnimationFrame(frame)
      window.clearTimeout(settleTimer)
    }
  }, [targetPercent])

  const displayedValue = useMemo(
    () => settings.min + ((settings.max - settings.min) * percent) / 100,
    [percent, settings],
  )

  const formattedValue = `${String(value).startsWith('+') && displayedValue > 0 ? '+' : ''}${displayedValue.toFixed(decimals)}`
  const needleAngle = GAUGE_START + (percent / 100) * GAUGE_SWEEP
  const currentColor = settings.colors[Math.min(settings.colors.length - 1, Math.floor((percent / 100) * settings.colors.length))]

  const setFromPointer = (event) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 180
    const y = ((event.clientY - rect.top) / rect.height) * 146
    let angle = (Math.atan2(y - CENTER.y, x - CENTER.x) * 180) / Math.PI
    if (angle < GAUGE_START) angle += 360
    const next = ((Math.min(GAUGE_START + GAUGE_SWEEP, Math.max(GAUGE_START, angle)) - GAUGE_START) / GAUGE_SWEEP) * 100
    setPercent(next)
  }

  const nudge = (direction) => {
    const stepPercent = (settings.step / (settings.max - settings.min)) * 100
    setPercent((current) => Math.min(100, Math.max(0, current + direction * stepPercent)))
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      nudge(1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      nudge(-1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setPercent(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setPercent(100)
    }
  }

  return (
    <Card className="group relative flex min-h-[350px] min-w-0 flex-col overflow-hidden border-slate-200/90 bg-linear-to-b from-white to-slate-50/90 shadow-[0_14px_32px_-20px_rgba(15,23,42,0.42)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_20px_38px_-20px_rgba(15,23,42,0.5)] sm:min-h-[330px] lg:min-h-[310px] xl:min-h-[280px] motion-reduce:transform-none motion-reduce:transition-none">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[#0b1220]" aria-hidden="true" />

      <div className="pt-0.5">
        <h3 className="text-[14px] font-bold leading-5 tracking-[-0.01em] text-slate-900">{label}</h3>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 180 146"
        className={`mx-auto -my-1 block w-full max-w-[310px] select-none outline-none sm:max-w-[285px] lg:max-w-[270px] xl:w-[122%] xl:max-w-[248px] xl:-translate-x-[9%] ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ touchAction: 'pan-y' }}
        role="slider"
        tabIndex="0"
        aria-label={`${label} gauge`}
        aria-valuemin={settings.min}
        aria-valuemax={settings.max}
        aria-valuenow={Number(displayedValue.toFixed(decimals))}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          setDragging(true)
          event.currentTarget.setPointerCapture(event.pointerId)
          setFromPointer(event)
        }}
        onPointerMove={(event) => dragging && setFromPointer(event)}
        onPointerUp={(event) => {
          setDragging(false)
          event.currentTarget.releasePointerCapture(event.pointerId)
        }}
        onPointerCancel={() => setDragging(false)}
      >
        <defs>
          <linearGradient id={`gauge-gradient-${metric.id}`} x1="37" y1="0" x2="143" y2="0" gradientUnits="userSpaceOnUse">
            {settings.colors.map((color, index) => (
              <stop key={color} offset={`${(index / (settings.colors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </linearGradient>
        </defs>
        <circle cx={CENTER.x} cy={CENTER.y} r="49" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        <path
          d={arcPath(GAUGE_START, GAUGE_START + GAUGE_SWEEP)}
          fill="none"
          stroke={`url(#gauge-gradient-${metric.id})`}
          strokeLinecap="round"
          strokeWidth="12"
        />

        {[0, 20, 40, 60, 80, 100].map((mark) => {
          const angle = GAUGE_START + (mark / 100) * GAUGE_SWEEP
          const outer = polarPoint(angle, 53)
          const inner = polarPoint(angle, 46)
          const text = polarPoint(angle, 73)
          const scaleValue = settings.min + ((settings.max - settings.min) * mark) / 100
          return (
            <g key={mark}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#475569" strokeWidth="1" />
              <text x={text.x} y={text.y} textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontWeight="700">
                {Number.isInteger(scaleValue) ? scaleValue : scaleValue.toFixed(1)}
              </text>
            </g>
          )
        })}

        <g
          className={dragging ? '' : 'transition-transform duration-700 ease-out motion-reduce:transition-none'}
          style={{ transform: `rotate(${needleAngle - 270}deg)`, transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
        >
          <line x1={CENTER.x} y1={CENTER.y + 7} x2={CENTER.x} y2={CENTER.y - 43} stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx={CENTER.x} cy={CENTER.y} r="6.5" fill="#fff" stroke="#0f172a" strokeWidth="3" />
          <circle cx={CENTER.x} cy={CENTER.y} r="2.2" fill={currentColor} />
        </g>

        <text x={CENTER.x} y="114" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="750" letterSpacing="-0.5">
          {formattedValue}
        </text>
        <text x={CENTER.x} y="126" textAnchor="middle" fill={currentColor} fontSize="8" fontWeight="700">
          {cleanText(unit)}
        </text>
      </svg>

      <div className="mt-auto h-[66px] shrink-0 border-t border-slate-200/80 pt-2.5 xl:h-[58px]">
        <p className="text-[15px] font-medium leading-6 text-slate-600 xl:text-[13px] xl:leading-[1.35rem]">{cleanText(description)}</p>
      </div>
    </Card>
  )
}
