import { urlPublica } from '@/lib/config'

export const RUTA_JUEGO = '/la-voladura'

// Dirección pública del juego: lo que se comparte nunca apunta a localhost.
export const urlJuego = () => urlPublica(RUTA_JUEGO)

// Barra de 10 casillas: curiosidad sin revelar la configuración técnica.
export function barraPuntuacion(score) {
  const llenas = Math.round(score / 10)
  return '🟧'.repeat(llenas) + '⬛'.repeat(10 - llenas)
}

export function textoCompartir({ numero, score, mensaje, url = urlJuego() }) {
  return [
    `LA VOLADURA #${numero}`,
    '',
    `${score}/100`,
    barraPuntuacion(score),
    '',
    mensaje,
    '',
    '¿Puedes superarlo?',
    '',
    'Minería News',
    url
  ].join('\n')
}

// Usa la Web Share API si existe; si no, copia al portapapeles. Devuelve qué ocurrió.
export async function compartirResultado(texto, url, nav = typeof navigator !== 'undefined' ? navigator : {}) {
  if (nav.share) {
    try {
      await nav.share({ text: texto, url })
      return 'compartido'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelado'
    }
  }
  return copiarResultado(texto, nav)
}

export async function copiarResultado(texto, nav = typeof navigator !== 'undefined' ? navigator : {}) {
  try {
    await nav.clipboard.writeText(texto)
    return 'copiado'
  } catch (e) {
    return 'error'
  }
}

export const urlFacebook = (url, texto) =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(texto)}`

// Abre el editor de LinkedIn con el texto ya escrito (incluye el enlace, que LinkedIn convierte en vista previa).
export const urlLinkedIn = (texto) => `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(texto)}`

export const URL_INSTAGRAM = 'https://www.instagram.com/'

export const NOMBRE_IMAGEN = 'la-voladura.png'

// ¿Puede este navegador compartir un archivo (p. ej. directo a la app de Instagram)?
export function puedeCompartirArchivos(nav = typeof navigator !== 'undefined' ? navigator : {}) {
  try {
    return !!(nav.share && nav.canShare && nav.canShare({ files: [new File([''], NOMBRE_IMAGEN, { type: 'image/png' })] }))
  } catch (e) {
    return false
  }
}

export async function compartirImagen(blob, texto, nav = typeof navigator !== 'undefined' ? navigator : {}) {
  try {
    await nav.share({ files: [new File([blob], NOMBRE_IMAGEN, { type: 'image/png' })], text: texto })
    return 'compartido'
  } catch (e) {
    return e?.name === 'AbortError' ? 'cancelado' : 'error'
  }
}

export function descargarImagen(blob, doc = document, urls = URL) {
  const enlace = doc.createElement('a')
  enlace.href = urls.createObjectURL(blob)
  enlace.download = NOMBRE_IMAGEN
  enlace.click()
  setTimeout(() => urls.revokeObjectURL(enlace.href), 1000)
}
