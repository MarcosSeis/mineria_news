import { RAREZAS } from '@/data/voladura/eventos'
import { crearRng } from './randomSeed'
import { normalizarConfig } from './config'
import { valoresReales, calcularMetricas } from './metricas'
import { calcularComponentes, puntuacionFinal, redondearPuntuacion, nivelDe, generarConsejos } from './scoringEngine'
import { sortearEventos, combinarEfectos, etiquetasEfecto, firmaConfig } from './eventEngine'

const acotar = (v) => Math.min(100, Math.max(0, v))

const MENSAJE_SIN_EVENTO = {
  maestra: 'Sin imprevistos y casi sin margen de error: de libro.',
  excelente: 'Sin imprevistos: la roca y el plano se pusieron de acuerdo.',
  buena: 'Sin imprevistos: lo que diseñaste es lo que salió.',
  aceptable: 'Sin imprevistos: esta vez la culpa no fue de la geología.',
  complicada: 'Sin imprevistos que lo justifiquen. Toca revisar el diseño.',
  derrota: 'Esta vez la roca no necesitó ayuda de la geología.'
}

// Evalúa una voladura: devuelve la puntuación, los indicadores y los eventos ocurridos.
// Es determinista: el mismo reto y la misma configuración producen siempre el mismo resultado.
export function evaluateBlast(configuration, challenge) {
  const config = normalizarConfig(configuration)
  const valores = valoresReales(config)
  const base = calcularMetricas(valores, challenge)
  const ctx = { valores, metricas: base, desafio: challenge, optimo: challenge.optimo }

  const sorteados = sortearEventos(challenge, config, ctx)
  const efectos = combinarEfectos(sorteados, ctx)

  const indicesUtiles = base.plantilla.barrenos.flatMap((b, i) => (b.dentro ? [i] : []))
  const cantidadAnulada = Math.round(indicesUtiles.length * efectos.anular)
  const anulados = new Set(crearRng(`${challenge.semilla}|anula|${firmaConfig(config)}`).mezclar(indicesUtiles).slice(0, cantidadAnulada))
  const hayCambios = anulados.size > 0 || efectos.energia !== 1
  const metricas = hayCambios ? calcularMetricas(valores, challenge, { anulados, energiaFactor: efectos.energia }) : base

  const { optimo } = challenge
  const optimoReal = {
    ...optimo,
    q: optimo.q * efectos.optimo.q,
    burden: optimo.burden * efectos.optimo.burden,
    espaciamiento: optimo.espaciamiento * efectos.optimo.espaciamiento
  }
  const componentes = calcularComponentes(valores, metricas, challenge, optimoReal)
  const ajustados = {
    avance: acotar(componentes.avance + efectos.delta.avance),
    fragmentacion: acotar(componentes.fragmentacion + efectos.delta.fragmentacion),
    control: acotar(componentes.control + efectos.delta.control),
    eficiencia: acotar(componentes.eficiencia + efectos.delta.eficiencia)
  }

  const bruta = puntuacionFinal(ajustados)
  // Con un evento negativo no se llega al 100: se reserva para el diseño perfecto sin imprevistos.
  const hayPenalizacion = Object.values(efectos.delta).some((d) => d < 0) || anulados.size > 0 || efectos.energia < 1
  const score = redondearPuntuacion(hayPenalizacion ? Math.min(bruta, 99) : bruta)
  const nivel = nivelDe(score)

  const events = sorteados.map(({ evento, probabilidad, humor }) => ({
    id: evento.id,
    nombre: evento.nombre,
    categoria: evento.categoria,
    rareza: evento.rareza,
    rarezaEtiqueta: RAREZAS[evento.rareza].etiqueta,
    probabilidad,
    icono: evento.icono,
    positivo: !!evento.positivo,
    detalle: evento.detalle,
    humor,
    etiquetas: etiquetasEfecto(evento.efecto(ctx))
  }))

  return {
    score,
    nivel,
    advance: Math.round(ajustados.avance),
    fragmentation: Math.round(ajustados.fragmentacion),
    overbreak: Math.round(ajustados.control),
    efficiency: Math.round(ajustados.eficiencia),
    events,
    mensaje: events[0]?.humor ?? MENSAJE_SIN_EVENTO[nivel.clave],
    consejos: generarConsejos(valores, metricas, challenge),
    avanceMetros: Number(componentes.avanceMetros.toFixed(2)),
    plantilla: base.plantilla,
    anulados: [...anulados],
    amarre: { tipo: config.amarre, corr: metricas.amarre.corr, calidad: metricas.amarre.calidad, rangos: metricas.amarre.rangos },
    cobertura: metricas.cobertura
  }
}
