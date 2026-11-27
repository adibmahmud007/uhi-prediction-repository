import { useEffect, useRef } from 'react'
import { createEarthRenderer, createSoftwareEarth, loadEarthImage } from '../predictionEarth'
import { drawStarfield, getMoonSprite } from '../predictionSpace'
import './SpaceBackdrop.css'

const radians = Math.PI / 180

export default function SpaceBackdrop({ variant = 'landing' }) {
  const isHeader = variant === 'dashboard'
  const sceneRef = useRef(null)
  const systemRef = useRef(null)
  const earthRef = useRef(null)
  const fallbackRef = useRef(null)
  const skyRef = useRef(null)
  const moonRef = useRef(null)

  useEffect(() => {
    const scene = sceneRef.current
    const system = systemRef.current
    const earth = earthRef.current
    const fallback = fallbackRef.current
    const sky = skyRef.current
    const moon = moonRef.current
    const skyContext = sky.getContext('2d')
    const fallbackContext = fallback.getContext('2d')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let renderer
    let softwareEarth
    let asset
    let disposed = false
    let inView = true
    let lastPaint = 0
    let time = 0
    let scroll = 0
    let targetScroll = 0
    let paintEarthAt = -Infinity

    moon.getContext('2d')?.drawImage(getMoonSprite(), 0, 0)

    const draw = (now) => {
      frame = 0
      const delta = lastPaint ? Math.min(32, now - lastPaint) : 0
      lastPaint = now
      if (motion.matches) {
        scroll = 0
        time = 0
      } else {
        scroll += (targetScroll - scroll) * (1 - Math.exp(-delta / 165))
        time += delta / 1000
      }

      if (!isHeader) {
        system.style.setProperty('--earth-drop', `${(scroll * 31).toFixed(2)}vh`)
        system.style.setProperty('--earth-scale', (1 - scroll * .28).toFixed(3))
      }
      moon.style.setProperty('--moon-float', `${(Math.sin(time * .95) * 5).toFixed(2)}px`)
      if (skyContext) drawStarfield(skyContext, time / 14 + scroll * 2.2, .86)

      const shouldPaintEarth = isHeader
        ? paintEarthAt === -Infinity
        : now - paintEarthAt >= (softwareEarth && !motion.matches ? 32 : 0)
      if (shouldPaintEarth) {
        const camera = {
          latitude: 19 * radians,
          longitude: 79 * radians + (isHeader ? 0 : time * .115 + scroll * Math.PI * 2),
          radius: earth.width * .405,
          approach: 0,
        }
        if (renderer) renderer.draw(camera)
        else if (softwareEarth && fallbackContext) {
          fallbackContext.clearRect(0, 0, fallback.width, fallback.height)
          softwareEarth(fallbackContext, camera)
        }
        paintEarthAt = now
      }

      if (inView && !document.hidden && !motion.matches) frame = requestAnimationFrame(draw)
    }

    const redraw = () => {
      if (!frame && inView && !document.hidden) frame = requestAnimationFrame(draw)
    }

    const readScroll = () => {
      const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      targetScroll = Math.min(1, Math.max(0, window.scrollY / range))
      redraw()
    }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.4)
      const side = Math.max(2, Math.min(1000, Math.round(system.clientWidth * ratio)))
      for (const canvas of [earth, fallback]) canvas.width = canvas.height = side
      const skyRatio = Math.min(ratio, 1920 / Math.max(scene.clientWidth, 1))
      sky.width = Math.max(1, Math.round(scene.clientWidth * skyRatio))
      sky.height = Math.max(1, Math.round(scene.clientHeight * skyRatio))
      paintEarthAt = -Infinity
      if (isHeader) redraw()
      else readScroll()
    }

    const recover = () => {
      if (!asset || disposed) return
      renderer = null
      softwareEarth ??= createSoftwareEarth(asset)
      paintEarthAt = -Infinity
      redraw()
    }

    loadEarthImage().then((image) => {
      if (disposed || !image) return
      asset = image
      renderer = createEarthRenderer(earth, image)
      if (!renderer) recover()
      paintEarthAt = -Infinity
      redraw()
    })

    const syncVisibility = () => {
      if (document.hidden || !inView) {
        cancelAnimationFrame(frame)
        frame = 0
      } else {
        lastPaint = 0
        redraw()
      }
    }

    const observer = new ResizeObserver(resize)
    observer.observe(scene)
    observer.observe(system)
    const viewportObserver = isHeader && window.IntersectionObserver
      ? new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting
          scene.dataset.offscreen = String(!inView)
          syncVisibility()
        })
      : null
    viewportObserver?.observe(scene)
    if (!isHeader) window.addEventListener('scroll', readScroll, { passive: true })
    document.addEventListener('visibilitychange', syncVisibility)
    motion.addEventListener('change', redraw)
    earth.addEventListener('webglcontextlost', recover)
    resize()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      viewportObserver?.disconnect()
      window.removeEventListener('scroll', readScroll)
      document.removeEventListener('visibilitychange', syncVisibility)
      motion.removeEventListener('change', redraw)
      earth.removeEventListener('webglcontextlost', recover)
      renderer?.dispose()
    }
  }, [isHeader])

  return (
    <div ref={sceneRef} className={`space-backdrop space-backdrop--${variant}`} aria-hidden="true">
      <canvas ref={skyRef} className="space-starfield" />
      <div ref={systemRef} className="space-earth-system">
        <canvas ref={moonRef} className="space-moon" width={144} height={144} />
        <canvas ref={earthRef} className="space-earth" />
        <canvas ref={fallbackRef} className="space-earth" />
      </div>
      <div className="space-scrim" />
      {isHeader && (
        <>
          <span className="space-craft space-satellite">
            <span className="space-satellite-body" />
            <span className="space-satellite-dish" />
          </span>
          <span className="space-craft space-rocket">
            <span className="space-rocket-fins" />
            <span className="space-rocket-body" />
          </span>
        </>
      )}
    </div>
  )
}
