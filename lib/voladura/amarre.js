// Amarre: el orden en que salen los barrenos. Cada barreno recibe un "rango" (0 sale primero);
// los barrenos con el mismo rango salen a la vez. Es una abstracción de juego.

export const TIPOS_AMARRE = [
  { id: 'centro', nombre: 'Del centro afuera', descripcion: 'Abre primero el arranque y deja el contorno para el final. El clásico.' },
  { id: 'v', nombre: 'En V', descripcion: 'Abre una cuña ancha desde el centro: pensado para roca muy competente.' },
  { id: 'filas', nombre: 'Por filas', descripcion: 'Fila por fila, de arriba abajo: controla la sobreexcavación en roca fracturada.' },
  { id: 'inverso', nombre: 'De afuera adentro', descripcion: 'Al revés: el contorno sale antes que el arranque.' },
  { id: 'simultaneo', nombre: 'Todos juntos', descripcion: 'Todos salen a la vez: la roca no tiene tiempo de moverse.' },
  { id: 'manual', nombre: 'Manual', descripcion: 'Toca los barrenos en el orden en que quieres que salgan.' }
]

export const AMARRE_INICIAL = 'filas'
const GRUPOS = 6

const grupo = (valor, grupos = GRUPOS) => Math.min(grupos - 1, Math.max(0, Math.floor(valor * grupos)))

export function rangosAmarre(tipo, plantilla, geometria, orden = []) {
  const { barrenos } = plantilla
  switch (tipo) {
    case 'centro': return barrenos.map((b) => grupo(b.rho / 1.1))
    case 'inverso': return barrenos.map((b) => GRUPOS - 1 - grupo(b.rho / 1.1))
    case 'v': return barrenos.map((b) => grupo(Math.abs(b.x - geometria.ancho / 2) / (geometria.ancho / 2), 5))
    case 'filas': return barrenos.map((b) => b.fila)
    case 'manual': return barrenos.map((_, i) => { const p = orden.indexOf(i); return p >= 0 ? p : orden.length })
    default: return barrenos.map(() => 0)
  }
}

// Orden ideal según la roca: lo que "pide" el frente de hoy.
export function amarreIdeal(roca, fracturamiento) {
  if (roca.competencia >= 8) return 'v'
  if (fracturamiento === 'alto') return 'filas'
  return 'centro'
}

function rangosPromedio(valores) {
  const orden = valores.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0])
  const resultado = new Array(valores.length)
  for (let i = 0; i < orden.length;) {
    let j = i
    while (j + 1 < orden.length && orden[j + 1][0] === orden[i][0]) j++
    const promedio = (i + j) / 2
    for (let k = i; k <= j; k++) resultado[orden[k][1]] = promedio
    i = j + 1
  }
  return resultado
}

// Correlación de Spearman entre dos órdenes (-1 opuestos, 1 iguales); 0 si alguno no tiene orden.
export function correlacion(a, b) {
  if (a.length < 2) return 0
  const ra = rangosPromedio(a)
  const rb = rangosPromedio(b)
  const n = a.length
  const ma = ra.reduce((s, v) => s + v, 0) / n
  const mb = rb.reduce((s, v) => s + v, 0) / n
  let cov = 0
  let va = 0
  let vb = 0
  for (let i = 0; i < n; i++) {
    cov += (ra[i] - ma) * (rb[i] - mb)
    va += (ra[i] - ma) ** 2
    vb += (rb[i] - mb) ** 2
  }
  return va && vb ? cov / Math.sqrt(va * vb) : 0
}

export const calidadDeCorrelacion = (corr) => 0.35 + 0.65 * Math.max(0, corr) ** 1.5

// Compara el amarre del jugador con el ideal sobre los barrenos que sí trabajan.
export function evaluarAmarre(tipo, orden, plantilla, geometria, idealId, activos) {
  const propios = rangosAmarre(tipo, plantilla, geometria, orden)
  const ideales = rangosAmarre(idealId, plantilla, geometria)
  const indices = plantilla.barrenos.map((_, i) => i).filter((i) => activos(i))
  const corr = correlacion(indices.map((i) => propios[i]), indices.map((i) => ideales[i]))
  return { corr, calidad: calidadDeCorrelacion(corr), rangos: propios }
}

// Rangos → etiquetas 1, 2, 3… (los empates comparten número: salen juntos).
export function etiquetasDeOrden(rangos) {
  const distintos = [...new Set(rangos)].sort((a, b) => a - b)
  return rangos.map((r) => distintos.indexOf(r) + 1)
}

// Etiquetas solo para los barrenos que trabajan (dentro de la sección): los de fuera no se numeran.
export function etiquetasUtiles(rangos, plantilla) {
  const dentro = rangos.map((r, i) => (plantilla.barrenos[i].dentro ? r : null))
  const etiquetas = etiquetasDeOrden(dentro.filter((r) => r !== null))
  let k = 0
  return dentro.map((r) => (r === null ? null : etiquetas[k++]))
}

// Edición manual: tocar un barreno sin número lo suma al final; tocar el último lo quita.
export function alternarManual(orden, indice) {
  if (orden.includes(indice)) return orden[orden.length - 1] === indice ? orden.slice(0, -1) : orden
  return [...orden, indice]
}
