// Generador pseudoaleatorio determinista: la misma semilla produce siempre la misma secuencia.

export function hashTexto(texto) {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function crearRng(semilla) {
  let a = typeof semilla === 'string' ? hashTexto(semilla) : semilla >>> 0

  const siguiente = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const entre = (min, max) => min + (max - min) * siguiente()
  const entero = (min, max) => Math.floor(min + (max - min + 1) * siguiente())
  const elegir = (lista) => lista[Math.floor(siguiente() * lista.length)]

  const mezclar = (lista) => {
    const copia = [...lista]
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(siguiente() * (i + 1))
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
    }
    return copia
  }

  // pesos: { clave: peso }; devuelve una clave con probabilidad proporcional a su peso
  const ponderado = (pesos) => {
    const claves = Object.keys(pesos)
    const total = claves.reduce((suma, k) => suma + pesos[k], 0)
    let r = siguiente() * total
    for (const k of claves) {
      r -= pesos[k]
      if (r < 0) return k
    }
    return claves[claves.length - 1]
  }

  return { siguiente, entre, entero, elegir, mezclar, ponderado }
}
