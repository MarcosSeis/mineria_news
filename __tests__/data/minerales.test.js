import { minerales } from '@/data/minerales'
import { mineralDelDia } from '@/lib/mineralWordle'

describe('minerales', () => {
  it('tiene un mineral distinto para cada día de un año completo', () => {
    expect(minerales.length).toBeGreaterThanOrEqual(365)
    expect(new Set(minerales.map((m) => m.palabra)).size).toBe(minerales.length)
  })

  it('usa solo letras mayúsculas sin tildes, de 3 a 11 letras, y con pista', () => {
    minerales.forEach(({ palabra, pista }) => {
      expect(palabra).toMatch(/^[A-Z]{3,11}$/)
      expect(pista.trim().length).toBeGreaterThan(10)
    })
  })

  it('no repite el mineral en 365 días seguidos', () => {
    const vistos = new Set()
    for (let d = 0; d < 365; d++) vistos.add(mineralDelDia(new Date(2026, 0, 1 + d), minerales).palabra)
    expect(vistos.size).toBe(365)
  })
})
