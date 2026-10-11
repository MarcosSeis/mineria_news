import {
  getDailyChallenge, getChallengeByNumber, configOptima, numeroDeReto, msHastaProximoReto, ajustesExplosivo,
  distribucionIdeal, ajustesDistribucion, FECHA_INICIO, RETOS_POR_CICLO
} from '@/lib/voladura/challengeEngine'
import { RANGOS, BARRENOS_MIN, BARRENOS_MAX } from '@/lib/voladura/config'
import { rocas } from '@/data/voladura/rocas'

const dentro = (v, [min, max]) => v >= min && v <= max

describe('retos diarios', () => {
  it('todos los usuarios reciben el mismo reto para la misma fecha', () => {
    const a = getDailyChallenge(new Date(2026, 10, 3, 8, 0))
    const b = getDailyChallenge(new Date(2026, 10, 3, 22, 30))
    expect(b).toEqual(a)
  })

  it('el primer día es el reto #1 y los siguientes avanzan de uno en uno', () => {
    expect(numeroDeReto(FECHA_INICIO)).toBe(1)
    expect(numeroDeReto(new Date(2026, 9, 12))).toBe(2)
    expect(getDailyChallenge(FECHA_INICIO).fecha).toBe('2026-10-11')
  })

  it('sin argumentos usa la fecha de hoy', () => {
    expect(getDailyChallenge().numero).toBe(numeroDeReto(new Date()))
  })

  it('días distintos dan retos distintos', () => {
    expect(getChallengeByNumber(5).semilla).not.toBe(getChallengeByNumber(6).semilla)
  })

  it('soporta los 365 retos con variedad y sin repetir la combinación dos días seguidos', () => {
    const retos = Array.from({ length: RETOS_POR_CICLO }, (_, i) => getChallengeByNumber(i + 1))
    expect(new Set(retos.map((r) => r.roca.id)).size).toBe(rocas.length)
    expect(new Set(retos.map((r) => r.geometria.id)).size).toBe(4)
    expect(new Set(retos.map((r) => r.dificultad))).toEqual(new Set([1, 2, 3, 4, 5]))
    expect(new Set(retos.map((r) => r.humedad)).size).toBe(3)
    expect(new Set(retos.map((r) => r.fracturamiento)).size).toBe(3)
    expect(new Set(retos.map((r) => r.diametro)).size).toBeGreaterThan(1)
    expect(new Set(retos.map((r) => `${r.roca.id}-${r.geometria.id}-${r.optimo.burden}-${r.optimo.espaciamiento}-${r.avanceObjetivo}`)).size).toBeGreaterThan(300)
    for (let i = 1; i < retos.length; i++) {
      expect(`${retos[i].roca.id}/${retos[i].geometria.id}`).not.toBe(`${retos[i - 1].roca.id}/${retos[i - 1].geometria.id}`)
    }
  })

  it('el punto dulce de cada reto es alcanzable con los controles del juego', () => {
    for (let i = 1; i <= RETOS_POR_CICLO; i++) {
      const { optimo } = getChallengeByNumber(i)
      expect(dentro(optimo.burden, RANGOS.burden)).toBe(true)
      expect(dentro(optimo.espaciamiento, RANGOS.espaciamiento)).toBe(true)
      expect(dentro(optimo.profundidad, RANGOS.profundidad)).toBe(true)
      expect(dentro(optimo.llenado, RANGOS.llenado)).toBe(true)
      expect(dentro(optimo.barrenos, [BARRENOS_MIN, BARRENOS_MAX])).toBe(true)
      const c = configOptima(getChallengeByNumber(i))
      ;['burden', 'espaciamiento', 'profundidad', 'carga'].forEach((k) => expect(dentro(c[k], [0, 100])).toBe(true))
    }
  })

  it('la rotación continúa en el siguiente ciclo con otro mazo', () => {
    const siguiente = getChallengeByNumber(RETOS_POR_CICLO + 1)
    expect(siguiente.semilla).toBe('voladura-1-0')
    expect(getChallengeByNumber(-3).semilla).toMatch(/^voladura--1-/)
  })

  it('cada escenario admite solo parte de los eventos', () => {
    const permitidos = getChallengeByNumber(12).eventosPermitidos
    expect(permitidos.length).toBeGreaterThan(3)
    expect(new Set(Array.from({ length: 30 }, (_, i) => getChallengeByNumber(i + 1).eventosPermitidos.join())).size).toBeGreaterThan(20)
  })

  it('el explosivo ideal depende de la roca y de la humedad', () => {
    const seca = ajustesExplosivo({ competencia: 5 }, 'seco')
    const mojada = ajustesExplosivo({ competencia: 5 }, 'muy_humedo')
    expect(Math.max(...Object.values(seca))).toBe(1)
    expect(seca.anfo).toBe(1)
    expect(mojada.anfo).toBeLessThan(seca.anfo)
    expect(mojada.emulsion).toBe(1)
    expect(ajustesExplosivo({ competencia: 10 }, 'seco').gel).toBe(1)
  })

  it('la distribución ideal y sus ajustes', () => {
    expect(distribucionIdeal({ competencia: 9 }, 'bajo')).toBe('columna')
    expect(distribucionIdeal({ competencia: 5 }, 'alto')).toBe('desacoplada')
    expect(distribucionIdeal({ competencia: 2 }, 'bajo')).toBe('desacoplada')
    expect(distribucionIdeal({ competencia: 5 }, 'medio')).toBe('fondo')
    expect(ajustesDistribucion('fondo')).toEqual({ fondo: 1, columna: 0.88, desacoplada: 0.88 })
    expect(ajustesDistribucion('columna').desacoplada).toBe(0.72)
  })

  it('la cuenta atrás llega a la medianoche local', () => {
    expect(msHastaProximoReto(new Date(2026, 5, 1, 23, 0, 0))).toBe(3600000)
    expect(msHastaProximoReto(new Date(2026, 11, 31, 0, 0, 0))).toBe(86400000)
  })
})
