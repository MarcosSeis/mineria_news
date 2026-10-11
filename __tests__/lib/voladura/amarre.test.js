import {
  TIPOS_AMARRE, rangosAmarre, amarreIdeal, correlacion, calidadDeCorrelacion, evaluarAmarre, etiquetasDeOrden, etiquetasUtiles, alternarManual
} from '@/lib/voladura/amarre'
import { generarPlantilla } from '@/lib/voladura/plantilla'
import { getChallengeByNumber, configOptima, RETOS_POR_CICLO } from '@/lib/voladura/challengeEngine'
import { evaluateBlast } from '@/lib/voladura/blastEngine'
import { configInicial } from '@/lib/voladura/config'

const geometria = { ancho: 4.2, alto: 4, muro: 0.6 }
const plantilla = generarPlantilla(geometria, { burden: 0.8, espaciamiento: 1, barrenos: 20 })
const todos = () => true

describe('amarre', () => {
  it('ofrece los tipos de amarre pedidos, incluido el manual', () => {
    expect(TIPOS_AMARRE.map((t) => t.id)).toEqual(['centro', 'v', 'filas', 'inverso', 'simultaneo', 'manual'])
    TIPOS_AMARRE.forEach((t) => expect(t.descripcion).toBeTruthy())
  })

  it('del centro afuera: el arranque sale antes que el contorno', () => {
    const r = rangosAmarre('centro', plantilla, geometria)
    const arranque = plantilla.barrenos.map((b, i) => (b.rol === 'arranque' ? r[i] : null)).filter((v) => v !== null)
    const contorno = plantilla.barrenos.map((b, i) => (b.rol === 'contorno' ? r[i] : null)).filter((v) => v !== null)
    expect(Math.max(...arranque)).toBeLessThan(Math.min(...contorno))
  })

  it('de afuera adentro invierte el orden', () => {
    const c = rangosAmarre('centro', plantilla, geometria)
    const i = rangosAmarre('inverso', plantilla, geometria)
    expect(correlacion(c, i)).toBeCloseTo(-1)
  })

  it('por filas agrupa los barrenos de una misma fila', () => {
    const r = rangosAmarre('filas', plantilla, geometria)
    expect(r).toEqual(plantilla.barrenos.map((b) => b.fila))
    expect(new Set(r).size).toBe(plantilla.filas)
  })

  it('todos juntos no tiene orden y en V abre desde la línea central', () => {
    expect(new Set(rangosAmarre('simultaneo', plantilla, geometria)).size).toBe(1)
    const v = rangosAmarre('v', plantilla, geometria)
    const centrales = plantilla.barrenos.map((b, i) => (Math.abs(b.x - 2.1) < 0.01 ? v[i] : null)).filter((x) => x !== null)
    expect(Math.max(...centrales)).toBe(0)
  })

  it('en manual el orden lo marca el jugador y los sin número salen al final juntos', () => {
    const r = rangosAmarre('manual', plantilla, geometria, [5, 2, 9])
    expect(r[5]).toBe(0)
    expect(r[2]).toBe(1)
    expect(r[9]).toBe(2)
    expect(r[0]).toBe(3)
    expect(r[7]).toBe(3)
  })

  it('la correlación mide el parecido entre órdenes y maneja empates y casos vacíos', () => {
    expect(correlacion([1, 2, 3, 4], [10, 20, 30, 40])).toBeCloseTo(1)
    expect(correlacion([1, 2, 3, 4], [4, 3, 2, 1])).toBeCloseTo(-1)
    expect(correlacion([1, 1, 1, 1], [1, 2, 3, 4])).toBe(0)
    expect(correlacion([1], [1])).toBe(0)
    expect(correlacion([1, 1, 2, 2], [1, 1, 2, 2])).toBeCloseTo(1)
  })

  it('la calidad va de 0,35 (orden opuesto) a 1 (el ideal)', () => {
    expect(calidadDeCorrelacion(1)).toBe(1)
    expect(calidadDeCorrelacion(-1)).toBe(0.35)
    expect(calidadDeCorrelacion(0.5)).toBeGreaterThan(0.35)
    expect(calidadDeCorrelacion(0.5)).toBeLessThan(1)
  })

  it('el amarre ideal depende de la roca y las fracturas', () => {
    expect(amarreIdeal({ competencia: 9 }, 'bajo')).toBe('v')
    expect(amarreIdeal({ competencia: 5 }, 'alto')).toBe('filas')
    expect(amarreIdeal({ competencia: 5 }, 'medio')).toBe('centro')
    const ideales = new Set(Array.from({ length: RETOS_POR_CICLO }, (_, i) => getChallengeByNumber(i + 1).optimo.amarre))
    expect(ideales).toEqual(new Set(['centro', 'v', 'filas']))
  })

  it('elegir el amarre ideal da calidad 1 y los demás menos', () => {
    const e = (tipo, orden = []) => evaluarAmarre(tipo, orden, plantilla, geometria, 'centro', todos)
    expect(e('centro').calidad).toBe(1)
    expect(e('v').calidad).toBeLessThan(1)
    expect(e('v').calidad).toBeGreaterThan(e('simultaneo').calidad)
    expect(e('simultaneo').calidad).toBe(0.35)
    expect(e('inverso').calidad).toBeLessThanOrEqual(e('filas').calidad)
  })

  it('un orden manual igual al ideal también alcanza calidad 1', () => {
    const ideal = rangosAmarre('centro', plantilla, geometria)
    const orden = plantilla.barrenos.map((_, i) => i).sort((a, b) => ideal[a] - ideal[b] || a - b)
    expect(evaluarAmarre('manual', orden, plantilla, geometria, 'centro', todos).corr).toBeGreaterThan(0.95)
  })

  it('numera los rangos como 1, 2, 3 y los empates comparten número', () => {
    expect(etiquetasDeOrden([0, 3, 3, 1, 5])).toEqual([1, 3, 3, 2, 4])
  })

  it('solo se numeran los barrenos que están dentro de la sección, empezando en 1', () => {
    const grande = generarPlantilla(geometria, { burden: 1.3, espaciamiento: 1, barrenos: 40 })
    const e = etiquetasUtiles(rangosAmarre('filas', grande, geometria), grande)
    grande.barrenos.forEach((b, i) => (b.dentro ? expect(e[i]).toBeGreaterThanOrEqual(1) : expect(e[i]).toBeNull()))
    expect(Math.min(...e.filter(Boolean))).toBe(1)
  })

  it('alternarManual suma al final, quita solo el último y no duplica', () => {
    expect(alternarManual([], 4)).toEqual([4])
    expect(alternarManual([4], 7)).toEqual([4, 7])
    expect(alternarManual([4, 7], 7)).toEqual([4])
    expect(alternarManual([4, 7], 4)).toEqual([4, 7])
  })
})

