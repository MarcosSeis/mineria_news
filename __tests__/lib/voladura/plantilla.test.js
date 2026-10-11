import { generarPlantilla, cobertura, dentroSeccion, areaSeccion, seccion } from '@/lib/voladura/plantilla'

const geometria = { ancho: 4, alto: 4, muro: 0.6 }

describe('plantilla de barrenación', () => {
  it('genera exactamente el número de barrenos pedido', () => {
    ;[8, 17, 30, 60].forEach((n) => {
      expect(generarPlantilla(geometria, { burden: 0.9, espaciamiento: 1, barrenos: n }).barrenos).toHaveLength(n)
    })
  })

  it('al cambiar el espaciamiento los barrenos se reorganizan', () => {
    const cerrado = generarPlantilla(geometria, { burden: 0.9, espaciamiento: 0.7, barrenos: 20 })
    const abierto = generarPlantilla(geometria, { burden: 0.9, espaciamiento: 1.5, barrenos: 20 })
    expect(cerrado.columnas).toBeGreaterThan(abierto.columnas)
    expect(cerrado.barrenos[1].x - cerrado.barrenos[0].x).toBeCloseTo(0.7)
    expect(abierto.barrenos[1].x - abierto.barrenos[0].x).toBeCloseTo(1.5)
  })

  it('al cambiar el burden cambia la distancia entre filas', () => {
    const p = generarPlantilla(geometria, { burden: 1.2, espaciamiento: 1, barrenos: 12 })
    const ys = [...new Set(p.barrenos.map((b) => b.y.toFixed(3)))].map(Number).sort((a, b) => b - a)
    expect(ys[0] - ys[1]).toBeCloseTo(1.2)
  })

  it('las filas alternan cantidad de barrenos (tresbolillo)', () => {
    const p = generarPlantilla(geometria, { burden: 0.8, espaciamiento: 1, barrenos: 16 })
    const porFila = {}
    p.barrenos.forEach((b) => { porFila[b.y.toFixed(3)] = (porFila[b.y.toFixed(3)] || 0) + 1 })
    const cuentas = Object.keys(porFila).sort((a, b) => b - a).map((k) => porFila[k])
    expect(cuentas[0]).toBe(p.columnas)
    expect(cuentas[1]).toBe(p.columnas - 1)
  })

  it('los barrenos que caen fuera de la sección se marcan', () => {
    const p = generarPlantilla(geometria, { burden: 1.4, espaciamiento: 1, barrenos: 40 })
    expect(p.fuera).toBeGreaterThan(0)
    expect(p.utiles + p.fuera).toBe(40)
    expect(p.barrenos.filter((b) => !b.dentro)).toHaveLength(p.fuera)
  })

  it('con espaciamiento muy grande cabe una sola columna', () => {
    const p = generarPlantilla({ ancho: 1, alto: 4, muro: 0.6 }, { burden: 1, espaciamiento: 1.8, barrenos: 3 })
    expect(p.columnas).toBe(1)
  })

  it('clasifica los barrenos por rol', () => {
    const roles = new Set(generarPlantilla(geometria, { burden: 0.7, espaciamiento: 0.8, barrenos: 30 }).barrenos.map((b) => b.rol))
    expect(roles).toEqual(new Set(['arranque', 'produccion', 'contorno']))
  })

  it('dentroSeccion respeta hastiales, piso y bóveda', () => {
    const g = { ancho: 4, alto: 4, muro: 0.5 }
    expect(dentroSeccion(g, 2, 1)).toBe(true)
    expect(dentroSeccion(g, 2, 3.9)).toBe(true)
    expect(dentroSeccion(g, 0.05, 3.9)).toBe(false)
    expect(dentroSeccion(g, -1, 1)).toBe(false)
    expect(dentroSeccion(g, 2, -0.5)).toBe(false)
    expect(dentroSeccion({ ancho: 4, alto: 4, muro: 1 }, 2, 1.9, 1.95)).toBe(false)
  })

  it('el área es la del rectángulo más media elipse', () => {
    const { ancho, muro } = seccion(geometria)
    expect(areaSeccion(geometria)).toBeCloseTo(ancho * muro + (Math.PI / 2) * (ancho / 2) * (4 - muro))
  })

  it('más barrenos bien repartidos cubren más frente; sin barrenos no cubre nada', () => {
    const poco = generarPlantilla(geometria, { burden: 0.9, espaciamiento: 1, barrenos: 6 })
    const mas = generarPlantilla(geometria, { burden: 0.9, espaciamiento: 1, barrenos: 20 })
    const util = (p) => p.barrenos.filter((b) => b.dentro)
    expect(cobertura(geometria, util(mas), 0.9, 1)).toBeGreaterThan(cobertura(geometria, util(poco), 0.9, 1))
    expect(cobertura(geometria, [], 0.9, 1)).toBe(0)
  })
})
