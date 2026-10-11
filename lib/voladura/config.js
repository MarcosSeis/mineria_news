import { AMARRE_INICIAL, TIPOS_AMARRE } from './amarre'

// Controles del jugador (0-100) y su traducción a valores de juego. Son abstracciones: no son
// recomendaciones reales de diseño.
export const RANGOS = {
  burden: [0.5, 1.5],
  espaciamiento: [0.6, 1.8],
  profundidad: [1.5, 4.5],
  llenado: [0.2, 1.0]
}
export const BARRENOS_MIN = 8
export const BARRENOS_MAX = 60

export const COSTO_PERFORACION_M = 2.5
export const FACTOR_AVANCE = 0.92

export const configInicial = {
  burden: 50,
  espaciamiento: 50,
  profundidad: 50,
  carga: 60,
  barrenos: 24,
  explosivo: 'anfo',
  distribucion: 'fondo',
  amarre: AMARRE_INICIAL,
  orden: []
}

export const aMetros = (rango, v) => rango[0] + (rango[1] - rango[0]) * (v / 100)
export const deMetros = (rango, m) => ((m - rango[0]) / (rango[1] - rango[0])) * 100

export const limitar = (v, min, max) => Math.min(max, Math.max(min, v))

// Normaliza una configuración (p. ej. la guardada en localStorage) a valores válidos.
export function normalizarConfig(config = {}, base = configInicial) {
  const num = (k) => (Number.isFinite(config[k]) ? limitar(config[k], 0, 100) : base[k])
  return {
    burden: num('burden'),
    espaciamiento: num('espaciamiento'),
    profundidad: num('profundidad'),
    carga: num('carga'),
    barrenos: Number.isFinite(config.barrenos) ? limitar(Math.round(config.barrenos), BARRENOS_MIN, BARRENOS_MAX) : base.barrenos,
    explosivo: typeof config.explosivo === 'string' ? config.explosivo : base.explosivo,
    distribucion: typeof config.distribucion === 'string' ? config.distribucion : base.distribucion,
    amarre: TIPOS_AMARRE.some((t) => t.id === config.amarre) ? config.amarre : base.amarre,
    orden: Array.isArray(config.orden) ? [...new Set(config.orden.filter((i) => Number.isInteger(i) && i >= 0))] : []
  }
}

// kg de explosivo que caben en un metro de barreno de ese diámetro (mm) y densidad (g/cm³)
// (con una escala de juego para que las cargas queden en un rango cómodo)
export const ESCALA_CARGA = 1.2
export const kgPorMetro = (diametroMm, densidad) => ESCALA_CARGA * Math.PI * (diametroMm / 2000) ** 2 * densidad * 1000
