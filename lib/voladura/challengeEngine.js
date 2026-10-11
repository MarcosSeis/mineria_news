import { rocas, etiquetaCompetencia } from '@/data/voladura/rocas'
import { geometriasSubterraneas, zonas } from '@/data/voladura/geometrias'
import { explosivos, distribuciones, ordenDistribucion } from '@/data/voladura/explosivos'
import { diaDelAnio, fechaLocal } from '@/lib/mineralWordle'
import { crearRng } from './randomSeed'
import { generarPlantilla, cobertura, areaSeccion } from './plantilla'
import { RANGOS, BARRENOS_MIN, BARRENOS_MAX, FACTOR_AVANCE, kgPorMetro, limitar, deMetros } from './config'
import { calcularMetricas } from './metricas'
import { amarreIdeal } from './amarre'
import { eventos } from '@/data/voladura/eventos'

// Primer día del juego: es el reto #1. Cambiarlo reenumera todos los retos.
export const FECHA_INICIO = new Date(2026, 9, 11)
export const RETOS_POR_CICLO = 365

const DIAMETROS = [45, 51, 64, 76]
const HUMEDAD = { seco: 0, humedo: 0.5, muy_humedo: 1 }
const DIFICULTAD_SEMANAL = [2, 1, 2, 3, 3, 4, 5]
const redondear = (v, decimales = 2) => Number(v.toFixed(decimales))

export const numeroDeReto = (fecha) => diaDelAnio(fecha) - diaDelAnio(FECHA_INICIO) + 1

const mazos = new Map()

// Baraja de 365 combinaciones roca × geometría sin repeticiones consecutivas.
function mazoDelCiclo(ciclo) {
  if (mazos.has(ciclo)) return mazos.get(ciclo)
  const combinaciones = rocas.flatMap((roca) => geometriasSubterraneas.map((geometria) => ({ roca, geometria })))
  const mazo = []
  for (let bloque = 0; mazo.length < RETOS_POR_CICLO; bloque++) {
    const orden = crearRng(`voladura-mazo-${ciclo}-${bloque}`).mezclar(combinaciones)
    if (mazo.length && orden[0] === mazo[mazo.length - 1]) [orden[0], orden[1]] = [orden[1], orden[0]]
    mazo.push(...orden)
  }
  const recortado = mazo.slice(0, RETOS_POR_CICLO)
  mazos.set(ciclo, recortado)
  return recortado
}

export function ajustesExplosivo(roca, humedad) {
  const ideal = 0.8 + 0.05 * roca.competencia
  const crudo = explosivos.map((e) => ({
    id: e.id,
    valor: Math.exp(-(((e.energia - ideal) / 0.28) ** 2)) * (1 - HUMEDAD[humedad] * (1 - e.agua) * 0.6)
  }))
  const mejor = Math.max(...crudo.map((c) => c.valor))
  return Object.fromEntries(crudo.map((c) => [c.id, redondear(c.valor / mejor, 3)]))
}

export function distribucionIdeal(roca, fracturamiento) {
  if (roca.competencia >= 8) return 'columna'
  if (fracturamiento === 'alto' || roca.competencia <= 3) return 'desacoplada'
  return 'fondo'
}

export function ajustesDistribucion(ideal) {
  const posicion = (id) => ordenDistribucion.indexOf(id)
  return Object.fromEntries(distribuciones.map((d) => {
    const distancia = Math.abs(posicion(d.id) - posicion(ideal))
    return [d.id, distancia === 0 ? 1 : distancia === 1 ? 0.88 : 0.72]
  }))
}

// Menor número de barrenos con el que el patrón óptimo logra su mejor cobertura del frente.
// Se deja de buscar cuando los barrenos nuevos ya caen fuera de la sección.
function barrenosParaCubrir(geometria, burden, espaciamiento) {
  const serie = []
  for (let n = BARRENOS_MIN; n <= BARRENOS_MAX; n++) {
    const plantilla = generarPlantilla(geometria, { burden, espaciamiento, barrenos: n })
    if (plantilla.fuera > 6) break
    serie.push({ n, cubierta: cobertura(geometria, plantilla.barrenos.filter((b) => b.dentro), burden, espaciamiento) })
  }
  const mejor = Math.max(...serie.map((p) => p.cubierta))
  return serie.find((p) => p.cubierta >= mejor - 0.01).n
}

