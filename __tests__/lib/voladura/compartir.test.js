import {
  textoCompartir, textoLinkedIn, barraPuntuacion, urlJuego, compartirResultado, copiarResultado, RUTA_JUEGO, urlFacebook, urlLinkedIn,
  puedeCompartirArchivos, compartirImagen, descargarImagen
} from '@/lib/voladura/compartir'

describe('compartir', () => {
  it('genera el texto con el formato pedido y sin datos técnicos', () => {
    const texto = textoCompartir({ numero: 127, score: 87, mensaje: 'La roca tenía otros planes.', url: 'https://sitio/la-voladura' })
    expect(texto).toBe([
      'LA VOLADURA #127', '', '87/100', '🟧🟧🟧🟧🟧🟧🟧🟧🟧⬛', '', 'La roca tenía otros planes.', '', '¿Puedes superarlo?', '', 'Minería News', 'https://sitio/la-voladura'
    ].join('\n'))
    expect(texto).not.toMatch(/burden|espaciamiento|ANFO/i)
  })

  it('usa la dirección pública del sitio (nunca localhost) por defecto', () => {
    expect(urlJuego()).toBe('https://mineria-news.vercel.app/la-voladura')
    expect(textoCompartir({ numero: 1, score: 0, mensaje: 'x' })).toContain('https://mineria-news.vercel.app' + RUTA_JUEGO)
    expect(textoCompartir({ numero: 1, score: 0, mensaje: 'x' })).not.toContain('localhost')
  })

  it('el texto de LinkedIn es corto: título, barra con nota, frase y enlace', () => {
    const texto = textoLinkedIn({ numero: 127, score: 87, mensaje: 'La roca tenía otros planes.' })
    expect(texto).toBe('🧨 LA VOLADURA #127\n🟧🟧🟧🟧🟧🟧🟧🟧🟧⬛ 87/100\n“La roca tenía otros planes.”\n👉 Juega hoy: https://mineria-news.vercel.app/la-voladura')
    expect(texto.length).toBeLessThan(textoCompartir({ numero: 127, score: 87, mensaje: 'La roca tenía otros planes.' }).length)
    expect(textoLinkedIn({ numero: 1, score: 50, mensaje: 'x', url: 'https://a.cl' })).toContain('👉 Juega hoy: https://a.cl')
  })

  it('la barra se llena según la puntuación', () => {
    expect(barraPuntuacion(0)).toBe('⬛'.repeat(10))
    expect(barraPuntuacion(100)).toBe('🟧'.repeat(10))
  })

  it('usa la Web Share API cuando existe', async () => {
    const share = jest.fn().mockResolvedValue()
    expect(await compartirResultado('t', 'u', { share })).toBe('compartido')
    expect(share).toHaveBeenCalledWith({ text: 't', url: 'u' })
  })

  it('si el jugador cancela no copia nada', async () => {
    const writeText = jest.fn()
    const error = Object.assign(new Error('x'), { name: 'AbortError' })
    expect(await compartirResultado('t', 'u', { share: jest.fn().mockRejectedValue(error), clipboard: { writeText } })).toBe('cancelado')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('si compartir falla o no existe, copia al portapapeles', async () => {
    const writeText = jest.fn().mockResolvedValue()
    expect(await compartirResultado('t', 'u', { clipboard: { writeText } })).toBe('copiado')
    expect(await compartirResultado('t', 'u', { share: jest.fn().mockRejectedValue(new Error('x')), clipboard: { writeText } })).toBe('copiado')
    expect(writeText).toHaveBeenCalledWith('t')
  })

  it('informa del error si tampoco se puede copiar', async () => {
    expect(await copiarResultado('t', {})).toBe('error')
    expect(await copiarResultado('t', { clipboard: { writeText: jest.fn().mockRejectedValue(new Error('no')) } })).toBe('error')
  })

  it('arma las URL de Facebook y LinkedIn codificadas', () => {
    expect(urlFacebook('https://a.cl/x y', 'hola & chao')).toBe('https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fa.cl%2Fx%20y&quote=hola%20%26%20chao')
    expect(urlLinkedIn('Hola\nhttps://a.cl/x')).toBe('https://www.linkedin.com/feed/?shareActive=true&text=Hola%0Ahttps%3A%2F%2Fa.cl%2Fx')
  })

  it('detecta si se pueden compartir archivos', () => {
    expect(puedeCompartirArchivos({})).toBe(false)
    expect(puedeCompartirArchivos({ share: jest.fn(), canShare: () => true })).toBe(true)
    expect(puedeCompartirArchivos({ share: jest.fn(), canShare: () => false })).toBe(false)
    expect(puedeCompartirArchivos({ share: jest.fn(), canShare: () => { throw new Error('x') } })).toBe(false)
  })

  it('comparte la imagen como archivo PNG', async () => {
    const share = jest.fn().mockResolvedValue()
    expect(await compartirImagen(new Blob(['x']), 'texto', { share })).toBe('compartido')
    expect(share.mock.calls[0][0].files[0].name).toBe('la-voladura.png')
    expect(share.mock.calls[0][0].text).toBe('texto')
    expect(await compartirImagen(new Blob(['x']), 't', { share: jest.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' })) })).toBe('cancelado')
    expect(await compartirImagen(new Blob(['x']), 't', { share: jest.fn().mockRejectedValue(new Error('x')) })).toBe('error')
  })

  it('descarga la imagen con un enlace temporal', () => {
    jest.useFakeTimers()
    const enlace = { click: jest.fn() }
    const urls = { createObjectURL: jest.fn(() => 'blob:1'), revokeObjectURL: jest.fn() }
    descargarImagen(new Blob(['x']), { createElement: () => enlace }, urls)
    expect(enlace.download).toBe('la-voladura.png')
    expect(enlace.href).toBe('blob:1')
    expect(enlace.click).toHaveBeenCalled()
    jest.advanceTimersByTime(1000)
    expect(urls.revokeObjectURL).toHaveBeenCalledWith('blob:1')
    jest.useRealTimers()
  })
})