describe('el amarre en la puntuación', () => {
  const reto = getChallengeByNumber(30)
  const optima = configOptima(reto)

  it('la configuración óptima usa el amarre ideal y sigue pudiendo dar 100', () => {
    expect(optima.amarre).toBe(reto.optimo.amarre)
    const algun = Array.from({ length: RETOS_POR_CICLO }, (_, i) => getChallengeByNumber(i + 1)).some((c) => evaluateBlast(configOptima(c), c).score === 100)
    expect(algun).toBe(true)
  })

  it('un mal amarre baja el puntaje respecto al ideal, aunque el resto sea perfecto', () => {
    const malos = Array.from({ length: 60 }, (_, i) => getChallengeByNumber(i + 1)).map((c) => {
      const buena = evaluateBlast(configOptima(c), c)
      const mala = evaluateBlast({ ...configOptima(c), amarre: 'simultaneo', orden: [] }, c)
      return { buena, mala }
    })
    const promedio = malos.reduce((s, { buena, mala }) => s + (buena.score - mala.score), 0) / malos.length
    expect(promedio).toBeGreaterThan(6)
  })

  it('"todos juntos" castiga más que el orden inverso al ideal de frente en la mayoría de los casos y ambos castigan', () => {
    const r = (amarre) => evaluateBlast({ ...optima, amarre, orden: [] }, reto)
    expect(r(reto.optimo.amarre).score).toBeGreaterThan(r('simultaneo').score)
    expect(r(reto.optimo.amarre).score).toBeGreaterThan(r('inverso').score)
  })

  it('el resultado informa del amarre usado y de los rangos', () => {
    const r = evaluateBlast({ ...configInicial, amarre: 'v' }, reto)
    expect(r.amarre.tipo).toBe('v')
    expect(r.amarre.rangos).toHaveLength(r.plantilla.barrenos.length)
    expect(r.amarre.calidad).toBeGreaterThanOrEqual(0.35)
  })

  it('los consejos explican un amarre equivocado', () => {
    const c = Array.from({ length: 40 }, (_, i) => getChallengeByNumber(i + 1)).find((x) => x.optimo.amarre === 'centro')
    const texto = (amarre) => evaluateBlast({ ...configOptima(c), amarre, orden: [] }, c).consejos.join(' ')
    expect(texto('simultaneo')).toMatch(/salieron juntos/)
    expect(texto('inverso')).toMatch(/de afuera hacia adentro/)
    expect(texto('filas')).toMatch(/convenía "del centro afuera"/)
  })

  it('el orden manual cambia el destino (los eventos usan la firma de la configuración)', () => {
    const a = evaluateBlast({ ...optima, amarre: 'manual', orden: [0, 1, 2] }, reto)
    const b = evaluateBlast({ ...optima, amarre: 'manual', orden: [2, 1, 0] }, reto)
    expect(a.amarre.rangos).not.toEqual(b.amarre.rangos)
  })
})
