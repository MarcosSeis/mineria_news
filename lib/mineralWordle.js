export const MAX_INTENTOS = 6
export const INTENTOS_PARA_PISTA = 3
export const URL_SITIO = 'https://mineria-news.vercel.app/'

export function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
}

export function diaDelAnio(fecha) {
  return Math.floor(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) / 86400000)
}

export function fechaLocal(fecha) {
  const dos = (n) => String(n).padStart(2, '0')
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`
}

export function mineralDelDia(fecha, lista) {
  return lista[diaDelAnio(fecha) % lista.length]
}

export function evaluar(intento, secreta) {
  const resultado = Array(secreta.length).fill('ausente')
  const restantes = {}
  for (let i = 0; i < secreta.length; i++) {
    if (intento[i] === secreta[i]) resultado[i] = 'correcta'
    else restantes[secreta[i]] = (restantes[secreta[i]] || 0) + 1
  }
  for (let i = 0; i < secreta.length; i++) {
    if (resultado[i] !== 'correcta' && restantes[intento[i]] > 0) {
      resultado[i] = 'presente'
      restantes[intento[i]]--
    }
  }
  return resultado
}

const prioridad = { ausente: 1, presente: 2, correcta: 3 }

export function estadoTeclas(intentos, secreta) {
  const teclas = {}
  intentos.forEach((intento) => {
    evaluar(intento, secreta).forEach((estado, i) => {
      const letra = intento[i]
      if (!teclas[letra] || prioridad[estado] > prioridad[teclas[letra]]) teclas[letra] = estado
    })
  })
  return teclas
}

const emojis = { correcta: '🟩', presente: '🟨', ausente: '⬛' }

export function textoCompartir(intentos, secreta, fecha, url = '') {
  const acertado = intentos[intentos.length - 1] === secreta
  const marcador = acertado ? `${intentos.length}/${MAX_INTENTOS}` : `X/${MAX_INTENTOS}`
  const filas = intentos.map((i) => evaluar(i, secreta).map((e) => emojis[e]).join('')).join('\n')
  const dia = fecha.toLocaleDateString('es-CL')
  return [`⛏️ Mineral Wordle ${dia} ${marcador}`, filas, url].filter(Boolean).join('\n')
}

export const urlFacebook = (url, texto) =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(texto)}`

const colores = { correcta: '#2e7d4f', presente: '#f2c200', ausente: '#4a4a4a' }

export function dibujarTarjeta(canvas, intentos, secreta, fecha, url = URL_SITIO) {
  const ancho = 1080
  const alto = 1350
  canvas.width = ancho
  canvas.height = alto
  const ctx = canvas.getContext('2d')
  const acertado = intentos[intentos.length - 1] === secreta

  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, ancho, alto)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.font = 'bold 84px Oswald, sans-serif'
  ctx.fillText('⛏️ Mineral Wordle', ancho / 2, 170)
  ctx.font = '40px "Open Sans", sans-serif'
  ctx.fillText(fecha.toLocaleDateString('es-CL'), ancho / 2, 240)
  ctx.font = 'bold 120px Oswald, sans-serif'
  ctx.fillText(acertado ? `${intentos.length}/${MAX_INTENTOS}` : `X/${MAX_INTENTOS}`, ancho / 2, 380)

  const n = secreta.length
  const hueco = 14
  const celda = Math.min(104, Math.floor((ancho - 160 - hueco * (n - 1)) / n))
  const x0 = (ancho - (n * celda + (n - 1) * hueco)) / 2
  intentos.forEach((intento, fila) => {
    evaluar(intento, secreta).forEach((estado, col) => {
      ctx.fillStyle = colores[estado]
      ctx.fillRect(x0 + col * (celda + hueco), 450 + fila * (celda + hueco), celda, celda)
    })
  })

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 44px "Open Sans", sans-serif'
  ctx.fillText(url, ancho / 2, alto - 80)
  return canvas
}
