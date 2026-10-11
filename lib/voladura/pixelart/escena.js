import { dentroSeccion } from '../plantilla'
import { hashTexto } from '../randomSeed'
import { ANCHO, ALTO, hex, crearLienzo, poner, rect, circulo, ruido, mezclarColores, dibujarSprite, dibujarDigitos } from './lienzo'
import { minero, lampara, senal, jumbo } from './sprites'

export const CENTRO_X = 80
export const SUELO_Y = 100
export const MECHA_X0 = 22
export const MECHA_Y = 102
const MARGEN_ANILLO = 5

const C = {
  muroA: hex('#23272f'), muroB: hex('#2c313a'), muroC: hex('#1b1e25'),
  anilloA: hex('#4a505c'), anilloB: hex('#5d6573'), perno: hex('#9aa3b2'),
  sueloA: hex('#1d1a17'), sueloB: hex('#2c2722'), riel: hex('#8a8f99'), durmiente: hex('#5c4630'),
  cavidadA: hex('#0f1115'), cavidadB: hex('#2b313c'),
  amarillo: hex('#f2c200'), negro: hex('#14110f'), blanco: hex('#f4f4f0'), naranja: hex('#f26a1b'), rojo: hex('#d63a2f'), gris: hex('#8a8f99'),
  barrenoOscuro: hex('#0d0b0a'), polvo: hex('#c9b99a')
}
export const colores = C

// Mapa entre metros de la sección y píxeles de la pantalla.
export function crearEscena(desafio) {
  const { geometria, roca } = desafio
  const escala = Math.min(100 / geometria.ancho, 80 / geometria.alto)
  const semilla = hashTexto(desafio.semilla) & 0xffff
  const paleta = roca.paleta.map(hex)
  const escena = { desafio, escala, semilla, paleta, cara: [], anillo: [], fondo: crearLienzo() }

  const aMetros = (px, py) => [(px + 0.5 - CENTRO_X) / escala + geometria.ancho / 2, (SUELO_Y - py - 0.5) / escala]
  const margenAnillo = MARGEN_ANILLO / escala
  const radioX = (geometria.ancho * escala) / 2
  const radioY = (geometria.alto * escala) / 2

  const { datos } = escena.fondo
  for (let y = 0; y < ALTO; y++) {
    for (let x = 0; x < ANCHO; x++) {
      const i = y * ANCHO + x
      const r = ruido(x, y, semilla)
      if (y >= SUELO_Y) {
        datos[i] = r < 0.25 ? C.sueloB : C.sueloA
        continue
      }
      const [mx, my] = aMetros(x, y)
      if (dentroSeccion(geometria, mx, my)) {
        const rho = Math.hypot((x - CENTRO_X) / radioX, (y - (SUELO_Y - radioY)) / radioY)
        escena.cara.push({ i, x, y, rho })
        datos[i] = r < 0.18 ? paleta[2] : r > 0.82 ? paleta[1] : paleta[0]
      } else if (dentroSeccion(geometria, mx, my, -margenAnillo)) {
        let sobre = 1
        while (sobre < MARGEN_ANILLO && !dentroSeccion(geometria, mx, my, -(sobre / escala))) sobre++
        escena.anillo.push({ i, x, y, distancia: sobre })
        datos[i] = r < 0.3 ? C.anilloA : C.anilloB
      } else {
        datos[i] = r < 0.2 ? C.muroC : r > 0.8 ? C.muroB : C.muroA
      }
    }
  }

  // Pernos de sujeción a lo largo del anillo de concreto lanzado.
  escena.anillo.filter((p) => p.distancia === 3 && (p.x * 3 + p.y * 7) % 11 === 0).forEach((p) => { datos[p.i] = C.perno })

  // Rieles y durmientes.
  for (let x = 0; x < ANCHO; x++) {
    datos[(SUELO_Y + 4) * ANCHO + x] = C.riel
    datos[(SUELO_Y + 11) * ANCHO + x] = C.riel
    if (x % 8 < 2) for (let y = SUELO_Y + 3; y <= SUELO_Y + 12; y++) datos[y * ANCHO + x] = y === SUELO_Y + 4 || y === SUELO_Y + 11 ? C.riel : C.durmiente
  }

  // Letrero del nivel y lámpara.
  const nivel = String(desafio.nivel).replace(/\D/g, '')
  const ancho = nivel.length * 4 + 3
  rect(escena.fondo, 5, 5, ancho, 9, C.negro)
  rect(escena.fondo, 6, 6, ancho - 2, 7, C.amarillo)
  dibujarDigitos(escena.fondo, nivel, 8, 7, C.negro)
  dibujarSprite(escena.fondo, lampara, CENTRO_X - 2, 0)
  dibujarSprite(escena.fondo, senal, ANCHO - 16, 5)
  return escena
}

