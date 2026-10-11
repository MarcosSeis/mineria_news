import { dibujarTarjeta, aBlob, TARJETA } from '@/lib/voladura/tarjeta'
import { crearEscena } from '@/lib/voladura/pixelart/escena'
import { getChallengeByNumber, configOptima } from '@/lib/voladura/challengeEngine'
import { evaluateBlast } from '@/lib/voladura/blastEngine'

describe('tarjeta para compartir', () => {
  const reto = getChallengeByNumber(15)
  const resultado = evaluateBlast(configOptima(reto), reto)
  const textos = []
  const ctx = new Proxy({ measureText: (t) => ({ width: t.length * 25 }), fillText: (t) => textos.push(t), drawImage: jest.fn() }, { get: (o, k) => (k in o ? o[k] : jest.fn()), set: () => true })

  beforeEach(() => {
    textos.length = 0
    global.ImageData = class { constructor(d, w, h) { Object.assign(this, { data: d, width: w, height: h }) } }
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ctx)
  })

  it('dibuja título, puntuación, nivel, mensaje y URL, sin datos técnicos', () => {
    const canvas = dibujarTarjeta(document.createElement('canvas'), { resultado, numero: 15, escena: crearEscena(reto), url: 'https://sitio.cl/la-voladura' })
    expect(canvas.width).toBe(TARJETA.ancho)
    expect(canvas.height).toBe(TARJETA.alto)
    expect(textos).toEqual(expect.arrayContaining(['LA VOLADURA', '#15', `${resultado.score}/100`, resultado.nivel.titulo, 'Minería News · sitio.cl/la-voladura']))
    expect(textos.join(' ')).not.toMatch(/burden|espaciamiento|anfo/i)
    expect(ctx.drawImage).toHaveBeenCalled()
  })

  it('parte los mensajes largos en dos líneas como máximo', () => {
    const largo = { ...resultado, mensaje: 'La geología tenía otros planes: apareció una zona de fracturamiento inesperada que nadie había mapeado en todo el nivel de hoy.' }
    dibujarTarjeta(document.createElement('canvas'), { resultado: largo, numero: 1, escena: crearEscena(reto), url: 'http://x.cl' })
    const lineasMensaje = textos.filter((t) => /geología|fracturamiento|nivel de hoy/.test(t))
    expect(lineasMensaje.length).toBeGreaterThanOrEqual(1)
    expect(lineasMensaje.length).toBeLessThanOrEqual(2)
  })

  it('convierte el canvas en PNG', async () => {
    const canvas = { toBlob: (cb, tipo) => cb({ tipo }) }
    expect(await aBlob(canvas)).toEqual({ tipo: 'image/png' })
  })
})
