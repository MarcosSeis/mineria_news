// Lienzo de píxeles en memoria (sin DOM): toda la escena se compone aquí y solo se vuelca al
// <canvas> al final. Así el pixel art es nítido, rápido y se puede probar sin navegador.

export const ANCHO = 160
export const ALTO = 120

// '#rrggbb' → entero RGBA de 32 bits (orden little-endian: R en el byte bajo)
export function hex(texto) {
  const n = parseInt(texto.slice(1), 16)
  return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | ((n >> 16) & 255)) >>> 0
}

export const crearLienzo = (ancho = ANCHO, alto = ALTO) => ({ ancho, alto, datos: new Uint32Array(ancho * alto) })

export function poner(lienzo, x, y, color) {
  x = Math.round(x)
  y = Math.round(y)
  if (x < 0 || y < 0 || x >= lienzo.ancho || y >= lienzo.alto) return
  lienzo.datos[y * lienzo.ancho + x] = color
}

export function rect(lienzo, x, y, w, h, color) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) poner(lienzo, x + i, y + j, color)
}

export function mezclarColores(abajo, arriba, alfa) {
  const canal = (desplazamiento) => {
    const a = (abajo >>> desplazamiento) & 255
    const b = (arriba >>> desplazamiento) & 255
    return Math.round(a + (b - a) * alfa) & 255
  }
  return ((255 << 24) | (canal(16) << 16) | (canal(8) << 8) | canal(0)) >>> 0
}

export function mezclar(lienzo, x, y, color, alfa) {
  x = Math.round(x)
  y = Math.round(y)
  if (alfa <= 0 || x < 0 || y < 0 || x >= lienzo.ancho || y >= lienzo.alto) return
  const i = y * lienzo.ancho + x
  lienzo.datos[i] = mezclarColores(lienzo.datos[i], color, Math.min(1, alfa))
}

export function circulo(lienzo, cx, cy, radio, color, alfa = 1) {
  const r = Math.ceil(radio)
  for (let j = -r; j <= r; j++) {
    for (let i = -r; i <= r; i++) {
      if (i * i + j * j <= radio * radio) mezclar(lienzo, cx + i, cy + j, color, alfa)
    }
  }
}

// Ruido determinista 0-1 por posición: da textura a la roca sin guardar nada.
export function ruido(x, y, semilla = 0) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(semilla | 0, 2147483647)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const cacheColores = new Map()
const colorDe = (texto) => {
  if (!cacheColores.has(texto)) cacheColores.set(texto, hex(texto))
  return cacheColores.get(texto)
}

// sprite = { filas: ['..YY..', ...], mapa: { Y: '#f2c200' } }; '.' es transparente.
export function dibujarSprite(lienzo, sprite, x, y, { espejo = false } = {}) {
  sprite.filas.forEach((fila, j) => {
    for (let i = 0; i < fila.length; i++) {
      const caracter = espejo ? fila[fila.length - 1 - i] : fila[i]
      if (caracter !== '.') poner(lienzo, x + i, y + j, colorDe(sprite.mapa[caracter]))
    }
  })
}

const DIGITOS = {
  0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001',
  5: '111100111001111', 6: '111100111101111', 7: '111001001001001', 8: '111101111101111', 9: '111101111001111'
}

// Cifras de 3×5 píxeles (para el letrero del nivel).
export function dibujarDigitos(lienzo, texto, x, y, color) {
  ;[...String(texto)].forEach((d, k) => {
    const mapa = DIGITOS[d]
    if (!mapa) return
    for (let i = 0; i < 15; i++) if (mapa[i] === '1') poner(lienzo, x + k * 4 + (i % 3), y + Math.floor(i / 3), color)
  })
}

export function aImageData(lienzo) {
  return new ImageData(new Uint8ClampedArray(lienzo.datos.buffer), lienzo.ancho, lienzo.alto)
}
