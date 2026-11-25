import { useEffect, useRef } from 'react'
import { createEarthRenderer, createSoftwareEarth, drawDistrictRings, earthCamera, prepareDistrictRings } from '../predictionEarth'

const EARTH_IMAGE_URL = '/earth-blue-marble.jpg'
let earthImage
let districtRings

function loadEarthImage() {
  earthImage ??= new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = EARTH_IMAGE_URL
  }).catch(() => {
    earthImage = undefined
    return null
  })
  return earthImage
}

function loadDistrictRings() {
  districtRings ??= fetch('/bangladesh-districts.geojson')
    .then((response) => {
      if (!response.ok) throw new Error('District boundaries unavailable')
      return response.json()
    })
    .then(prepareDistrictRings)
    .catch(() => {
      districtRings = undefined
      return []
    })
  return districtRings
}

export default function PredictionGlobe({ duration }) {
  const stageRef = useRef(null)
  const globeRef = useRef(null)
  const boundariesRef = useRef(null)

  useEffect(() => {
    const stage = stageRef.current
    const globe = globeRef.current
    const boundaries = boundariesRef.current
    const ctx = boundaries.getContext('2d')
    if (!ctx) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const start = performance.now()
    let frame
    let disposed = false
    let image
    let rings = []
    let renderer
    let softwareEarth

    const draw = (time) => {
      const progress = reducedMotion.matches ? 1 : Math.min((time - start) / duration, 1)
      const camera = earthCamera(progress, boundaries.width, boundaries.height)
      ctx.clearRect(0, 0, boundaries.width, boundaries.height)
      if (renderer) renderer.draw(camera)
      else if (softwareEarth) softwareEarth(ctx, camera)
      drawDistrictRings(ctx, camera, rings)
      if (progress < 1) frame = requestAnimationFrame(draw)
    }

    const redraw = () => {
      cancelAnimationFrame(frame)
      draw(performance.now())
    }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      const { width, height } = stage.getBoundingClientRect()
      for (const canvas of [globe, boundaries]) {
        canvas.width = Math.max(1, Math.round(width * ratio))
        canvas.height = Math.max(1, Math.round(height * ratio))
      }
      redraw()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(stage)
    reducedMotion.addEventListener('change', redraw)
    loadEarthImage().then((asset) => {
      if (disposed || !asset) return
      image = asset
      renderer = createEarthRenderer(globe, image)
      if (!renderer) softwareEarth = createSoftwareEarth(image)
      redraw()
    })
    loadDistrictRings().then((paths) => {
      if (disposed) return
      rings = paths
      redraw()
    })

    const recoverFromContextLoss = () => {
      if (!image || disposed) return
      renderer = null
      softwareEarth ??= createSoftwareEarth(image)
      redraw()
    }
    globe.addEventListener('webglcontextlost', recoverFromContextLoss)

    resize()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      reducedMotion.removeEventListener('change', redraw)
      globe.removeEventListener('webglcontextlost', recoverFromContextLoss)
      renderer?.dispose()
    }
  }, [duration])

  return (
    <div ref={stageRef} className="prediction-earth-stage relative isolate w-full overflow-hidden" aria-hidden="true">
      <canvas ref={globeRef} className="prediction-globe pointer-events-none absolute inset-0 size-full" />
      <canvas ref={boundariesRef} className="prediction-earth-boundaries pointer-events-none absolute inset-0 size-full" />
      <span className="prediction-earth-location absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-sky-200/30 bg-slate-950/75 px-4 py-1 text-sm font-semibold text-sky-50">
        Bangladesh
      </span>
    </div>
  )
}
