import {
  crearLienzo, hex, poner, rect, mezclar, mezclarColores, circulo, ruido, dibujarSprite, dibujarDigitos, aImageData, ANCHO, ALTO
} from '@/lib/voladura/pixelart/lienzo'
import { minero, iconos, jumbo, senal, lampara } from '@/lib/voladura/pixelart/sprites'
import { crearEscena, aPantalla, dibujarFotograma, desplazar, destello, dibujarCinta, CENTRO_X, SUELO_Y } from '@/lib/voladura/pixelart/escena'
import { crearGuion, estadoEn, faseEn, crearTiempos } from '@/lib/voladura/pixelart/animacion'
import { getChallengeByNumber, configOptima } from '@/lib/voladura/challengeEngine'
import { evaluateBlast } from '@/lib/voladura/blastEngine'
import { configInicial } from '@/lib/voladura/config'

const reto = getChallengeByNumber(9)
const resultado = evaluateBlast(configOptima(reto), reto)

describe('lienzo', () => {
  it('convierte colores y pinta dentro de los límites', () => {
    const l = crearLienzo(4, 4)
    poner(l, 1, 1, hex('#ff0000'))
    poner(l, -1, 0, hex('#ff0000'))
    poner(l, 9, 9, hex('#ff0000'))
    expect(l.datos[5]).toBe(hex('#ff0000'))
    expect(l.datos.filter(Boolean)).toHaveLength(1)
    expect(hex('#ff0000') & 255).toBe(255)
  })

  it('dibuja rectángulos, círculos y mezcla con transparencia', () => {
    const l = crearLienzo(10, 10)
    rect(l, 0, 0, 3, 2, hex('#00ff00'))
    expect(l.datos.filter(Boolean)).toHaveLength(6)
    circulo(l, 6, 6, 2, hex('#ffffff'), 1)
    expect(l.datos[6 * 10 + 6]).toBe(hex('#ffffff'))
    mezclar(l, 0, 0, hex('#ffffff'), 0.5)
    expect(l.datos[0]).not.toBe(hex('#00ff00'))
    const antes = l.datos[1]
    mezclar(l, 1, 0, hex('#ffffff'), 0)
    mezclar(l, -1, 0, hex('#ffffff'), 1)
    expect(l.datos[1]).toBe(antes)
    expect(mezclarColores(hex('#000000'), hex('#ffffff'), 1)).toBe(hex('#ffffff'))
  })

  it('el ruido es determinista y está entre 0 y 1', () => {
    expect(ruido(3, 4, 5)).toBe(ruido(3, 4, 5))
    expect(ruido(3, 4, 5)).not.toBe(ruido(4, 3, 5))
    expect(ruido(1, 1)).toBeLessThan(1)
  })

  it('dibuja sprites (también espejados) y cifras', () => {
    const l = crearLienzo(20, 20)
    dibujarSprite(l, minero, 2, 2)
    const normal = l.datos.filter(Boolean).length
    expect(normal).toBeGreaterThan(30)
    const m = crearLienzo(20, 20)
    dibujarSprite(m, minero, 2, 2, { espejo: true })
    expect(m.datos.filter(Boolean)).toHaveLength(normal)
    const d = crearLienzo(20, 8)
    dibujarDigitos(d, '450x', 0, 0, hex('#ffffff'))
    expect(d.datos.filter(Boolean).length).toBeGreaterThan(20)
  })

  it('convierte el lienzo a ImageData', () => {
    global.ImageData = class { constructor(datos, ancho, alto) { Object.assign(this, { data: datos, width: ancho, height: alto }) } }
    const img = aImageData(crearLienzo(3, 2))
    expect(img.width).toBe(3)
    expect(img.data).toHaveLength(24)
  })
})

describe('sprites', () => {
  it('todas las filas de cada sprite tienen el mismo largo y usan colores definidos', () => {
    ;[minero, jumbo, senal, lampara, ...Object.values(iconos)].forEach((s) => {
      const ancho = s.filas[0].length
      s.filas.forEach((fila) => {
        expect(fila).toHaveLength(ancho)
        ;[...fila].filter((c) => c !== '.').forEach((c) => expect(s.mapa[c]).toBeDefined())
      })
    })
    Object.values(iconos).forEach((s) => { expect(s.filas).toHaveLength(8); expect(s.filas[0]).toHaveLength(8) })
  })
})

