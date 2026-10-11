import { explosivos, distribuciones } from '@/data/voladura/explosivos'
import { generarPlantilla, cobertura, areaSeccion } from './plantilla'
import { RANGOS, aMetros, kgPorMetro, COSTO_PERFORACION_M, FACTOR_AVANCE } from './config'
import { evaluarAmarre } from './amarre'

export const buscarExplosivo = (id) => explosivos.find((e) => e.id === id) || explosivos[0]
export const buscarDistribucion = (id) => distribuciones.find((d) => d.id === id) || distribuciones[0]

// Traduce los controles (0-100) del jugador a valores de juego.
export function valoresReales(config) {
  return {
    burden: aMetros(RANGOS.burden, config.burden),
    espaciamiento: aMetros(RANGOS.espaciamiento, config.espaciamiento),
    profundidad: aMetros(RANGOS.profundidad, config.profundidad),
    llenado: aMetros(RANGOS.llenado, config.carga),
    barrenos: config.barrenos,
    explosivo: buscarExplosivo(config.explosivo),
    distribucion: buscarDistribucion(config.distribucion),
    amarre: config.amarre,
    orden: config.orden
  }
}

// Magnitudes de la voladura. "anulados" son índices de barrenos que no llegaron a perforarse o
// iniciarse; "energiaFactor" escala la energía entregada (suministro, agua, etc.).
export function calcularMetricas(valores, desafio, { anulados = new Set(), energiaFactor = 1 } = {}) {
  const plantilla = generarPlantilla(desafio.geometria, valores)
  const activos = plantilla.barrenos.filter((b, i) => b.dentro && !anulados.has(i))
  const perforados = valores.barrenos - anulados.size
  const kgBarreno = valores.llenado * valores.profundidad * kgPorMetro(desafio.diametro, valores.explosivo.densidad)
  const volumen = areaSeccion(desafio.geometria) * valores.profundidad * FACTOR_AVANCE
  const energia = valores.explosivo.energia * valores.distribucion.energia * energiaFactor
  const amarre = evaluarAmarre(valores.amarre, valores.orden, plantilla, desafio.geometria, desafio.optimo.amarre, (i) => plantilla.barrenos[i].dentro && !anulados.has(i))
  return {
    plantilla,
    amarre,
    utiles: activos.length,
    perforados,
    cobertura: cobertura(desafio.geometria, activos, valores.burden, valores.espaciamiento),
    kgBarreno,
    kgTotal: kgBarreno * perforados,
    q: (kgBarreno * activos.length * energia) / volumen,
    costo: kgBarreno * perforados * valores.explosivo.costoKg + perforados * valores.profundidad * COSTO_PERFORACION_M
  }
}
