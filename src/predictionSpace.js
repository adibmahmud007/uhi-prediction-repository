const TAU = Math.PI * 2

const craters = [
  [-0.43, 0.32, 0.19], [0.31, -0.28, 0.25], [0.12, 0.56, 0.16],
  [-0.16, -0.34, 0.13], [-0.62, -0.37, 0.11], [0.57, 0.1, 0.14],
]

function createMoonSprite() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 144
  const ctx = canvas.getContext('2d')
  const size = canvas.width
  const image = ctx.createImageData(size, size)

  for (let row = 0; row < size; row++) {
    const y = 1 - 2 * (row + .5) / size
    for (let column = 0; column < size; column++) {
      const x = 2 * (column + .5) / size - 1
      const distance = Math.hypot(x, y)
      if (distance >= 1) continue

      const depth = Math.sqrt(1 - distance * distance)
      const sun = Math.max(0, -.64 * x + .43 * y + .63 * depth)
      const grain = 0.033 * Math.sin(173 * x + 57 * y) * Math.cos(139 * y - 31 * x)
      const mottling = .09 * Math.sin(19 * x - 12 * y) * Math.cos(28 * y + 9 * x)
      let surface = .72 + grain + mottling
      for (const [cx, cy, radius] of craters) {
        const craterDistance = Math.hypot(x - cx, y - cy) / radius
        surface -= .27 * Math.exp(-2.5 * craterDistance ** 2)
        surface += .095 * Math.exp(-90 * (craterDistance - .9) ** 2)
      }

      const light = 255 * surface * (.075 + .93 * sun ** .78)
      const index = 4 * (row * size + column)
      image.data[index] = light
      image.data[index + 1] = light * .97
      image.data[index + 2] = light * .92
      image.data[index + 3] = 255 * Math.min(1, (1 - distance) * size / 2)
    }
  }

  ctx.putImageData(image, 0, 0)
  return canvas
}

function makeStars() {
  let seed = 51243
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }

  return Array.from({ length: 78 }, () => ({
    x: random(),
    y: random(),
    depth: .2 + .8 * random(),
    phase: TAU * random(),
  }))
}

const stars = makeStars()
let moonSprite

export function drawStarfield(ctx, progress, visibility = 1) {
  const { width, height } = ctx.canvas
  ctx.clearRect(0, 0, width, height)
  if (visibility <= 0) return

  const span = Math.min(width, height)
  const unit = Math.max(.7, span / 670)
  ctx.save()
  ctx.fillStyle = '#dce9ff'
  for (const star of stars) {
    const dx = -span * progress * (.04 + .2 * star.depth)
    const dy = span * progress * (.015 + .08 * star.depth)
    const x = ((star.x * width + dx) % width + width) % width
    const y = (star.y * height + dy) % height
    const glint = .7 + .3 * Math.sin(star.phase + TAU * progress * 1.3)
    ctx.globalAlpha = visibility * glint * (.2 + .66 * star.depth)
    ctx.beginPath()
    ctx.arc(x, y, unit * (.38 + .8 * star.depth), 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

export function getMoonSprite() {
  moonSprite ??= createMoonSprite()
  return moonSprite
}

export function drawPredictionSpace(ctx, progress, approach) {
  const visibility = 1 - approach
  drawStarfield(ctx, progress, visibility)
  if (visibility <= 0) return

  const { width, height } = ctx.canvas
  const span = Math.min(width, height)
  const x = width / 2 + Math.min(width * .41, span * .56)
  const bob = span * .01 * Math.sin(TAU * progress * 1.4)
  const y = height / 2 - Math.min(height * .3, span * .33) + bob
  const radius = span * .05
  ctx.save()
  ctx.globalAlpha = visibility ** 2
  ctx.drawImage(getMoonSprite(), x - radius, y - radius, radius * 2, radius * 2)
  ctx.restore()
}