function construirOptimo(rng, base) {
  const { geometria, roca, humedad, fracturamiento, avanceObjetivo } = base
  const explosivoAjustes = ajustesExplosivo(roca, humedad)
  const explosivo = explosivos.find((e) => explosivoAjustes[e.id] === 1)
  const distId = distribucionIdeal(roca, fracturamiento)
  const distribucion = distribuciones.find((d) => d.id === distId)
  const profundidad = redondear(avanceObjetivo / FACTOR_AVANCE)
  const factorFractura = { bajo: 1, medio: 0.96, alto: 0.88 }[fracturamiento]
  const q = redondear((0.8 + 0.14 * roca.competencia) * factorFractura)
  const volumen = areaSeccion(geometria) * profundidad * FACTOR_AVANCE
  const sesgoBurden = rng.entre(-0.06, 0.06)
  const razon = rng.entre(1.1, 1.3)

  let elegido = null
  for (const diametro of rng.mezclar(DIAMETROS)) {
    const burden = redondear(limitar(1.25 - 0.05 * roca.competencia + sesgoBurden + (diametro - 45) * 0.004, 0.65, 1.3))
    const espaciamiento = redondear(limitar(burden * razon, 0.75, 1.6))
    const barrenos = barrenosParaCubrir(geometria, burden, espaciamiento)
    const { barrenos: lista, utiles } = generarPlantilla(geometria, { burden, espaciamiento, barrenos })
    const kgNecesarios = (q * volumen) / (explosivo.energia * distribucion.energia)
    const llenado = kgNecesarios / (utiles * profundidad * kgPorMetro(diametro, explosivo.densidad))
    const candidato = { diametro, burden, espaciamiento, barrenos, utiles, llenado, lista }
    if (!elegido || Math.abs(llenado - 0.68) < Math.abs(elegido.llenado - 0.68)) elegido = candidato
    if (llenado >= 0.45 && llenado <= 0.9) break
  }

  const optimo = {
    burden: elegido.burden,
    espaciamiento: elegido.espaciamiento,
    profundidad,
    barrenos: elegido.barrenos,
    utiles: elegido.utiles,
    llenado: redondear(limitar(elegido.llenado, RANGOS.llenado[0], RANGOS.llenado[1]), 3),
    q,
    explosivo: explosivo.id,
    distribucion: distId,
    amarre: amarreIdeal(roca, fracturamiento),
    ajusteExplosivo: explosivoAjustes,
    ajusteDistribucion: ajustesDistribucion(distId),
    cobertura: 1
  }
  return { optimo, diametro: elegido.diametro }
}

// Calcula con la propia plantilla y fórmulas del juego los valores que dejan el reto en su punto dulce.
function completarOptimo(desafio) {
  const { optimo } = desafio
  const valores = {
    burden: optimo.burden,
    espaciamiento: optimo.espaciamiento,
    profundidad: optimo.profundidad,
    llenado: optimo.llenado,
    barrenos: optimo.barrenos,
    explosivo: explosivos.find((e) => e.id === optimo.explosivo),
    distribucion: distribuciones.find((d) => d.id === optimo.distribucion),
    amarre: optimo.amarre,
    orden: []
  }
  const metricas = calcularMetricas(valores, desafio)
  optimo.cobertura = metricas.cobertura
  optimo.perforados = metricas.perforados
  optimo.q = metricas.q
  optimo.costoPorMetro = metricas.costo / desafio.avanceObjetivo
  return desafio
}

// Controles (0-100) que producen la voladura óptima del reto.
export function configOptima(desafio) {
  const { optimo } = desafio
  return {
    burden: deMetros(RANGOS.burden, optimo.burden),
    espaciamiento: deMetros(RANGOS.espaciamiento, optimo.espaciamiento),
    profundidad: deMetros(RANGOS.profundidad, optimo.profundidad),
    carga: deMetros(RANGOS.llenado, optimo.llenado),
    barrenos: optimo.barrenos,
    explosivo: optimo.explosivo,
    distribucion: optimo.distribucion,
    amarre: optimo.amarre,
    orden: []
  }
}

const cache = new Map()

export function getChallengeByNumber(numero) {
  if (cache.has(numero)) return cache.get(numero)
  const indice = numero - 1
  const ciclo = Math.floor(indice / RETOS_POR_CICLO)
  const posicion = ((indice % RETOS_POR_CICLO) + RETOS_POR_CICLO) % RETOS_POR_CICLO
  const semilla = `voladura-${ciclo}-${posicion}`
  const rng = crearRng(semilla)
  const { roca, geometria: forma } = mazoDelCiclo(ciclo)[posicion]

  const geometria = {
    ...forma,
    ancho: redondear(forma.ancho * rng.entre(0.92, 1.1), 1),
    alto: redondear(forma.alto * rng.entre(0.92, 1.1), 1)
  }
  const humedad = rng.ponderado({ seco: 55, humedo: 30, muy_humedo: 15 })
  const fracturamiento = rng.ponderado({ bajo: 35, medio: 40, alto: 25 })
  const sorteo = rng.siguiente()
  const dificultad = limitar(DIFICULTAD_SEMANAL[posicion % 7] + (sorteo < 0.2 ? 1 : sorteo > 0.85 ? -1 : 0), 1, 5)
  const avanceObjetivo = redondear(rng.entre(1.8, 3.9), 1)
  const nivel = rng.entero(4, 32) * 50

  const base = { geometria, roca, humedad, fracturamiento, avanceObjetivo }
  const { optimo, diametro } = construirOptimo(rng, base)

  const desafio = completarOptimo({
    numero,
    semilla,
    tipo: 'subterranea',
    ...base,
    competencia: etiquetaCompetencia(roca.competencia),
    nivel: `Nivel ${nivel}`,
    zona: rng.elegir(zonas),
    diametro,
    dificultad,
    // Cada escenario admite solo parte del catálogo de imprevistos: da variedad entre días.
    eventosPermitidos: eventos.filter(() => rng.siguiente() < 0.6).map((e) => e.id),
    optimo
  })
  cache.set(numero, desafio)
  return desafio
}

// Todos los jugadores reciben el mismo reto para una misma fecha.
export function getDailyChallenge(fecha = new Date()) {
  return { ...getChallengeByNumber(numeroDeReto(fecha)), fecha: fechaLocal(fecha) }
}

// Milisegundos que faltan para la medianoche local (el próximo reto).
export function msHastaProximoReto(ahora = new Date()) {
  const manana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1)
  return manana - ahora
}
