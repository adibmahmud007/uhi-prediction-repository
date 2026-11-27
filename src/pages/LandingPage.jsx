import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowRight, BookOpen, ChevronDown, Flame, Layers3, MapPin, SlidersHorizontal, Thermometer, TrendingUp } from 'lucide-react'
import Footer from '../components/Footer'
import SpaceBackdrop from '../components/SpaceBackdrop'
import { KPIS } from '../config'
import './LandingPage.css'

const layers = [
  { id: 'lst', label: 'LST', name: 'Land surface temperature', metric: KPIS[0], min: 20, max: 50 },
  { id: 'uhi', label: 'UHI', name: 'Urban heat island intensity', metric: KPIS[1], min: 0, max: 8 },
]

const topics = [
  { icon: Thermometer, accent: 'cool', title: 'Land surface temperature', text: 'Explore how warm the surface gets across built-up areas, vegetation and water.' },
  { icon: Flame, accent: 'warm', title: 'Urban heat island intensity', text: 'See how much warmer urban locations can be than their surroundings.' },
  { icon: TrendingUp, accent: 'red', title: 'Heat risk over time', text: 'Compare demo trends and review hotspot area, heat exposure and environmental indicators.' },
]

const workflow = [
  { icon: MapPin, title: 'Choose a location', text: 'Start with Dhaka or Sylhet.' },
  { icon: SlidersHorizontal, title: 'Set a scenario', text: 'Choose a date, time scale and one of the two SSP scenarios.' },
  { icon: Layers3, title: 'Explore the results', text: 'Open the maps, compare indicators and review the charts.' },
]

const guide = [
  {
    title: 'What is the difference between LST and UHI?',
    text: 'Land surface temperature is the temperature of the ground or surface, measured in °C. Urban heat island intensity is a temperature difference in °C between an urban area and its surroundings.',
  },
  {
    title: 'How do I set up a prediction?',
    text: 'In the dashboard, select the location, prediction date, daily, monthly or yearly scale, and SSP2-4.5 or SSP5-8.5. Select Run prediction to open the demo results.',
  },
  {
    title: 'How should I interpret the demo values?',
    text: 'The values and heat-risk charts on this site are illustrative. Use them to explore how the dashboard works. The Earth scene uses NASA Blue Marble imagery for geographic context.',
  },
]

