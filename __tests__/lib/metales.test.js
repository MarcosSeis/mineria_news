import { leerPrecios, leerMetalesConHistorico, leerActualizacion, formatearPrecio } from '@/lib/metales'

describe('lib/metales', () => {
  it('leerPrecios devuelve los metales sin la serie histórica', () => {
    const precios = leerPrecios()
    expect(precios.length).toBeGreaterThan(0)
    precios.forEach(m => {
      expect(m).toMatchObject({ symbol: expect.any(String), nombre: expect.any(String), precio: expect.any(Number) })
      expect(m).not.toHaveProperty('serie')
    })
  })

  it('leerMetalesConHistorico incluye serie ordenada por fecha', () => {
    leerMetalesConHistorico().forEach(m => {
      const fechas = m.serie.map(p => p.fecha)
      expect(fechas).toEqual([...fechas].sort())
    })
  })

  it('leerActualizacion devuelve la fecha de la última descarga', () => {
    expect(leerActualizacion()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('formatearPrecio da formato de dólares', () => {
    expect(formatearPrecio(4146.5)).toBe('$4,146.50')
  })
})
