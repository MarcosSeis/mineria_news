import { desvio, factorTolerancia, nivelDe, redondearPuntuacion, puntuacionFinal, PESOS, calcularComponentes, generarConsejos } from '@/lib/voladura/scoringEngine'
import { getChallengeByNumber, configOptima } from '@/lib/voladura/challengeEngine'
import { valoresReales, calcularMetricas } from '@/lib/voladura/metricas'
import { normalizarConfig, configInicial, aMetros, deMetros, RANGOS, kgPorMetro } from '@/lib/voladura/config'

const reto = getChallengeByNumber(20)
const evaluar = (cfg) => {
  const valores = valoresReales(normalizarConfig(cfg))
  const metricas = calcularMetricas(valores, reto)
  return { valores, metricas, comp: calcularComponentes(valores, metricas, reto) }
}

describe('scoringEngine', () => {
  it('el desvío vale 1 en el óptimo y decae al alejarse', () => {
    expect(desvio(2, 2, 0.2)).toBe(1)
    expect(desvio(3, 2, 0.2)).toBeLessThan(desvio(2.2, 2, 0.2))
    expect(desvio(0, 2, 0.2)).toBe(0)
    expect(desvio(2, 0, 0.2)).toBe(0)
  })

  it('los retos difíciles toleran menos', () => {
    expect(factorTolerancia(5)).toBeLessThan(factorTolerancia(1))
  })

  it('los pesos suman 1 y el 100 exige todos los indicadores al máximo', () => {
    expect(Object.values(PESOS).reduce((a, b) => a + b, 0)).toBeCloseTo(1)
    expect(puntuacionFinal({ avance: 100, fragmentacion: 100, control: 100, eficiencia: 100 })).toBeCloseTo(100)
  })

  it('el punto dulce del reto da 100 en los cuatro indicadores', () => {
    const { comp } = evaluar(configOptima(reto))
    ;['avance', 'fragmentacion', 'control', 'eficiencia'].forEach((k) => expect(comp[k]).toBeGreaterThan(97))
  })

  it('alejarse del óptimo baja cada indicador relacionado', () => {
    const optimo = configOptima(reto)
    const base = evaluar(optimo).comp
    expect(evaluar({ ...optimo, profundidad: 10 }).comp.avance).toBeLessThan(base.avance)
    expect(evaluar({ ...optimo, espaciamiento: Math.min(100, optimo.espaciamiento + 40) }).comp.fragmentacion).toBeLessThan(base.fragmentacion)
    expect(evaluar({ ...optimo, carga: 100, burden: Math.max(0, optimo.burden - 25) }).comp.control).toBeLessThan(base.control)
    expect(evaluar({ ...optimo, barrenos: 60 }).comp.eficiencia).toBeLessThan(base.eficiencia)
  })

  it('un burden demasiado abierto reduce el avance (el corte no se libera)', () => {
    const optimo = configOptima(reto)
    expect(evaluar({ ...optimo, burden: 100 }).comp.avance).toBeLessThan(evaluar(optimo).comp.avance)
  })

  it('niveles y títulos según la puntuación', () => {
    expect(nivelDe(100).clave).toBe('maestra')
    expect(nivelDe(92).clave).toBe('excelente')
    expect(nivelDe(87).titulo).toBe('BUENA VOLADURA')
    expect(nivelDe(60).clave).toBe('aceptable')
    expect(nivelDe(40).clave).toBe('complicada')
    expect(nivelDe(5).clave).toBe('derrota')
  })

  it('el 100 queda reservado a la puntuación bruta casi perfecta', () => {
    expect(redondearPuntuacion(99.4)).toBe(99)
    expect(redondearPuntuacion(99.6)).toBe(100)
    expect(redondearPuntuacion(100)).toBe(100)
    expect(redondearPuntuacion(87.4)).toBe(87)
  })

  it('los consejos señalan la desviación principal', () => {
    const optimo = configOptima(reto)
    const consejos = (cfg) => { const { valores, metricas } = evaluar(cfg); return generarConsejos(valores, metricas, reto) }
    expect(consejos({ ...optimo, burden: 100 }).join(' ')).toMatch(/Burden demasiado abierto/)
    expect(consejos({ ...optimo, burden: 0 }).join(' ')).toMatch(/Burden muy cerrado/)
    expect(consejos({ ...optimo, espaciamiento: 100 }).join(' ')).toMatch(/Espaciamiento muy abierto/)
    expect(consejos({ ...optimo, espaciamiento: 0 }).join(' ')).toMatch(/demasiado juntos/)
    expect(consejos({ ...optimo, profundidad: 100 }).join(' ')).toMatch(/más profundos/)
    expect(consejos({ ...optimo, profundidad: 0 }).join(' ')).toMatch(/cortos/)
    expect(consejos({ ...optimo, carga: 100, explosivo: 'gel' }).join(' ')).toMatch(/Carga de más/)
    expect(consejos({ ...optimo, carga: 0 }).join(' ')).toMatch(/Carga escasa/)
    expect(consejos({ ...optimo, barrenos: 8 }).join(' ')).toMatch(/no cubre todo el frente/)
    expect(consejos({ ...optimo, barrenos: 60 }).join(' ')).toMatch(/fuera de la sección/)
    const malo = ['anfo', 'emulsion', 'gel', 'eco'].find((e) => e !== reto.optimo.explosivo && reto.optimo.ajusteExplosivo[e] < 0.9)
    if (malo) expect(consejos({ ...optimo, explosivo: malo }).join(' ')).toMatch(/explosivo no era el ideal/)
    const distMala = ['fondo', 'columna', 'desacoplada'].find((d) => reto.optimo.ajusteDistribucion[d] < 0.9)
    expect(consejos({ ...optimo, distribucion: distMala }).join(' ')).toMatch(/distribución de carga/)
    expect(consejos(optimo)).toHaveLength(1)
    expect(consejos({ ...optimo, barrenos: 59 }).length).toBeLessThanOrEqual(3)
  })
})

describe('config', () => {
  it('convierte entre controles y metros', () => {
    expect(aMetros(RANGOS.burden, 0)).toBe(0.5)
    expect(aMetros(RANGOS.burden, 100)).toBe(1.5)
    expect(deMetros(RANGOS.burden, 1)).toBeCloseTo(50)
  })

  it('normaliza valores fuera de rango o ausentes', () => {
    expect(normalizarConfig()).toEqual(configInicial)
    const n = normalizarConfig({ burden: 150, espaciamiento: -5, barrenos: 999.4, explosivo: 'gel', distribucion: 'columna', carga: NaN })
    expect(n).toMatchObject({ burden: 100, espaciamiento: 0, barrenos: 60, explosivo: 'gel', distribucion: 'columna', carga: configInicial.carga })
    expect(normalizarConfig({ barrenos: 1 }).barrenos).toBe(8)
  })

  it('los kg por metro crecen con el diámetro y la densidad', () => {
    expect(kgPorMetro(64, 0.85)).toBeGreaterThan(kgPorMetro(45, 0.85))
    expect(kgPorMetro(45, 1.2)).toBeGreaterThan(kgPorMetro(45, 0.8))
  })
})
