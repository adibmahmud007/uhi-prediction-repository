// A successful tile response can still be fully transparent in unsupported regions.
// Inspect only the visible part of loaded traffic tiles, including after a pan.
export function watchTrafficCoverage(layer, map, onStatus) {
  const pixels = new WeakMap()
  let timer
  let frame
  const update = () => {
    if (layer.isLoading()) return
    const bounds = map.getContainer().getBoundingClientRect()
    let loaded = 0
    let unknown = false
    let hasFlow = false
    const tiles = layer.getContainer()?.querySelectorAll('img') || []
    for (const tile of tiles) {
      if (!tile.complete || !tile.naturalWidth) continue
      const rect = tile.getBoundingClientRect()
      const left = Math.max(bounds.left, rect.left)
      const right = Math.min(bounds.right, rect.right)
      const top = Math.max(bounds.top, rect.top)
      const bottom = Math.min(bounds.bottom, rect.bottom)
      if (left >= right || top >= bottom) continue
      loaded += 1
      if (!pixels.has(tile)) {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = tile.naturalWidth
          canvas.height = tile.naturalHeight
          const context = canvas.getContext('2d', { willReadFrequently: true })
          context.drawImage(tile, 0, 0)
          pixels.set(tile, context.getImageData(0, 0, canvas.width, canvas.height))
        } catch { pixels.set(tile, null) }
      }
      const image = pixels.get(tile)
      if (!image) { unknown = true; continue }
      const x0 = Math.max(0, Math.floor((left - rect.left) / rect.width * image.width))
      const x1 = Math.min(image.width, Math.ceil((right - rect.left) / rect.width * image.width))
      const y0 = Math.max(0, Math.floor((top - rect.top) / rect.height * image.height))
      const y1 = Math.min(image.height, Math.ceil((bottom - rect.top) / rect.height * image.height))
      for (let y = y0; y < y1 && !hasFlow; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          if (image.data[(y * image.width + x) * 4 + 3] > 0) { hasFlow = true; break }
        }
      }
      if (hasFlow) break
    }
    clearTimeout(timer)
    onStatus(hasFlow ? 'ready' : loaded ? (unknown ? 'unknown' : 'empty') : 'error')
  }
  const schedule = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(update)
  }
  const loading = () => {
    clearTimeout(timer)
    onStatus('loading')
    timer = setTimeout(() => onStatus('error'), 15000)
  }
  layer.on('loading', loading).on('load', schedule)
  map.on('moveend zoomend resize', schedule)
  return () => {
    clearTimeout(timer)
    cancelAnimationFrame(frame)
    layer.off('loading', loading).off('load', schedule)
    map.off('moveend zoomend resize', schedule)
  }
}
