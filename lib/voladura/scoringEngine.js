import { FACTOR_AVANCE } from './config'
import { TIPOS_AMARRE } from './amarre'

export const PESOS = { avance: 0.3, fragmentacion: 0.25, control: 0.2, eficiencia: 0.25 }

// 1 cuando el valor coincide con el óptimo y cae con la distancia relativa (escala logarítmica).
export function desvio(valor, optimo, tolerancia) {
  if (!(valor > 0) || !(optimo > 0)) return 0
  return Math.exp(-((Math.log(valor / optimo) / tolerancia) ** 2))
}

// Los retos difíciles toleran menos error.
export const factorTolerancia = (dificultad) => 1.25 - 0.1 * dificultad

const acotar = (v) => Math.min(100, Math.max(0, v))

export function avanceReal(valores, metricas, optimo) {
  const energia = Math.min(1, metricas.q / (0.9 * optimo.q)) ** 0.7
  const corte = valores.burden <= 1.05 * optimo.burden ? 1 : (1.05 * optimo.burden / valores.burden) ** 2
  const cubierta = Math.min(1, metricas.cobertura / optimo.cobertura) ** 0.6
  const secuencia = 0.75 + 0.25 * metricas.amarre.calidad
  return valores.profundidad * FACTOR_AVANCE * energia * corte * cubierta * secuencia
}

// Puntuaciones 0-100 de avance, fragmentación, control y eficiencia. No es física: es una
// abstracción consistente donde solo el punto dulce del reto rinde 100.
export function calcularComponentes(valores, metricas, desafio, optimo = desafio.optimo) {
  const t = factorTolerancia(desafio.dificultad)
  const gBurden = desvio(valores.burden, optimo.burden, 0.2 * t)
  const gEspaciamiento = desvio(valores.espaciamiento, optimo.espaciamiento, 0.22 * t)
  const gCarga = desvio(metricas.q, optimo.q, 0.22 * t)
  const gUtiles = desvio(metricas.utiles, optimo.utiles, 0.25 * t)
  const gProfundidad = desvio(valores.profundidad, optimo.profundidad, 0.15 * t)
  const gExplosivo = optimo.ajusteExplosivo[valores.explosivo.id] ?? 0.7
  const gDistribucion = optimo.ajusteDistribucion[valores.distribucion.id] ?? 0.7
  const cubierta = Math.min(1, metricas.cobertura / optimo.cobertura)

  const real = avanceReal(valores, metricas, optimo)
  const avance = 100 * Math.min(1, real / desafio.avanceObjetivo) ** 1.3

  const gAmarre = metricas.amarre.calidad
  const fragmentacion = 100 * gBurden ** 0.18 * gEspaciamiento ** 0.18 * gCarga ** 0.2 * gExplosivo ** 0.12 * gUtiles ** 0.08 * cubierta ** 0.06 * gAmarre ** 0.18

  const cargaControl = metricas.q > optimo.q ? desvio(metricas.q, optimo.q, 0.16 * t) : desvio(metricas.q, optimo.q, 0.35 * t)
  const burdenControl = valores.burden < optimo.burden ? desvio(valores.burden, optimo.burden, 0.16 * t) : desvio(valores.burden, optimo.burden, 0.35 * t)
  const dentro = metricas.perforados ? metricas.utiles / metricas.perforados : 0
  const control = 100 * gDistribucion ** 0.2 * cargaControl ** 0.25 * burdenControl ** 0.15 * Math.min(1, dentro / (optimo.utiles / optimo.perforados)) ** 0.08 * gProfundidad ** 0.12 * gAmarre ** 0.2

  const metros = Math.min(Math.max(real, 0.2), desafio.avanceObjetivo)
  const costoPorMetro = metricas.costo / metros
  const eficiencia = 100 * Math.min(1, optimo.costoPorMetro / costoPorMetro) ** 1.2

  return { avance: acotar(avance), fragmentacion: acotar(fragmentacion), control: acotar(control), eficiencia: acotar(eficiencia), avanceMetros: real }
}

export function puntuacionFinal(c) {
  return PESOS.avance * c.avance + PESOS.fragmentacion * c.fragmentacion + PESOS.control * c.control + PESOS.eficiencia * c.eficiencia
}

