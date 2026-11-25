const RAD = Math.PI / 180
const TAU = 2 * Math.PI
const BANGLADESH = { latitude: 23.75 * RAD, longitude: 90.35 * RAD }
const ZOOM_OUT_END = 0.2
const ORBIT_END = 0.61
const APPROACH_END = 0.93
const clamp = (value) => Math.min(1, Math.max(0, value))
const ease = (value) => {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}

export function earthCamera(progress, width, height) {
  const span = Math.min(width, height)
  const pullBack = ease(progress / ZOOM_OUT_END)
  const orbit = ease((progress - ZOOM_OUT_END) / (ORBIT_END - ZOOM_OUT_END))
  const approach = ease((progress - ORBIT_END) / (APPROACH_END - ORBIT_END))
  const fullGlobe = 0.38 * span
  const countryView = Math.min(width / 0.11, height / 0.15)

  return {
    latitude: BANGLADESH.latitude,
    longitude: BANGLADESH.longitude + TAU * orbit,
    radius: (fullGlobe + (span * 0.64 - fullGlobe) * (1 - pullBack)) * (countryView / fullGlobe) ** approach,
    approach,
    boundaryOpacity: ease((approach - 0.55) / 0.45),
  }
}

const vertexSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const fragmentSource = `
  precision highp float;
  uniform sampler2D u_earth;
  uniform vec2 u_size;
  uniform float u_radius;
  uniform float u_lat;
  uniform float u_lon;
  uniform float u_approach;

  void main() {
    vec2 point = (gl_FragCoord.xy - u_size * 0.5) / u_radius;
    float distance = length(point);
    if (distance > 1.045) discard;

    if (distance > 1.0) {
      float halo = 0.25 * (1.0 - smoothstep(1.0, 1.045, distance));
      gl_FragColor = vec4(0.22, 0.55, 0.93, halo);
      return;
    }

    float depth = sqrt(max(0.0, 1.0 - dot(point, point)));
    float lat = asin(clamp(point.y * cos(u_lat) + depth * sin(u_lat), -1.0, 1.0));
    float lon = atan(point.x, depth * cos(u_lat) - point.y * sin(u_lat)) + u_lon;
    vec2 uv = vec2(fract(0.5 + lon / 6.28318530718), 0.5 - lat / 3.14159265359);
    vec3 surface = texture2D(u_earth, uv).rgb;
    float sun = max(0.0, dot(vec3(point, depth), vec3(-0.39, 0.43, 0.815)));
    surface *= mix(0.48 + 0.57 * sun, 1.0, u_approach);
    surface = mix(surface, vec3(0.32, 0.60, 0.87), smoothstep(0.89, 1.0, distance) * 0.48);
    gl_FragColor = vec4(surface, 1.0);
  }
`

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  gl.deleteShader(shader)
  return null
}

export function createEarthRenderer(canvas, image) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false })
  if (!gl) return null
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex)
    if (fragment) gl.deleteShader(fragment)
    return null
  }

  const program = gl.createProgram()
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  const maxWidth = gl.getParameter(gl.MAX_TEXTURE_SIZE)
  const source = image.width <= maxWidth ? image : fitImage(image, maxWidth)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.uniform1i(gl.getUniformLocation(program, 'u_earth'), 0)

  const size = gl.getUniformLocation(program, 'u_size')
  const radius = gl.getUniformLocation(program, 'u_radius')
  const longitude = gl.getUniformLocation(program, 'u_lon')
  const latitude = gl.getUniformLocation(program, 'u_lat')
  const approach = gl.getUniformLocation(program, 'u_approach')

  return {
    draw(camera) {
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(size, canvas.width, canvas.height)
      gl.uniform1f(radius, camera.radius)
      gl.uniform1f(longitude, camera.longitude)
      gl.uniform1f(latitude, camera.latitude)
      gl.uniform1f(approach, camera.approach)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose() {
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    },
  }
}

function fitImage(image, maxWidth) {
  const surface = document.createElement('canvas')
  surface.width = Math.min(maxWidth, image.width)
  surface.height = Math.round(image.height * surface.width / image.width)
  surface.getContext('2d').drawImage(image, 0, 0, surface.width, surface.height)
  return surface
}

export function createSoftwareEarth(image) {
  const texture = fitImage(image, 2400)
  const { width: textureWidth, height: textureHeight } = texture
  const source = new Uint32Array(texture.getContext('2d').getImageData(0, 0, textureWidth, textureHeight).data.buffer)
  const surface = document.createElement('canvas')
  const raster = surface.getContext('2d')
  let frame

  return (ctx, camera) => {
    const { width, height } = ctx.canvas
    const scale = Math.min(1, 440 / width, 280 / height)
    const sw = Math.max(1, Math.round(width * scale))
    const sh = Math.max(1, Math.round(height * scale))
    if (!frame || sw !== surface.width || sh !== surface.height) {
      surface.width = sw
      surface.height = sh
      frame = raster.createImageData(sw, sh)
    }

    const pixels = new Uint32Array(frame.data.buffer)
    const radius = camera.radius * scale
    const sinLat = Math.sin(camera.latitude)
    const cosLat = Math.cos(camera.latitude)
    for (let y = 0; y < sh; y++) {
      const ny = (sh / 2 - y - 0.5) / radius
      for (let x = 0; x < sw; x++) {
        const nx = (x + 0.5 - sw / 2) / radius
        const depthSquared = 1 - nx * nx - ny * ny
        const index = y * sw + x
        if (depthSquared < 0) {
          pixels[index] = 0
          continue
        }

        const depth = Math.sqrt(depthSquared)
        const lat = Math.asin(Math.min(1, Math.max(-1, ny * cosLat + depth * sinLat)))
        const lon = Math.atan2(nx, depth * cosLat - ny * sinLat) + camera.longitude
        const row = Math.min(textureHeight - 1, Math.floor((0.5 - lat / Math.PI) * textureHeight))
        const column = Math.floor((1.5 + lon / TAU) * textureWidth) % textureWidth
        pixels[index] = source[row * textureWidth + column]
      }
    }
    raster.putImageData(frame, 0, 0)
    ctx.drawImage(surface, 0, 0, width, height)
  }
}

export function prepareDistrictRings(geojson) {
  return geojson.features.flatMap(({ geometry }) => {
    const polygons = geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates]
    return polygons.flat().map((ring) => ring.map(([lon, lat]) => {
      const latitude = lat * RAD
      return [lon * RAD, Math.sin(latitude), Math.cos(latitude)]
    }))
  })
}

export function drawDistrictRings(ctx, camera, rings) {
  if (!rings.length || camera.boundaryOpacity <= 0) return
  const sinLat = Math.sin(camera.latitude)
  const cosLat = Math.cos(camera.latitude)
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2

  ctx.save()
  ctx.globalAlpha = camera.boundaryOpacity
  ctx.beginPath()
  for (const ring of rings) {
    ring.forEach(([lon, sin, cos], index) => {
      const relativeLon = lon - camera.longitude
      const x = cx + camera.radius * cos * Math.sin(relativeLon)
      const y = cy - camera.radius * (sin * cosLat - cos * Math.cos(relativeLon) * sinLat)
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
  }
  ctx.fillStyle = 'rgba(41, 149, 237, 0.24)'
  ctx.strokeStyle = 'rgba(227, 247, 255, 0.67)'
  ctx.lineWidth = 1.1
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}
