import { crearLienzo, aImageData, ANCHO, ALTO } from './pixelart/lienzo'
import { dibujarFotograma } from './pixelart/escena'
import { crearGuion, estadoEn } from './pixelart/animacion'

export const TARJETA = { ancho: 1080, alto: 1350 }
const AMARILLO = '#f2c200'
const FUENTE_PIXEL = '"Press Start 2P", monospace'
const FUENTE_CUERPO = '"VT323", "Courier New", monospace'

function lineas(ctx, texto, anchoMax) {
  const resultado = []
  let actual = ''
  texto.split(' ').forEach((palabra) => {
    const prueba = actual ? `${actual} ${palabra}` : palabra
    if (actual && ctx.measureText(prueba).width > anchoMax) {
      resultado.push(actual)
      actual = palabra
    } else {
      actual = prueba
    }
  })
  if (actual) resultado.push(actual)
  return resultado
}

// Imagen para publicar: el frente ya volado, la puntuación y el mensaje. Sin configuración técnica.
export function dibujarTarjeta(canvas, { resultado, numero, escena, url }) {
  const { ancho, alto } = TARJETA
  canvas.width = ancho
  canvas.height = alto
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#14110f'
  ctx.fillRect(0, 0, ancho, alto)
  ctx.strokeStyle = AMARILLO
  ctx.lineWidth = 16
  ctx.strokeRect(24, 24, ancho - 48, alto - 48)

  ctx.textAlign = 'center'
  ctx.fillStyle = AMARILLO
  ctx.font = `44px ${FUENTE_PIXEL}`
  ctx.fillText('LA VOLADURA', ancho / 2, 130)
  ctx.fillStyle = '#f26a1b'
  ctx.font = `34px ${FUENTE_PIXEL}`
  ctx.fillText(`#${numero}`, ancho / 2, 195)

  const lienzo = crearLienzo(ANCHO, ALTO)
  const guion = crearGuion(resultado, escena.desafio, escena)
  dibujarFotograma(lienzo, escena, estadoEn(guion, guion.duracion))
  const imagen = Object.assign(document.createElement('canvas'), { width: ANCHO, height: ALTO })
  imagen.getContext('2d').putImageData(aImageData(lienzo), 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(imagen, 60, 225, 960, 720)
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 8
  ctx.strokeRect(60, 225, 960, 720)

  ctx.fillStyle = '#f4f4f0'
  ctx.font = `120px ${FUENTE_PIXEL}`
  ctx.fillText(`${resultado.score}/100`, ancho / 2, 1100)
  ctx.font = `36px ${FUENTE_PIXEL}`
  ctx.fillStyle = AMARILLO
  ctx.fillText(resultado.nivel.titulo, ancho / 2, 1160)

  ctx.fillStyle = '#f4f4f0'
  ctx.font = `46px ${FUENTE_CUERPO}`
  lineas(ctx, resultado.mensaje, ancho - 220).slice(0, 2).forEach((l, i) => ctx.fillText(l, ancho / 2, 1220 + i * 46))

  ctx.fillStyle = AMARILLO
  ctx.font = `40px ${FUENTE_CUERPO}`
  ctx.fillText(`Minería News · ${url.replace(/^https?:\/\//, '')}`, ancho / 2, 1310)
  return canvas
}

export const aBlob = (canvas) => new Promise((resolver) => canvas.toBlob(resolver, 'image/png'))