const niveles = [
  { minimo: 96, clave: 'maestra', titulo: 'VOLADURA MAESTRA' },
  { minimo: 90, clave: 'excelente', titulo: 'EXCELENTE VOLADURA' },
  { minimo: 75, clave: 'buena', titulo: 'BUENA VOLADURA' },
  { minimo: 55, clave: 'aceptable', titulo: 'VOLADURA ACEPTABLE' },
  { minimo: 35, clave: 'complicada', titulo: 'VOLADURA COMPLICADA' },
  { minimo: 0, clave: 'derrota', titulo: 'LA ROCA GANÓ ESTA RONDA' }
]

export const nivelDe = (puntos) => niveles.find((n) => puntos >= n.minimo)

// Redondea y reserva el 100 para el diseño prácticamente perfecto y sin imprevistos.
export function redondearPuntuacion(bruta) {
  const redondeada = Math.round(bruta)
  return redondeada >= 100 && bruta < 99.5 ? 99 : Math.min(100, redondeada)
}

// Consejos de juego para la tarjeta de resultado (no son recomendaciones reales de diseño).
export function generarConsejos(valores, metricas, desafio) {
  const { optimo } = desafio
  const t = factorTolerancia(desafio.dificultad)
  const z = (valor, opt, tol) => Math.abs(Math.log(valor / opt)) / tol
  const mas = (valor, opt) => valor > opt
  const candidatos = []

  const dimension = (puntaje, alto, bajo, valor, opt) => {
    if (puntaje > 0.8) candidatos.push({ puntaje, texto: mas(valor, opt) ? alto : bajo })
  }
  dimension(z(valores.burden, optimo.burden, 0.2 * t), 'Burden demasiado abierto: la roca casi no sintió la carga y quedó pegada al frente.', 'Burden muy cerrado: sobró energía y la roca salió más disparada de lo necesario.', valores.burden, optimo.burden)
  dimension(z(valores.espaciamiento, optimo.espaciamiento, 0.22 * t), 'Espaciamiento muy abierto: quedaron bloques grandes entre barreno y barreno.', 'Barrenos demasiado juntos: se pisaron la energía entre ellos.', valores.espaciamiento, optimo.espaciamiento)
  dimension(z(valores.profundidad, optimo.profundidad, 0.15 * t), 'Barrenos más profundos de lo necesario: perforaste (y pagaste) metros de más.', 'Barrenos cortos: el avance no alcanzó el objetivo.', valores.profundidad, optimo.profundidad)
  dimension(z(metricas.q, optimo.q, 0.22 * t), 'Carga de más: la voladura salió más energética de lo que la roca pedía.', 'Carga escasa: a la roca le faltó energía para ceder.', metricas.q, optimo.q)

  const faltaCobertura = 1 - metricas.cobertura / optimo.cobertura
  if (faltaCobertura > 0.08) candidatos.push({ puntaje: 0.8 + faltaCobertura * 2, texto: 'La plantilla no cubre todo el frente: quedaron zonas sin barrenar.' })
  const fuera = metricas.plantilla.fuera
  if (fuera > 0) candidatos.push({ puntaje: 0.8 + fuera * 0.1, texto: fuera === 1 ? 'Un barreno quedó fuera de la sección: carga perdida.' : `${fuera} barrenos quedaron fuera de la sección: carga perdida.` })
  if ((optimo.ajusteExplosivo[valores.explosivo.id] ?? 0) < 0.9) candidatos.push({ puntaje: 1.1, texto: 'El explosivo no era el ideal para esta roca y esta humedad.' })
  if ((optimo.ajusteDistribucion[valores.distribucion.id] ?? 0) < 0.9) candidatos.push({ puntaje: 1.0, texto: 'Otra distribución de carga habría ido mejor en este frente.' })

  const ideal = TIPOS_AMARRE.find((t) => t.id === optimo.amarre)
  if (metricas.amarre.corr < 0.8) {
    const texto = valores.amarre === 'simultaneo'
      ? 'Todos los barrenos salieron juntos: sin tiempo para abrir una cara libre, la roca no tuvo por dónde salir.'
      : valores.amarre === 'inverso'
        ? 'Se inició de afuera hacia adentro: el arranque no abrió la cara libre a tiempo.'
        : `El orden de salida no era el que pedía este frente: hoy convenía "${ideal.nombre.toLowerCase()}".`
    candidatos.push({ puntaje: 0.8 + (0.8 - metricas.amarre.corr), texto })
  }

  const mejores = candidatos.sort((a, b) => b.puntaje - a.puntaje).slice(0, 3).map((c) => c.texto)
  return mejores.length ? mejores : ['Diseño muy cerca del punto dulce de este frente.']
}
