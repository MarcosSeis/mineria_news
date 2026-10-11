import { eventos, RAREZAS } from '@/data/voladura/eventos'
import { bandaValida, eventosElegibles, probabilidadEvento, etiquetasEfecto, combinarEfectos, MAX_EVENTOS } from '@/lib/voladura/eventEngine'
import { getChallengeByNumber } from '@/lib/voladura/challengeEngine'
import { configInicial } from '@/lib/voladura/config'
import { valoresReales, calcularMetricas } from '@/lib/voladura/metricas'

describe('catálogo de eventos', () => {
  it('las probabilidades base respetan las bandas de rareza', () => {
    eventos.forEach((e) => expect(bandaValida(e)).toBe(true))
    expect(RAREZAS.comun).toMatchObject({ minimo: 0.1, maximo: 0.2 })
  })

  it('los ids son únicos y cada evento tiene humor, detalle e icono', () => {
    expect(new Set(eventos.map((e) => e.id)).size).toBe(eventos.length)
    eventos.forEach((e) => {
      expect(e.humor.length).toBeGreaterThan(0)
      expect(e.detalle).toBeTruthy()
      expect(e.icono).toBeTruthy()
    })
  })

  it('cubre todas las familias de eventos pedidas, incluidos raros y extremos', () => {
    const categorias = new Set(eventos.map((e) => e.categoria))
    ;['perforacion', 'infraestructura', 'suministro', 'ambiente', 'voladura', 'geologia'].forEach((c) => expect(categorias.has(c)).toBe(true))
    expect(new Set(eventos.map((e) => e.rareza))).toEqual(new Set(['comun', 'poco_comun', 'raro', 'extremo']))
  })

  it('el catálogo no menciona lesiones ni accidentes personales', () => {
    const texto = eventos.map((e) => `${e.nombre} ${e.detalle} ${e.humor.join(' ')}`).join(' ')
    expect(texto).not.toMatch(/herid|muert|sangre|lesion|accident|atrapad|trabajador|golpe/i)
  })

  it('los eventos de cielo abierto no aparecen en un reto subterráneo', () => {
    const ids = eventosElegibles(getChallengeByNumber(1)).map((e) => e.id)
    expect(ids).not.toContain('lluvia')
    expect(eventosElegibles({ tipo: 'cielo_abierto', humedad: 'seco' }).map((e) => e.id)).toContain('lluvia')
  })

  it('el agua solo entra en frentes húmedos y la filtración solo en secos', () => {
    const base = { tipo: 'subterranea' }
    expect(eventosElegibles({ ...base, humedad: 'seco' }).map((e) => e.id)).toEqual(expect.arrayContaining(['filtracion_repentina']))
    expect(eventosElegibles({ ...base, humedad: 'seco' }).map((e) => e.id)).not.toContain('entra_agua')
    expect(eventosElegibles({ ...base, humedad: 'humedo' }).map((e) => e.id)).toContain('entra_agua')
  })
})

