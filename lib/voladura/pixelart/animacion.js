import { crearRng } from '../randomSeed'
import { aPantalla, CENTRO_X, SUELO_Y, MECHA_X0 } from './escena'

// Fases: preparación (carga y cigarro), mecha (el minero la enciende y la chispa avanza),
// iniciación (los barrenos salen en el orden del amarre), detonación, polvo y resultado.
// La iniciación dura más cuantos más grupos de retardo tenga el amarre.
const PREPARACION = 0.7
const MECHA = 1.7
const ENTRE_GRUPOS = 0.2

export function crearTiempos(grupos) {
  const iniciacion = MECHA + 0.15 + ENTRE_GRUPOS * (grupos - 1) + 0.2
  const detonacion = iniciacion + 0.7
  const polvo = detonacion + 1.2
  return { preparacion: PREPARACION, mecha: MECHA, iniciacion, detonacion, polvo, fin: polvo + 0.5 }
}

const GRAVEDAD = 140
const clamp01 = (v) => Math.min(1, Math.max(0, v))

export function faseEn(tiempos, t) {
  const fases = [
    ['preparacion', 0, tiempos.preparacion], ['mecha', tiempos.preparacion, tiempos.mecha], ['iniciacion', tiempos.mecha, tiempos.iniciacion],
    ['detonacion', tiempos.iniciacion, tiempos.detonacion], ['polvo', tiempos.detonacion, tiempos.polvo], ['resultado', tiempos.polvo, tiempos.fin]
  ]
  const fase = fases.find(([, , fin]) => t < fin) || fases[fases.length - 1]
  return { nombre: fase[0], progreso: clamp01((t - fase[1]) / (fase[2] - fase[1])) }
}

// Todo lo aleatorio de la animación (partículas, orden, polvo) se fija aquí con una semilla:
// el mismo resultado se anima siempre igual.
export function crearGuion(resultado, desafio, escena) {
  const rng = crearRng(`${desafio.semilla}|anim|${resultado.score}|${resultado.anulados.length}`)
  const { barrenos } = resultado.plantilla
  const posiciones = barrenos.map((b) => aPantalla(escena, b.x, b.y))
  const anulados = new Set(resultado.anulados)

  // Salen en el orden del amarre: los barrenos con el mismo rango salen juntos.
  const distintos = [...new Set(resultado.amarre.rangos)].sort((a, b) => a - b)
  const grupos = Math.max(1, distintos.length)
  const tiempos = crearTiempos(grupos)
  const grupoDe = resultado.amarre.rangos.map((r) => distintos.indexOf(r))
  const centro = barrenos.map((_, i) => i).sort((a, b) => barrenos[a].rho - barrenos[b].rho)
  const posicionCarga = new Array(barrenos.length)
  centro.forEach((indice, k) => { posicionCarga[indice] = k })
  const n = Math.max(1, barrenos.length - 1)
  const carga = barrenos.map((_, i) => 0.05 + (posicionCarga[i] / n) * (tiempos.preparacion - 0.2))
  const inicio = barrenos.map((_, i) => tiempos.mecha + 0.15 + grupoDe[i] * ENTRE_GRUPOS)

  const fragmentacion = resultado.fragmentation / 100
  const tamBase = 4.2 - 2.8 * fragmentacion
  const colores3 = escena.paleta
  const origenes = posiciones.filter((_, i) => barrenos[i].dentro && !anulados.has(i))
  const fuente = origenes.length ? origenes : [{ px: CENTRO_X, py: SUELO_Y - 40 }]

  const particulas = []
  for (let k = 0; k < 110; k++) {
    const o = fuente[Math.floor(rng.siguiente() * fuente.length)]
    particulas.push({
      x0: o.px, y0: o.py,
      vx: (o.px - CENTRO_X) * rng.entre(0.6, 1.4) + rng.entre(-14, 14),
      vy: (o.py - (SUELO_Y - 40)) * rng.entre(0.4, 1.0) - rng.entre(10, 60),
      tam: Math.max(1, Math.round(tamBase * rng.entre(0.6, 1.4))),
      color: colores3[Math.floor(rng.siguiente() * 3)],
      retardo: rng.entre(0, 0.12),
      suelo: SUELO_Y + rng.entre(-2, 8)
    })
  }
  // Rocas proyectadas: solo material saliendo del frente (sin personas en escena).
  const hayProyeccion = resultado.events.some((e) => e.id === 'flying_rocks')
  if (hayProyeccion) {
    for (let k = 0; k < 4; k++) {
      particulas.push({
        x0: CENTRO_X + rng.entre(-20, 20), y0: SUELO_Y - 45,
        vx: rng.entre(-120, 120), vy: -rng.entre(120, 190), tam: 4, color: colores3[1], retardo: 0.05, suelo: 9999
      })
    }
  }

  const polvo = Array.from({ length: 12 }, () => ({
    x: CENTRO_X + rng.entre(-40, 40), y: SUELO_Y - rng.entre(10, 70), vx: rng.entre(-6, 6), r0: rng.entre(2, 5), crece: rng.entre(10, 20), retardo: rng.entre(0, 0.4)
  }))

  // Escombro: el montón al pie del frente. Menor fragmentación → bloques más grandes.
  const avance = resultado.advance / 100
  const alturaMonton = 10 + 18 * avance
  const semiancho = (desafio.geometria.ancho * escena.escala) / 2
  const escombros = Array.from({ length: Math.round(140 + 160 * fragmentacion) }, () => {
    const x = CENTRO_X + (rng.siguiente() + rng.siguiente() - 1) * semiancho * 0.95
    const tope = alturaMonton * Math.max(0.15, 1 - Math.abs(x - CENTRO_X) / semiancho)
    const tam = Math.max(1, Math.round(tamBase * rng.entre(0.5, 1.2)))
    return { x: Math.round(x), y: Math.round(SUELO_Y - rng.siguiente() * tope - tam + 4), w: tam, h: tam, color: colores3[Math.floor(rng.siguiente() * 3)] }
  })

  return {
    tiempos, duracion: tiempos.fin, grupoDe, posiciones, barrenos, anulados, carga, inicio, particulas, polvo, escombros,
    avance, sobreexcavacion: Math.round(((100 - resultado.overbreak) / 100) * 4),
    hayEvento: resultado.events.length > 0
  }
}

