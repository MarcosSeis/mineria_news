import { crearRng, hashTexto } from '@/lib/voladura/randomSeed'

describe('randomSeed', () => {
  it('la misma semilla produce la misma secuencia', () => {
    const a = crearRng('reto-1')
    const b = crearRng('reto-1')
    expect([a.siguiente(), a.siguiente(), a.siguiente()]).toEqual([b.siguiente(), b.siguiente(), b.siguiente()])
  })

  it('semillas distintas producen secuencias distintas', () => {
    expect(crearRng('a').siguiente()).not.toBe(crearRng('b').siguiente())
    expect(hashTexto('a')).not.toBe(hashTexto('b'))
  })

  it('acepta semillas numéricas y respeta los rangos', () => {
    const rng = crearRng(42)
    for (let i = 0; i < 200; i++) {
      const v = rng.siguiente()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
      expect(rng.entero(3, 6)).toBeGreaterThanOrEqual(3)
      expect(rng.entero(3, 6)).toBeLessThanOrEqual(6)
      const e = rng.entre(2, 5)
      expect(e).toBeGreaterThanOrEqual(2)
      expect(e).toBeLessThan(5)
    }
  })

  it('mezclar conserva los elementos sin alterar el original', () => {
    const lista = [1, 2, 3, 4, 5, 6]
    const mezclada = crearRng('m').mezclar(lista)
    expect([...mezclada].sort()).toEqual(lista)
    expect(lista).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('elegir y ponderado devuelven valores válidos', () => {
    const rng = crearRng('p')
    expect(['x', 'y']).toContain(rng.elegir(['x', 'y']))
    expect(rng.ponderado({ solo: 1 })).toBe('solo')
    const cuenta = { a: 0, b: 0 }
    for (let i = 0; i < 2000; i++) cuenta[rng.ponderado({ a: 9, b: 1 })]++
    expect(cuenta.a).toBeGreaterThan(cuenta.b * 4)
  })
})