function ThermalPreview() {
  const [activeLayer, setActiveLayer] = useState('lst')
  const { name, metric, min, max } = layers.find((layer) => layer.id === activeLayer)
  const offset = 100 * (Number(metric.value) - min) / (max - min)

  return (
    <section className="landing-glass landing-preview" aria-label="Thermal indicator preview">
      <div className="landing-preview-top">
        <p>Illustrative data</p>
        <div className="landing-layer-control" role="group" aria-label="Preview layer">
          {layers.map(({ id, label }) => (
            <button key={id} type="button" aria-pressed={activeLayer === id} onClick={() => setActiveLayer(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="landing-reading" aria-live="polite">
        <p>{name}</p>
        <strong>{metric.value}<span>{metric.unit}</span></strong>
      </div>
      <div aria-hidden="true" className="landing-meter" data-layer={activeLayer}>
        <div className="landing-meter-ramp"><span style={{ left: `${offset}%` }} /></div>
        <div className="landing-meter-range"><span>{min}°C</span><span>{max}°C</span></div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const navigating = useRef(false)
  const fallbackTimer = useRef(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches || !window.IntersectionObserver) return undefined
    const pieces = [...rootRef.current.querySelectorAll('[data-landing-reveal]')]
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return
        target.dataset.landingReveal = 'shown'
        observer.unobserve(target)
      })
    }, { threshold: .12 })

    pieces.forEach((piece) => {
      if (piece.getBoundingClientRect().top < window.innerHeight) return
      piece.dataset.landingReveal = 'pending'
      observer.observe(piece)
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => window.clearTimeout(fallbackTimer.current), [])

  const openDashboard = (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    event.preventDefault()
    if (navigating.current) return
    navigating.current = true

    if (!document.startViewTransition) {
      setLeaving(true)
      fallbackTimer.current = window.setTimeout(() => navigate('/dashboard'), 260)
      return
    }

    const root = document.documentElement
    root.classList.add('landing-dashboard-transition')
    const transition = document.startViewTransition(() => {
      flushSync(() => navigate('/dashboard'))
      window.scrollTo(0, 0)
    })
    const cleanup = () => root.classList.remove('landing-dashboard-transition')
    transition.finished.then(cleanup, cleanup)
  }

  return (
    <div ref={rootRef} className={`landing-page${leaving ? ' landing-page-leaving' : ''}`}>
      <SpaceBackdrop />
      <main className="landing-content">
        <section className="landing-hero landing-shell" aria-labelledby="landing-title">
          <div className="landing-hero-content">
            <p className="landing-eyebrow"><MapPin size={15} aria-hidden="true" /> Dhaka &amp; Sylhet, Bangladesh</p>
            <h1 id="landing-title">Urban heat,<br /><span>in focus.</span></h1>
            <p className="landing-intro">
              Explore how land surface temperature and urban heat islands vary across two Bangladeshi cities.
            </p>
          </div>

          <div className="landing-glass landing-launch">
            <Layers3 className="landing-launch-icon" size={23} strokeWidth={1.6} aria-hidden="true" />
            <h2>Prediction dashboard</h2>
            <p>Interactive maps and illustrative predictions</p>
            <Link to="/dashboard" className="landing-primary" onClick={openDashboard}>
              Open Prediction Dashboard <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>

          <a className="landing-scroll" href="#explore"><ArrowDown size={16} aria-hidden="true" /> Scroll to explore</a>
        </section>

        <section id="explore" className="landing-shell landing-section" aria-labelledby="landing-explore-title">
          <div className="landing-section-heading" data-landing-reveal data-enter-from="left">
            <p className="landing-eyebrow">Heat indicators</p>
            <h2 id="landing-explore-title">What the heat maps reveal</h2>
          </div>
          <div className="landing-topic-grid">
            {topics.map(({ icon: Icon, accent, title, text }, index) => (
              <article className="landing-glass landing-topic" data-accent={accent} data-landing-reveal data-enter-from={index % 2 === 0 ? 'left' : 'right'} key={title}>
                <Icon size={23} strokeWidth={1.65} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-shell landing-section landing-split" aria-labelledby="landing-demo-title">
          <div className="landing-section-heading" data-landing-reveal data-enter-from="left">
            <p className="landing-eyebrow">Interactive preview</p>
            <h2 id="landing-demo-title">Two measurements.<br />Two views of heat.</h2>
            <p>Select LST or UHI to see how each measure is presented in the dashboard.</p>
          </div>
          <div data-landing-reveal data-enter-from="right"><ThermalPreview /></div>
        </section>

        <section className="landing-shell landing-section" aria-labelledby="landing-workflow-title">
          <div className="landing-section-heading" data-landing-reveal data-enter-from="left">
            <p className="landing-eyebrow">Workflow</p>
            <h2 id="landing-workflow-title">From location to results</h2>
          </div>
          <ol className="landing-steps">
            {workflow.map(({ icon: Icon, title, text }, index) => (
              <li className="landing-step" key={title} data-landing-reveal data-enter-from={index % 2 === 0 ? 'left' : 'right'}>
                <span><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section id="documentation" className="landing-shell landing-section landing-split" aria-labelledby="landing-guide-title">
          <div className="landing-section-heading" data-landing-reveal data-enter-from="left">
            <p className="landing-eyebrow"><BookOpen size={15} aria-hidden="true" /> Documentation</p>
            <h2 id="landing-guide-title">A guide to the dashboard</h2>
            <p>Understand the measures, choose a scenario and know what the demo results represent.</p>
          </div>
          <div className="landing-glass landing-guide" data-landing-reveal data-enter-from="right">
            {guide.map(({ title, text }) => (
              <details key={title}>
                <summary>{title}<ChevronDown size={17} aria-hidden="true" /></summary>
                <p>{text}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="landing-shell landing-section landing-final" aria-labelledby="landing-final-title">
          <div className="landing-glass landing-final-panel" data-landing-reveal data-enter-from="right">
            <h2 id="landing-final-title">Explore urban heat in Bangladesh.</h2>
            <Link to="/dashboard" className="landing-primary" onClick={openDashboard}>
              Open Prediction Dashboard <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
