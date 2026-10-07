import { parsearSerieYahoo, fusionarSerie, MAX_PUNTOS } from '../../scripts/metales-datos.mjs'

const yahoo = (cierres) => ({
  chart: { result: [{ timestamp: cierres.map((_, i) => 1791000000 + i * 86400), indicators: { quote: [{ close: cierres }] } }] }
})

describe('parsearSerieYahoo', () => {
  it('convierte timestamps a fechas y descarta cierres nulos', () => {
    const serie = parsearSerieYahoo(yahoo([100, null, 102]))
    expect(serie.map(p => p.precio)).toEqual([100, 102])
    expect(serie[0].fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('lanza error con respuestas inválidas', () => {
    expect(() => parsearSerieYahoo({})).toThrow('inválida')
  })
})

describe('fusionarSerie', () => {
  it('agrega fechas nuevas, ordena y sobrescribe la misma fecha', () => {
    const existente = [{ fecha: '2026-10-01', precio: 1 }, { fecha: '2026-10-02', precio: 2 }]
    const nuevos = [{ fecha: '2026-10-03', precio: 3 }, { fecha: '2026-10-02', precio: 20 }]
    expect(fusionarSerie(existente, nuevos)).toEqual([
      { fecha: '2026-10-01', precio: 1 }, { fecha: '2026-10-02', precio: 20 }, { fecha: '2026-10-03', precio: 3 }
    ])
  })

  it('funciona sin datos previos', () => {
    expect(fusionarSerie(undefined, [{ fecha: '2026-10-01', precio: 1 }])).toHaveLength(1)
  })

  it('conserva solo los últimos MAX_PUNTOS', () => {
    const muchos = Array.from({ length: MAX_PUNTOS + 10 }, (_, i) => ({
      fecha: new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10), precio: i
    }))
    const resultado = fusionarSerie([], muchos)
    expect(resultado).toHaveLength(MAX_PUNTOS)
    expect(resultado.at(-1).precio).toBe(MAX_PUNTOS + 9)
  })
})