describe('escena', () => {
  const escena = crearEscena(reto)

  it('encaja la sección en la pantalla y precalcula la cara y el anillo', () => {
    expect(escena.cara.length).toBeGreaterThan(2000)
    expect(escena.anillo.length).toBeGreaterThan(300)
    const { px, py } = aPantalla(escena, reto.geometria.ancho / 2, 0)
    expect(px).toBeCloseTo(CENTRO_X)
    expect(py).toBeCloseTo(SUELO_Y)
    const arriba = aPantalla(escena, reto.geometria.ancho / 2, reto.geometria.alto)
    expect(arriba.py).toBeGreaterThan(10)
  })

  it('dibuja el frente con la plantilla y reacciona a los controles', () => {
    const l = crearLienzo()
    const barrenos = resultado.plantilla.barrenos.map((b) => ({ ...aPantalla(escena, b.x, b.y), estado: b.dentro ? 'cargado' : 'fuera' }))
    dibujarFotograma(l, escena, { barrenos })
    const sinBarrenos = crearLienzo()
    dibujarFotograma(sinBarrenos, escena, { barrenos: [] })
    expect(Buffer.from(l.datos.buffer).equals(Buffer.from(sinBarrenos.datos.buffer))).toBe(false)
  })

  it('con muchos barrenos usa puntos más pequeños y soporta todos los estados', () => {
    const l = crearLienzo()
    const barrenos = Array.from({ length: 50 }, (_, i) => ({ px: 30 + (i % 10) * 10, py: 30 + Math.floor(i / 10) * 10, estado: ['vacio', 'cargado', 'iniciado', 'fuera', 'anulado', 'raro'][i % 6] }))
    dibujarFotograma(l, escena, { barrenos, cinta: true, destello: 0.5, polvo: [{ x: 50, y: 50, radio: 5, alfa: 0.4 }], particulas: [{ x: 10, y: 10, tam: 2, color: hex('#ffffff') }], escombros: [{ x: 5, y: 90, w: 2, h: 2, color: hex('#ffffff') }] })
    expect(l.datos.filter(Boolean)).toHaveLength(ANCHO * ALTO)
  })

  it('el destello aclara y el desplazamiento mueve la imagen', () => {
    const l = crearLienzo(4, 4)
    l.datos.fill(hex('#000000'))
    destello(l, 0)
    expect(l.datos[0]).toBe(hex('#000000'))
    destello(l, 1)
    expect(l.datos[0]).toBe(hex('#f4f4f0'))
    const m = crearLienzo(4, 4)
    m.datos[5] = hex('#ff0000')
    expect(desplazar(m, 0, 0)).toBe(m)
    expect(desplazar(m, 1, 1).datos[10]).toBe(hex('#ff0000'))
    const c = crearLienzo()
    dibujarCinta(c)
    expect(c.datos.filter(Boolean).length).toBeGreaterThan(300)
  })
})

