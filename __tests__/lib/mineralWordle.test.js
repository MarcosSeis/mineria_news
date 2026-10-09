import {
  normalizar, mineralDelDia, evaluar, estadoTeclas, textoCompartir, diaDelAnio, urlFacebook, dibujarTarjeta, fechaLocal
} from '@/lib/mineralWordle'

describe('mineralWordle', () => {
  it('normaliza tildes y mayúsculas', () => {
    expect(normalizar('Níquel')).toBe('NIQUEL')
  })

  it('evalúa letras correctas, presentes y ausentes', () => {
    expect(evaluar('COBRA', 'COBRE')).toEqual(['correcta', 'correcta', 'correcta', 'correcta', 'ausente'])
    expect(evaluar('OCBER', 'COBRE')).toEqual(['presente', 'presente', 'correcta', 'presente', 'presente'])
  })

  it('no marca letras repetidas de más', () => {
    expect(evaluar('PLOMO', 'COBRE')).toEqual(['ausente', 'ausente', 'presente', 'ausente', 'ausente'])
    expect(evaluar('OOXXX', 'AOBCD')).toEqual(['ausente', 'correcta', 'ausente', 'ausente', 'ausente'])
  })

  it('elige el mineral del día de forma estable y cíclica', () => {
    const lista = [{ palabra: 'A' }, { palabra: 'B' }, { palabra: 'C' }]
    const hoy = new Date(2026, 9, 8)
    const manana = new Date(2026, 9, 9)
    expect(mineralDelDia(hoy, lista)).toBe(mineralDelDia(new Date(2026, 9, 8, 23), lista))
    expect(diaDelAnio(manana) - diaDelAnio(hoy)).toBe(1)
    expect(mineralDelDia(manana, lista)).toBe(lista[(diaDelAnio(hoy) + 1) % 3])
  })

  it('conserva el mejor estado de cada tecla', () => {
    const teclas = estadoTeclas(['COBRA', 'OCBER'], 'COBRE')
    expect(teclas.C).toBe('correcta')
    expect(teclas.A).toBe('ausente')
  })

  it('arma el texto para compartir con acierto y con derrota', () => {
    const fecha = new Date(2026, 9, 8)
    expect(textoCompartir(['COBRA', 'COBRE'], 'COBRE', fecha)).toContain('2/6')
    expect(textoCompartir(['COBRA', 'COBRA', 'COBRA', 'COBRA', 'COBRA', 'COBRA'], 'COBRE', fecha)).toContain('X/6')
    expect(textoCompartir(['COBRE'], 'COBRE', fecha)).toContain('🟩🟩🟩🟩🟩')
  })

  it('incluye la URL en el texto y arma el enlace de Facebook', () => {
    const fecha = new Date(2026, 9, 8)
    expect(textoCompartir(['COBRE'], 'COBRE', fecha, 'https://x.cl/j')).toMatch(/\nhttps:\/\/x\.cl\/j$/)
    expect(urlFacebook('https://x.cl/j', 'hola mundo')).toBe(
      'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fx.cl%2Fj&quote=hola%20mundo'
    )
  })

  it.each([
    [['COBRE'], 'COBRE', '1/6'],
    [['COBRA', 'COBRA', 'COBRA', 'COBRA', 'COBRA', 'COBRA'], 'COBRE', 'X/6']
  ])('dibuja la tarjeta de imagen (%j)', (intentos, secreta, marcador) => {
    const ctx = { fillRect: jest.fn(), fillText: jest.fn() }
    const canvas = { getContext: () => ctx }
    dibujarTarjeta(canvas, intentos, secreta, new Date(2026, 9, 8), 'https://x.cl/mineral-wordle')
    expect(canvas.width).toBe(1080)
    expect(canvas.height).toBe(1350)
    expect(ctx.fillText).toHaveBeenCalledWith(marcador, 540, 380)
    expect(ctx.fillText).toHaveBeenCalledWith('https://x.cl/mineral-wordle', 540, 1270)
    expect(ctx.fillRect).toHaveBeenCalledTimes(1 + intentos.length * secreta.length)
  })

  it('usa por defecto el enlace del portal', () => {
    const ctx = { fillRect: jest.fn(), fillText: jest.fn() }
    dibujarTarjeta({ getContext: () => ctx }, ['COBRE'], 'COBRE', new Date(2026, 9, 8))
    expect(ctx.fillText).toHaveBeenCalledWith('https://mineria-news.vercel.app/', 540, 1270)
  })

  it('da la fecha local con ceros', () => {
    expect(fechaLocal(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
})
