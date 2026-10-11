import { evaluateBlast } from '@/lib/voladura/blastEngine'
import { getChallengeByNumber, configOptima, RETOS_POR_CICLO } from '@/lib/voladura/challengeEngine'
import { configInicial } from '@/lib/voladura/config'
import { crearRng } from '@/lib/voladura/randomSeed'

const reto = getChallengeByNumber(12)

describe('evaluateBlast', () => {
  it('devuelve puntuación, indicadores y eventos', () => {
    const r = evaluateBlast(configInicial, reto)
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
    ;['advance', 'fragmentation', 'overbreak', 'efficiency'].forEach((k) => {
      expect(Number.isInteger(r[k])).toBe(true)
      expect(r[k]).toBeGreaterThanOrEqual(0)
      expect(r[k]).toBeLessThanOrEqual(100)
    })
    expect(Array.isArray(r.events)).toBe(true)
    expect(r.nivel.titulo).toBeTruthy()
    expect(r.mensaje).toBeTruthy()
    expect(r.consejos.length).toBeGreaterThan(0)
  })

  it('es determinista: misma configuración y reto, mismo resultado', () => {
    const cfg = { ...configInicial, burden: 62, barrenos: 28 }
    expect(evaluateBlast(cfg, reto)).toEqual(evaluateBlast(cfg, reto))
  })

  it('normaliza configuraciones inválidas', () => {
    const r = evaluateBlast({ burden: 500, barrenos: 'x', explosivo: 'inexistente' }, reto)
    expect(r.score).toBeGreaterThanOrEqual(0)
  })

  it('la configuración óptima rinde mucho más que la inicial en casi todos los retos', () => {
    let mejores = 0
    for (let i = 1; i <= RETOS_POR_CICLO; i += 5) {
      const c = getChallengeByNumber(i)
      if (evaluateBlast(configOptima(c), c).score > evaluateBlast(configInicial, c).score + 15) mejores++
    }
    expect(mejores).toBeGreaterThan(60)
  })

  it('un diseño pobre puntúa claramente peor que uno bueno', () => {
    const pobre = { burden: 5, espaciamiento: 95, profundidad: 5, carga: 5, barrenos: 8, explosivo: 'gel', distribucion: 'desacoplada' }
    expect(evaluateBlast(pobre, reto).score).toBeLessThan(evaluateBlast(configOptima(reto), reto).score)
  })

  it('el 100 es difícil: casi nunca sale con un diseño aproximado', () => {
    let perfectos = 0
    let total = 0
    for (let i = 1; i <= RETOS_POR_CICLO; i += 3) {
      const c = getChallengeByNumber(i)
      const cfg = configOptima(c)
      const rng = crearRng(`prueba-${i}`)
      for (let k = 0; k < 4; k++) {
        const j = (v, a) => Math.max(0, Math.min(100, v + rng.entre(-a, a)))
        const r = evaluateBlast({ ...cfg, burden: j(cfg.burden, 8), espaciamiento: j(cfg.espaciamiento, 8), profundidad: j(cfg.profundidad, 8), carga: j(cfg.carga, 10), barrenos: cfg.barrenos + rng.entero(-3, 3) }, c)
        total++
        if (r.score === 100) perfectos++
      }
    }
    expect(perfectos / total).toBeLessThan(0.03)
  })

  it('un evento negativo impide llegar al 100', () => {
    for (let i = 1; i <= RETOS_POR_CICLO; i++) {
      const c = getChallengeByNumber(i)
      const r = evaluateBlast(configOptima(c), c)
      if (r.events.some((e) => !e.positivo)) expect(r.score).toBeLessThan(100)
    }
  })

  it('en el entorno ideal sin imprevistos se puede llegar al 100', () => {
    const hay = Array.from({ length: RETOS_POR_CICLO }, (_, i) => getChallengeByNumber(i + 1)).some((c) => evaluateBlast(configOptima(c), c).score === 100)
    expect(hay).toBe(true)
  })

  it('los eventos traen texto de humor, detalle, icono y etiquetas, y nunca hablan de personas lesionadas', () => {
    const textos = []
    let con = 0
    for (let i = 1; i <= RETOS_POR_CICLO; i++) {
      const c = getChallengeByNumber(i)
      evaluateBlast(configInicial, c).events.forEach((e) => {
        con++
        expect(e.humor).toBeTruthy()
        expect(e.detalle).toBeTruthy()
        expect(e.icono).toBeTruthy()
        expect(e.rarezaEtiqueta).toBeTruthy()
        textos.push(`${e.nombre} ${e.humor} ${e.detalle}`)
      })
    }
    expect(con).toBeGreaterThan(50)
    expect(textos.join(' ')).not.toMatch(/herid|muert|sangre|lesion|accident|atrapad|golpe/i)
  })

  it('hay como mucho dos eventos por voladura y de categorías distintas', () => {
    for (let i = 1; i <= RETOS_POR_CICLO; i += 2) {
      const { events } = evaluateBlast(configInicial, getChallengeByNumber(i))
      expect(events.length).toBeLessThanOrEqual(2)
      expect(new Set(events.map((e) => e.categoria)).size).toBe(events.length)
    }
  })

  it('configuraciones distintas del mismo reto viven eventos distintos', () => {
    const c = getChallengeByNumber(30)
    const firmas = new Set()
    for (let b = 0; b <= 100; b += 4) firmas.add(evaluateBlast({ ...configInicial, burden: b }, c).events.map((e) => e.id).join())
    expect(firmas.size).toBeGreaterThan(2)
  })

  it('con eventos que anulan barrenos informa de cuáles', () => {
    let visto = false
    for (let i = 1; i <= RETOS_POR_CICLO && !visto; i++) {
      const r = evaluateBlast(configInicial, getChallengeByNumber(i))
      if (r.events.some((e) => e.etiquetas.includes('Menos barrenos'))) {
        visto = true
        expect(r.anulados.length).toBeGreaterThan(0)
      }
    }
    expect(visto).toBe(true)
  })

  it('mensaje sin imprevistos según el nivel', () => {
    const sinEvento = Array.from({ length: 60 }, (_, i) => evaluateBlast(configInicial, getChallengeByNumber(i + 1))).find((r) => r.events.length === 0)
    expect(sinEvento.mensaje).toBeTruthy()
  })

  it('el consejo reconoce un diseño cercano al punto dulce', () => {
    const ok = Array.from({ length: 80 }, (_, i) => getChallengeByNumber(i + 1)).map((c) => evaluateBlast(configOptima(c), c)).find((r) => r.consejos[0].startsWith('Diseño muy cerca'))
    expect(ok).toBeTruthy()
  })
})
