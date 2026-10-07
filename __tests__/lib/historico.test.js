jest.mock('axios')

let axios, fetchHistorico

const yahoo = (cierres) => ({
  data: { chart: { result: [{
    timestamp: cierres.map((_, i) => 1791000000 + i * 86400),
    indicators: { quote: [{ close: cierres }] }
  }] } }
})

beforeEach(() => {
  jest.resetModules()
  axios = require('axios')
  ;({ fetchHistorico } = require('@/lib/historico'))
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

describe('fetchHistorico', () => {
  it('devuelve series por símbolo y descarta cierres nulos', async () => {
    axios.get.mockResolvedValue(yahoo([100, null, 102]))
    const datos = await fetchHistorico()
    expect(Object.keys(datos)).toEqual(['XAU', 'XAG', 'HG', 'XPT', 'XPD'])
    expect(datos.XAU.map(p => p.precio)).toEqual([100, 102])
    expect(datos.XAU[0].fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('omite los metales que fallan', async () => {
    axios.get.mockImplementation(async (url) => {
      if (url.includes('SI%3DF')) throw new Error('boom')
      return yahoo([1, 2])
    })
    const datos = await fetchHistorico()
    expect(datos.XAG).toBeUndefined()
    expect(datos.XAU).toBeDefined()
  })

  it('devuelve {} con respuestas inválidas', async () => {
    axios.get.mockResolvedValue({ data: {} })
    expect(await fetchHistorico()).toEqual({})
  })

  it('reutiliza la caché', async () => {
    axios.get.mockResolvedValue(yahoo([1, 2]))
    await fetchHistorico()
    await fetchHistorico()
    expect(axios.get).toHaveBeenCalledTimes(5)
  })
})