describe('probabilidades y efectos', () => {
  const desafio = getChallengeByNumber(3)
  const valores = valoresReales(configInicial)
  const metricas = calcularMetricas(valores, desafio)
  const ctx = { valores, metricas, desafio, optimo: desafio.optimo }
  const por = (id) => eventos.find((e) => e.id === id)

  it('la sobrecarga aumenta la probabilidad de flying rocks y sobreexcavación', () => {
    const cargado = { ...ctx, metricas: { ...metricas, q: desafio.optimo.q * 1.5 } }
    const flojo = { ...ctx, metricas: { ...metricas, q: desafio.optimo.q * 0.7 } }
    expect(probabilidadEvento(por('flying_rocks'), cargado)).toBeGreaterThan(probabilidadEvento(por('flying_rocks'), flojo))
    expect(probabilidadEvento(por('sobreexcavacion'), cargado)).toBeGreaterThan(probabilidadEvento(por('sobreexcavacion'), flojo))
    expect(probabilidadEvento(por('exceso_energia'), flojo)).toBe(0)
    expect(probabilidadEvento(por('exceso_energia'), cargado)).toBeGreaterThan(0.1)
  })

  it('un burden cerrado aumenta la probabilidad de flying rocks', () => {
    const cerrado = { ...ctx, valores: { ...valores, burden: desafio.optimo.burden * 0.7 } }
    expect(probabilidadEvento(por('flying_rocks'), cerrado)).toBeGreaterThan(probabilidadEvento(por('flying_rocks'), { ...ctx, valores: { ...valores, burden: desafio.optimo.burden * 1.2 } }))
  })

  it('más barrenos hacen más probable una falla de la barrenadora', () => {
    const muchos = { ...ctx, valores: { ...valores, barrenos: 60 } }
    const pocos = { ...ctx, valores: { ...valores, barrenos: 6 } }
    expect(probabilidadEvento(por('barrenadora_falla'), muchos)).toBeGreaterThan(probabilidadEvento(por('barrenadora_falla'), pocos))
  })

  it('el agua afecta más al ANFO que a la emulsión', () => {
    const anfo = por('entra_agua').efecto({ ...ctx, valores: { ...valores, explosivo: { agua: 0 } } })
    const emulsion = por('entra_agua').efecto({ ...ctx, valores: { ...valores, explosivo: { agua: 1 } } })
    expect(anfo.energia).toBeLessThan(1)
    expect(emulsion.energia).toBeUndefined()
    expect(por('lluvia').efecto({ ...ctx, valores: { ...valores, explosivo: { agua: 0 } } }).energia).toBeLessThan(1)
    expect(por('filtracion_repentina').efecto({ ...ctx, valores: { ...valores, explosivo: { agua: 1 } } }).energia).toBeUndefined()
    expect(por('lluvia').efecto({ ...ctx, valores: { ...valores, explosivo: { agua: 1 } } }).energia).toBeUndefined()
  })

  it('la probabilidad nunca supera el 50 %', () => {
    expect(probabilidadEvento({ prob: 0.4, modulo: () => 10 }, ctx)).toBe(0.5)
  })

  it('combina efectos acumulando deltas, anulaciones y cambios de la roca', () => {
    const elegidos = ['barrenadora_falla', 'explosivo_incompleto', 'zona_competente'].map((id) => ({ evento: por(id) }))
    const total = combinarEfectos(elegidos, ctx)
    expect(total.anular).toBeCloseTo(0.12)
    expect(total.energia).toBeCloseTo(0.88)
    expect(total.optimo.q).toBeCloseTo(1.15)
    expect(total.delta.eficiencia).toBe(-6)
    expect(combinarEfectos([{ evento: por('barrenadora_falla') }, { evento: por('equipo_incompleto') }, { evento: por('equipo_reducido') }, { evento: por('iniciacion_parcial') }, { evento: por('barreno_inutilizable') }], ctx).anular).toBeLessThanOrEqual(0.6)
  })

  it('genera etiquetas legibles del efecto', () => {
    expect(etiquetasEfecto({ delta: { eficiencia: -8, fragmentacion: 5 }, anular: 0.1, energia: 0.8, optimo: { q: 1.1 } }))
      .toEqual(['Fragmentación +5', 'Eficiencia −8', 'Menos barrenos', 'Menos energía', 'Cambió la roca'])
    expect(etiquetasEfecto({ energia: 1.2 })).toEqual(['Más energía'])
    expect(MAX_EVENTOS).toBe(2)
  })

  it('la tasa de imprevistos es razonable (alrededor de 6 de cada 10 voladuras)', async () => {
    const { evaluateBlast } = await import('@/lib/voladura/blastEngine')
    let con = 0
    let total = 0
    for (let i = 1; i <= 365; i += 2) {
      for (let b = 0; b < 100; b += 25) {
        total++
        if (evaluateBlast({ ...configInicial, burden: b + 10 }, getChallengeByNumber(i)).events.length) con++
      }
    }
    expect(con / total).toBeGreaterThan(0.4)
    expect(con / total).toBeLessThan(0.8)
  })
})