// Posición en pantalla (px) de un punto de la sección (m)
export function aPantalla(escena, x, y) {
  const { geometria } = escena.desafio
  return { px: CENTRO_X + (x - geometria.ancho / 2) * escena.escala, py: SUELO_Y - y * escena.escala }
}

const COLORES_BARRENO = {
  disparado: [C.barrenoOscuro, hex('#7a3a14')],
  vacio: [C.barrenoOscuro, hex('#5a4636')],
  cargado: [C.barrenoOscuro, C.amarillo],
  iniciado: [C.naranja, C.blanco],
  fuera: [C.barrenoOscuro, C.rojo],
  anulado: [C.barrenoOscuro, C.gris]
}

export function dibujarBarrenos(lienzo, barrenos) {
  const grande = barrenos.length <= 40
  barrenos.forEach(({ px, py, estado, etiqueta }) => {
    const [borde, centro] = COLORES_BARRENO[estado] || COLORES_BARRENO.vacio
    const x = Math.round(px)
    const y = Math.round(py)
    if (grande) {
      rect(lienzo, x - 2, y - 2, 4, 4, borde)
      rect(lienzo, x - 1, y - 1, 2, 2, centro)
    } else {
      rect(lienzo, x - 1, y - 1, 3, 3, borde)
      poner(lienzo, x, y, centro)
    }
    if (estado === 'iniciado') for (const [dx, dy] of [[0, -3], [0, 3], [-3, 0], [3, 0]]) poner(lienzo, x + dx, y + dy, C.amarillo)
    if (etiqueta && estado !== 'fuera') dibujarEtiqueta(lienzo, etiqueta, x, y)
  })
}

// Número del orden de salida sobre el barreno (con sombra para que se lea sobre la roca).
function dibujarEtiqueta(lienzo, numero, x, y) {
  const texto = String(numero)
  const ancho = texto.length * 4 - 1
  const x0 = x - Math.floor(ancho / 2)
  const y0 = y - 9
  rect(lienzo, x0 - 1, y0 - 1, ancho + 2, 7, C.negro)
  dibujarDigitos(lienzo, texto, x0, y0, C.blanco)
}

// Mecha: cordón por el piso hasta el frente; lo ya quemado se oscurece y la chispa avanza.
export function dibujarMecha(lienzo, mecha) {
  const x1 = CENTRO_X
  for (let x = MECHA_X0; x <= x1; x++) {
    const quemada = mecha.encendida && x <= mecha.cabeza
    poner(lienzo, x, MECHA_Y, quemada ? C.negro : x % 4 === 0 ? C.rojo : C.gris)
  }
  if (mecha.encendida && !mecha.fin) {
    const x = Math.round(mecha.cabeza)
    rect(lienzo, x - 1, MECHA_Y - 1, 3, 3, C.naranja)
    poner(lienzo, x, MECHA_Y, C.blanco)
    poner(lienzo, x, MECHA_Y - 2, C.amarillo)
  }
}

