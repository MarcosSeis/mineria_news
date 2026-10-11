import { eventos, RAREZAS } from '@/data/voladura/eventos'
import { crearRng } from './randomSeed'

export const MAX_EVENTOS = 2
const COMPONENTES = ['avance', 'fragmentacion', 'control', 'eficiencia']
const NOMBRES = { avance: 'Avance', fragmentacion: 'Fragmentación', control: 'Control', eficiencia: 'Eficiencia' }

export const eventosElegibles = (desafio) =>
  eventos.filter((e) =>
    (e.tipos || ['subterranea', 'cielo_abierto']).includes(desafio.tipo) &&
    (!desafio.eventosPermitidos || desafio.eventosPermitidos.includes(e.id)) &&
    (!e.aplica || e.aplica(desafio)))

export function probabilidadEvento(evento, ctx) {
  const factor = evento.modulo ? evento.modulo(ctx) : 1
  return Math.min(0.5, Math.max(0, evento.prob * factor))
}

// Firma estable de la configuración: la misma voladura en el mismo reto vive el mismo destino.
export const firmaConfig = (config) =>
  [config.burden, config.espaciamiento, config.profundidad, config.carga, config.barrenos, config.explosivo, config.distribucion, config.amarre, (config.orden || []).join(',')].join('|')

// Cada evento elegible recibe siempre una tirada, así el resultado solo depende del reto y de la configuración.
export function sortearEventos(desafio, config, ctx) {
  const rng = crearRng(`${desafio.semilla}|eventos|${firmaConfig(config)}`)
  const elegidos = []
  eventosElegibles(desafio).forEach((evento) => {
    const probabilidad = probabilidadEvento(evento, ctx)
    const tirada = rng.siguiente()
    const humor = rng.elegir(evento.humor)
    if (tirada < probabilidad) elegidos.push({ evento, probabilidad, humor })
  })
  const usadas = new Set()
  return elegidos
    .sort((a, b) => a.probabilidad - b.probabilidad)
    .filter(({ evento }) => (usadas.has(evento.categoria) ? false : usadas.add(evento.categoria)))
    .slice(0, MAX_EVENTOS)
}

export function combinarEfectos(sorteados, ctx) {
  const total = { delta: { avance: 0, fragmentacion: 0, control: 0, eficiencia: 0 }, anular: 0, energia: 1, optimo: { q: 1, burden: 1, espaciamiento: 1 } }
  sorteados.forEach(({ evento }) => {
    const efecto = evento.efecto(ctx)
    COMPONENTES.forEach((c) => { total.delta[c] += efecto.delta?.[c] || 0 })
    total.anular = Math.min(0.6, total.anular + (efecto.anular || 0))
    total.energia *= efecto.energia ?? 1
    Object.keys(total.optimo).forEach((k) => { total.optimo[k] *= efecto.optimo?.[k] ?? 1 })
  })
  return total
}

// Etiquetas cortas del efecto, p. ej. "Eficiencia −8" o "Menos barrenos".
export function etiquetasEfecto(efecto) {
  const etiquetas = COMPONENTES
    .filter((c) => efecto.delta?.[c])
    .map((c) => `${NOMBRES[c]} ${efecto.delta[c] > 0 ? '+' : '−'}${Math.abs(efecto.delta[c])}`)
  if (efecto.anular) etiquetas.push('Menos barrenos')
  if (efecto.energia && efecto.energia !== 1) etiquetas.push(efecto.energia < 1 ? 'Menos energía' : 'Más energía')
  if (efecto.optimo) etiquetas.push('Cambió la roca')
  return etiquetas
}

// Un evento con probabilidad base fuera de su banda de rareza es un error de datos.
export const bandaValida = (evento) => {
  const banda = RAREZAS[evento.rareza]
  return !!banda && evento.prob >= banda.minimo && evento.prob <= banda.maximo && (evento.rareza !== 'extremo' || evento.prob < 0.01)
}