// Fotograma de la animación en el instante t (segundos).
export function estadoEn(guion, t) {
  const { tiempos } = guion
  const { nombre: fase, progreso } = faseEn(tiempos, t)
  const detonado = t >= tiempos.iniciacion

  const barrenos = guion.posiciones.map((p, i) => {
    let estado = 'vacio'
    if (guion.barrenos[i].dentro === false) estado = 'fuera'
    else if (guion.anulados.has(i)) estado = 'anulado'
    else if (t >= guion.inicio[i] + 0.2) estado = 'disparado'
    else if (t >= guion.inicio[i]) estado = 'iniciado'
    else if (t >= guion.carga[i]) estado = 'cargado'
    return { ...p, estado }
  })

  const dt = t - tiempos.iniciacion
  const particulas = detonado
    ? guion.particulas.flatMap((p) => {
      const s = dt - p.retardo
      if (s < 0) return []
      const y = p.y0 + p.vy * s + 0.5 * GRAVEDAD * s * s
      const x = p.x0 + p.vx * s
      if (y >= p.suelo) return [{ x, y: p.suelo, tam: p.tam, color: p.color }]
      return [{ x, y, tam: p.tam, color: p.color }]
    })
    : []

  const polvo = detonado
    ? guion.polvo.flatMap((d) => {
      const s = dt - d.retardo
      if (s < 0) return []
      const vida = clamp01(s / (tiempos.polvo + 0.4 - tiempos.iniciacion))
      return [{ x: d.x + d.vx * s, y: d.y - 6 * s, radio: d.r0 + d.crece * vida, alfa: 0.5 * (1 - vida) }]
    })
    : []

  const amplitud = dt >= 0 && dt < 0.6 ? 3 * (1 - dt / 0.6) : 0
  const flash = dt >= 0 && dt < 0.25 ? 0.9 * (1 - dt / 0.25) : 0

  // El minero fuma, baja el cigarro a la mecha, la enciende y se retira mientras la chispa avanza.
  const enMecha = clamp01((t - tiempos.preparacion) / (tiempos.mecha - tiempos.preparacion))
  const baja = clamp01(enMecha / 0.3)
  const largo = CENTRO_X - MECHA_X0
  const avance = clamp01((enMecha - 0.3) / 0.7)
  const mineroX = 10 - 24 * clamp01((enMecha - 0.35) / 0.65)
  const mecha = t >= 0.15
    ? { progreso: avance, encendida: enMecha >= 0.3, cabeza: MECHA_X0 + largo * avance, fin: detonado || t >= tiempos.mecha }
    : null
  const cigarro = t < tiempos.mecha && mineroX > -2
    ? { x: mineroX + 6 + 3 * baja, y: SUELO_Y - 4 + 6 * baja, brasa: Math.floor(t * 6) % 2 === 0 || baja > 0 }
    : null

  return {
    fase,
    progresoFase: progreso,
    barrenos,
    particulas,
    polvo,
    destello: flash,
    sacudida: { x: Math.round(Math.sin(t * 70) * amplitud) + 0, y: Math.round(Math.cos(t * 53) * amplitud * 0.7) + 0 },
    rotura: detonado ? { avance: guion.avance, sobreexcavacion: guion.sobreexcavacion, progreso: clamp01((dt - 0.05) / 0.5) } : null,
    escombros: detonado ? guion.escombros.slice(0, Math.round(guion.escombros.length * clamp01((dt - 0.1) / 0.9))) : [],
    cinta: t >= tiempos.preparacion * 0.5,
    mineroX,
    mecha,
    cigarro
  }
}