// Cigarro: papel blanco y brasa naranja en la punta.
export function dibujarCigarro(lienzo, cigarro) {
  const x = Math.round(cigarro.x)
  const y = Math.round(cigarro.y)
  rect(lienzo, x, y, 3, 1, C.blanco)
  poner(lienzo, x + 3, y, cigarro.brasa ? C.naranja : hex('#7a3a14'))
  if (cigarro.brasa) poner(lienzo, x + 3, y - 1, C.amarillo)
}

// Frente después de la voladura: la cavidad crece desde el centro; lo que no se arrancó queda como roca.
export function romperCara(lienzo, escena, { avance, sobreexcavacion, progreso }) {
  const umbral = progreso * (0.3 + 0.85 * avance)
  escena.cara.forEach(({ i, x, y, rho }) => {
    const irregular = (ruido(x, y, escena.semilla + 7) - 0.5) * 0.18
    if (rho + irregular <= umbral) lienzo.datos[i] = mezclarColores(C.cavidadA, C.cavidadB, Math.min(1, rho))
  })
  escena.anillo.forEach(({ i, x, y, distancia }) => {
    if (progreso > 0.5 && distancia <= sobreexcavacion && ruido(x, y, escena.semilla + 3) < 0.65) lienzo.datos[i] = C.cavidadA
  })
}

export function dibujarEscombros(lienzo, escombros) {
  escombros.forEach(({ x, y, w, h, color }) => rect(lienzo, x, y, w, h, color))
}

export function dibujarPolvo(lienzo, polvo) {
  polvo.forEach(({ x, y, radio, alfa }) => circulo(lienzo, x, y, radio, C.polvo, alfa))
}

export function dibujarParticulas(lienzo, particulas) {
  particulas.forEach(({ x, y, tam, color }) => rect(lienzo, x, y, tam, tam, color))
}

export function dibujarCinta(lienzo) {
  for (let x = 20; x < ANCHO - 20; x++) {
    const franja = Math.floor((x + 40) / 4) % 2 === 0
    for (let y = SUELO_Y + 14; y < SUELO_Y + 17; y++) poner(lienzo, x, y, franja ? C.amarillo : C.negro)
  }
}

export function destello(lienzo, intensidad) {
  if (intensidad <= 0) return
  for (let i = 0; i < lienzo.datos.length; i++) lienzo.datos[i] = mezclarColores(lienzo.datos[i], C.blanco, intensidad)
}

export function desplazar(lienzo, dx, dy) {
  if (!dx && !dy) return lienzo
  const destino = crearLienzo(lienzo.ancho, lienzo.alto)
  for (let y = 0; y < lienzo.alto; y++) {
    for (let x = 0; x < lienzo.ancho; x++) {
      const sx = x - dx
      const sy = y - dy
      if (sx >= 0 && sy >= 0 && sx < lienzo.ancho && sy < lienzo.alto) destino.datos[y * lienzo.ancho + x] = lienzo.datos[sy * lienzo.ancho + sx]
    }
  }
  return destino
}

// Dibuja un fotograma completo. "vista" lo calcula el guion de animación o el modo reposo.
export function dibujarFotograma(lienzo, escena, vista) {
  lienzo.datos.set(escena.fondo.datos)
  if (vista.rotura) romperCara(lienzo, escena, vista.rotura)
  else dibujarBarrenos(lienzo, vista.barrenos)
  dibujarEscombros(lienzo, vista.escombros || [])
  if (vista.mecha) dibujarMecha(lienzo, vista.mecha)
  dibujarSprite(lienzo, jumbo, ANCHO - 22, SUELO_Y - 10)
  dibujarSprite(lienzo, minero, Math.round(vista.mineroX ?? 10), SUELO_Y - 8)
  if (vista.cigarro) dibujarCigarro(lienzo, vista.cigarro)
  if (vista.cinta) dibujarCinta(lienzo)
  dibujarPolvo(lienzo, vista.polvo || [])
  dibujarParticulas(lienzo, vista.particulas || [])
  destello(lienzo, vista.destello || 0)
  return lienzo
}

