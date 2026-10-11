// Geometría de la plantilla de barrenación: se genera a partir de burden, espaciamiento y número de
// barrenos. Coordenadas en metros, con el origen en la esquina inferior izquierda de la sección.

export const MARGEN = 0.2

export function seccion(geometria) {
  return { ancho: geometria.ancho, alto: geometria.alto, muro: geometria.alto * geometria.muro }
}

export function areaSeccion(geometria) {
  const { ancho, alto, muro } = seccion(geometria)
  return ancho * muro + (Math.PI / 2) * (ancho / 2) * (alto - muro)
}

// Sección en forma de "D" invertida: hastiales rectos y bóveda elíptica.
export function dentroSeccion(geometria, x, y, margen = 0) {
  const { ancho, alto, muro } = seccion(geometria)
  if (x < margen || x > ancho - margen || y < margen) return false
  if (y <= muro) return true
  const rx = ancho / 2 - margen
  const ry = alto - muro - margen
  if (ry <= 0 || rx <= 0) return false
  const dx = (x - ancho / 2) / rx
  const dy = (y - muro) / ry
  return dx * dx + dy * dy <= 1
}

function rolDelBarreno(rho) {
  if (rho < 0.3) return 'arranque'
  if (rho > 0.78) return 'contorno'
  return 'produccion'
}

export function generarPlantilla(geometria, { burden, espaciamiento, barrenos }) {
  const { ancho, alto } = seccion(geometria)
  const columnas = Math.max(1, Math.floor((ancho - 2 * MARGEN) / espaciamiento + 1e-9) + 1)

  // Filas alternadas con n y n-1 barrenos centrados: el tresbolillo aparece solo.
  const filas = []
  let restantes = barrenos
  for (let r = 0; restantes > 0; r++) {
    const capacidad = r % 2 === 0 ? columnas : Math.max(1, columnas - 1)
    const cuantos = Math.min(capacidad, restantes)
    filas.push(cuantos)
    restantes -= cuantos
  }

  const centroY = alto / 2
  const lista = []
  filas.forEach((cuantos, r) => {
    const y = centroY + ((filas.length - 1) / 2 - r) * burden
    for (let j = 0; j < cuantos; j++) {
      const x = ancho / 2 + (j - (cuantos - 1) / 2) * espaciamiento
      const rho = Math.hypot((x - ancho / 2) / (ancho / 2), (y - centroY) / (alto / 2))
      lista.push({ x, y, rho, fila: r, dentro: dentroSeccion(geometria, x, y, MARGEN * 0.5), rol: rolDelBarreno(rho) })
    }
  })

  const utiles = lista.filter((b) => b.dentro).length
  return { barrenos: lista, filas: filas.length, columnas, utiles, fuera: lista.length - utiles }
}

// Fracción de la sección que queda al alcance de algún barreno útil.
export function cobertura(geometria, barrenos, burden, espaciamiento) {
  const { ancho, alto } = seccion(geometria)
  const radio = 0.5 * Math.hypot(burden, espaciamiento)
  const utiles = barrenos.filter((b) => b.dentro)
  const columnas = 28
  const filas = 22
  let total = 0
  let cubiertos = 0
  for (let i = 0; i < columnas; i++) {
    for (let j = 0; j < filas; j++) {
      const x = ((i + 0.5) / columnas) * ancho
      const y = ((j + 0.5) / filas) * alto
      if (!dentroSeccion(geometria, x, y)) continue
      total++
      if (utiles.some((b) => Math.hypot(b.x - x, b.y - y) <= radio)) cubiertos++
    }
  }
  return total ? cubiertos / total : 0
}
