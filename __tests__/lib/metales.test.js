jest.mock('axios')

const respuesta = (symbol) => ({ data: { symbol, price: 100, updatedAt: '2026-10-06T12:00:00Z' } })

let axios, fetchPrecios, formatearPrecio, METALES

beforeEach(() => {
  jest.resetModules()
  axios = require('axios')
  jest.spyOn(console, 'error').mockImplementation(() => {})
  ;({ fetchPrecios, formatearPrecio, METALES } = require('@/lib/metales'))
})

describe('fetchPrecios', () => {
  it('devuelve todos los metales con su precio', async () => {
    axios.get.mockImplementation(async (url) => respuesta(url.split('/').pop()))
    const precios = await fetchPrecios()
    expect(precios.map(p => p.symbol)).toEqual(METALES.map(m => m.symbol))
    expect(precios[0]).toMatchObject({ nombre: 'Oro', precio: 100, unidad: 'USD / onza troy' })
  })

  it('omite los metales que fallan y conserva el resto', async () => {
    axios.get.mockImplementation(async (url) => {
      if (url.endsWith('/HG')) throw new Error('boom')
      return respuesta(url.split('/').pop())
    })
    const precios = await fetchPrecios()
    expect(precios.map(p => p.symbol)).not.toContain('HG')
    expect(precios).toHaveLength(METALES.length - 1)
  })

  it('descarta respuestas sin precio numérico', async () => {
    axios.get.mockResolvedValue({ data: { price: 'x' } })
    expect(await fetchPrecios()).toEqual([])
  })

  it('devuelve [] si la API cae por completo', async () => {
    axios.get.mockRejectedValue(new Error('down'))
    expect(await fetchPrecios()).toEqual([])
  })

  it('reutiliza la caché durante 5 minutos', async () => {
    axios.get.mockImplementation(async (url) => respuesta(url.split('/').pop()))
    await fetchPrecios()
    await fetchPrecios()
    expect(axios.get).toHaveBeenCalledTimes(METALES.length)
  })
})

describe('formatearPrecio', () => {
  it('da formato de dólares', () => {
    expect(formatearPrecio(4146.5)).toBe('$4,146.50')
  })
})