describe('animación', () => {
  const escena = crearEscena(reto)
  const guion = crearGuion(resultado, reto, escena)
  const T = guion.tiempos
  const DURACION = guion.duracion

  it('dura entre 2 y 6 segundos y recorre las fases en orden', () => {
    expect(DURACION).toBeGreaterThanOrEqual(2)
    expect(DURACION).toBeLessThanOrEqual(6)
    const orden = [0.2, T.preparacion + 0.2, T.mecha + 0.1, T.iniciacion + 0.1, T.detonacion + 0.1, T.polvo + 0.1].map((t) => faseEn(T, t).nombre)
    expect(orden).toEqual(['preparacion', 'mecha', 'iniciacion', 'detonacion', 'polvo', 'resultado'])
    expect(faseEn(T, 99).nombre).toBe('resultado')
  })

  it('más grupos de retardo alargan la iniciación', () => {
    expect(crearTiempos(6).iniciacion).toBeGreaterThan(crearTiempos(1).iniciacion)
    expect(crearTiempos(1).fin).toBeGreaterThanOrEqual(2)
  })

  it('el minero fuma, baja el cigarro, enciende la mecha y se retira mientras la chispa avanza', () => {
    const inicio = estadoEn(guion, 0.2)
    expect(inicio.cigarro).not.toBeNull()
    expect(inicio.mecha.encendida).toBe(false)
    expect(inicio.mineroX).toBe(10)
    const bajando = estadoEn(guion, T.preparacion + 0.12)
    expect(bajando.cigarro.y).toBeGreaterThan(inicio.cigarro.y)
    const avanzando = estadoEn(guion, T.preparacion + 0.6)
    expect(avanzando.mecha.encendida).toBe(true)
    expect(avanzando.mecha.cabeza).toBeGreaterThan(estadoEn(guion, T.preparacion + 0.4).mecha.cabeza)
    expect(avanzando.mineroX).toBeLessThan(inicio.mineroX)
    const llegada = estadoEn(guion, T.mecha)
    expect(llegada.cigarro).toBeNull()
    expect(llegada.mecha.fin).toBe(true)
    expect(llegada.mecha.cabeza).toBeCloseTo(80)
  })

  it('los barrenos no inician hasta que la chispa llega al frente', () => {
    const antes = estadoEn(guion, T.mecha - 0.05).barrenos.filter((b) => !['fuera', 'anulado'].includes(b.estado)).map((b) => b.estado)
    expect(antes.every((e) => e === 'cargado' || e === 'vacio')).toBe(true)
    const despues = estadoEn(guion, T.iniciacion - 0.01).barrenos.map((b) => b.estado)
    expect(despues).toEqual(expect.arrayContaining(['disparado']))
  })

  it('la preparación carga los barrenos y la iniciación los enciende según el orden del amarre', () => {
    const estados = (t) => estadoEn(guion, t).barrenos.filter((b) => !['fuera', 'anulado'].includes(b.estado)).map((b) => b.estado)
    expect(estados(0.01).every((e) => e === 'vacio')).toBe(true)
    expect(estados(T.preparacion - 0.01)).toContain('cargado')
    const primero = resultado.amarre.rangos.indexOf(Math.min(...resultado.amarre.rangos))
    const ultimo = resultado.amarre.rangos.indexOf(Math.max(...resultado.amarre.rangos))
    expect(guion.inicio[primero]).toBeLessThan(guion.inicio[ultimo])
  })

  it('con "todos juntos" todos los barrenos salen a la vez', () => {
    const juntos = evaluateBlast({ ...configOptima(reto), amarre: 'simultaneo', orden: [] }, reto)
    const g = crearGuion(juntos, reto, escena)
    expect(new Set(g.inicio).size).toBe(1)
    expect(g.duracion).toBeLessThan(guion.duracion)
  })

  it('la detonación trae destello, sacudida, partículas y polvo; luego se calma', () => {
    const antes = estadoEn(guion, T.iniciacion - 0.1)
    expect(antes.particulas).toHaveLength(0)
    expect(antes.rotura).toBeNull()
    const boom = estadoEn(guion, T.iniciacion + 0.05)
    expect(boom.destello).toBeGreaterThan(0.5)
    expect(boom.fase).toBe('detonacion')
    const luego = estadoEn(guion, T.iniciacion + 0.4)
    expect(luego.particulas.length).toBeGreaterThan(50)
    expect(luego.polvo.length).toBeGreaterThan(0)
    const final = estadoEn(guion, DURACION)
    expect(final.destello).toBe(0)
    expect(final.sacudida).toEqual({ x: 0, y: 0 })
    expect(final.rotura.progreso).toBe(1)
    expect(final.escombros.length).toBe(guion.escombros.length)
  })

  it('el minero se retira y la cinta aparece', () => {
    expect(estadoEn(guion, 0).mineroX).toBeGreaterThan(estadoEn(guion, T.mecha).mineroX)
    expect(estadoEn(guion, 0).cinta).toBe(false)
    expect(estadoEn(guion, 1).cinta).toBe(true)
  })

  it('es determinista', () => {
    expect(crearGuion(resultado, reto, escena)).toEqual(guion)
  })

  it('refleja el resultado: pobre avance deja menos cavidad y mal control más sobreexcavación', () => {
    const pobre = evaluateBlast({ ...configInicial, profundidad: 0, carga: 5 }, reto)
    const g = crearGuion(pobre, reto, escena)
    expect(g.avance).toBeLessThan(guion.avance)
    expect(crearGuion({ ...resultado, overbreak: 0 }, reto, escena).sobreexcavacion).toBe(4)
  })

  it('los barrenos anulados no se iluminan y los de fuera se marcan', () => {
    const con = { ...resultado, anulados: [0] }
    const g = crearGuion(con, reto, escena)
    expect(estadoEn(g, DURACION).barrenos[0].estado).toBe(resultado.plantilla.barrenos[0].dentro ? 'anulado' : 'fuera')
  })

  it('flying rocks añade rocas proyectadas sin que aparezcan personas', () => {
    const con = { ...resultado, events: [{ id: 'flying_rocks' }] }
    expect(crearGuion(con, reto, escena).particulas.length).toBe(guion.particulas.length + 4)
  })

  it('sin barrenos útiles sigue funcionando', () => {
    const vacio = { ...resultado, plantilla: { ...resultado.plantilla, barrenos: [] }, anulados: [], amarre: { ...resultado.amarre, rangos: [] } }
    const g = crearGuion(vacio, reto, escena)
    expect(estadoEn(g, g.tiempos.iniciacion + 1).particulas.length).toBeGreaterThan(0)
  })

  it('las partículas terminan posadas en el suelo', () => {
    const final = estadoEn(guion, DURACION)
    expect(final.particulas.filter((p) => p.y >= SUELO_Y - 4).length).toBeGreaterThan(20)
  })

  it('dibuja la mecha, el cigarro y los números del orden de salida', () => {
    const l = crearLienzo()
    const vacio = crearLienzo()
    const barrenos = resultado.plantilla.barrenos.map((b) => ({ ...aPantalla(escena, b.x, b.y), estado: 'cargado', etiqueta: 3 }))
    dibujarFotograma(l, escena, { barrenos, mecha: { progreso: 0.5, encendida: true, cabeza: 50, fin: false }, cigarro: { x: 16, y: 96, brasa: true } })
    dibujarFotograma(vacio, escena, { barrenos: resultado.plantilla.barrenos.map((b) => ({ ...aPantalla(escena, b.x, b.y), estado: 'cargado' })) })
    expect(Buffer.from(l.datos.buffer).equals(Buffer.from(vacio.datos.buffer))).toBe(false)
    dibujarFotograma(l, escena, { barrenos: [{ px: 40, py: 40, estado: 'cargado', etiqueta: 12 }], mecha: { progreso: 1, encendida: true, cabeza: 80, fin: true }, cigarro: { x: 16, y: 96, brasa: false } })
  })
})
