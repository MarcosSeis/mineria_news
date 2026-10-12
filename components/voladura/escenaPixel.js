import { useEffect, useMemo, useRef } from 'react'
import { crearLienzo, aImageData, ANCHO, ALTO } from '@/lib/voladura/pixelart/lienzo'
import { crearEscena, aPantalla, dibujarFotograma, desplazar, MECHA_X0, SUELO_Y } from '@/lib/voladura/pixelart/escena'
import { crearGuion, estadoEn } from '@/lib/voladura/pixelart/animacion'
import styles from '@/styles/voladura.module.css'

const SUAVIZADO = 0.35
const RADIO_TOQUE = 9

const estadoDeBarreno = (b) => (b.dentro ? 'cargado' : 'fuera')

// Lienzo pixel art con tres modos: "edicion" (la plantilla se mueve al tocar los controles),
// "animacion" (la voladura se ejecuta) y "final" (muestra el frente ya volado).
const REPOSO = {
  mineroX: 10,
  mecha: { progreso: 0, encendida: false, cabeza: MECHA_X0, fin: false },
  cigarro: { x: 16, y: SUELO_Y - 4, brasa: true }
}

export default function EscenaPixel({ desafio, plantilla, modo, resultado, onFin, reducirMovimiento = false, ciclo = 0, etiquetas = null, onTocar = null }) {
  const canvas = useRef(null)
  const escena = useMemo(() => crearEscena(desafio), [desafio])
  const lienzo = useRef(null)
  const posiciones = useRef([])
  const alFin = useRef(onFin)
  useEffect(() => { alFin.current = onFin }, [onFin])

  const guion = useMemo(
    () => (resultado ? crearGuion(resultado, desafio, escena) : null),
    [resultado, desafio, escena]
  )

  const pintar = (vista, sacudida = null) => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    lienzo.current = lienzo.current || crearLienzo(ANCHO, ALTO)
    dibujarFotograma(lienzo.current, escena, vista)
    const salida = sacudida ? desplazar(lienzo.current, sacudida.x, sacudida.y) : lienzo.current
    ctx.putImageData(aImageData(salida), 0, 0)
  }

  // Edición: cada barreno se desliza hacia su nueva posición.
  useEffect(() => {
    if (modo !== 'edicion' || !plantilla) return undefined
    const metas = plantilla.barrenos.map((b, i) => ({ ...aPantalla(escena, b.x, b.y), estado: estadoDeBarreno(b), etiqueta: etiquetas?.[i] ?? null }))
    const centro = aPantalla(escena, desafio.geometria.ancho / 2, desafio.geometria.alto / 2)
    posiciones.current = metas.map((m, i) => ({
      px: posiciones.current[i]?.px ?? centro.px,
      py: posiciones.current[i]?.py ?? centro.py,
      estado: m.estado,
      etiqueta: m.etiqueta
    }))
    let cuadro
    const paso = () => {
      let movimiento = 0
      posiciones.current = posiciones.current.map((p, i) => {
        const dx = metas[i].px - p.px
        const dy = metas[i].py - p.py
        movimiento = Math.max(movimiento, Math.abs(dx), Math.abs(dy))
        const cerca = Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2
        return { px: cerca ? metas[i].px : p.px + dx * SUAVIZADO, py: cerca ? metas[i].py : p.py + dy * SUAVIZADO, estado: metas[i].estado, etiqueta: metas[i].etiqueta }
      })
      pintar({ barrenos: posiciones.current, ...REPOSO })
      if (movimiento >= 0.2 && !reducirMovimiento) cuadro = requestAnimationFrame(paso)
    }
    if (reducirMovimiento) {
      posiciones.current = metas
      pintar({ barrenos: metas, ...REPOSO })
    } else {
      paso()
    }
    return () => cancelAnimationFrame(cuadro)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, plantilla, etiquetas, escena, desafio, reducirMovimiento])

  // Animación de la voladura. Con "reducir movimiento" se reproduce igual (la inicia el jugador),
  // pero sin destellos ni sacudidas de pantalla.
  useEffect(() => {
    if (modo !== 'animacion' || !guion) return undefined
    let cuadro
    const inicio = performance.now()
    const paso = (ahora) => {
      const t = Math.min(guion.duracion, (ahora - inicio) / 1000)
      const estado = estadoEn(guion, t)
      if (reducirMovimiento) pintar({ ...estado, destello: 0 })
      else pintar(estado, estado.sacudida)
      if (t < guion.duracion) cuadro = requestAnimationFrame(paso)
      else alFin.current?.()
    }
    cuadro = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(cuadro)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, guion, reducirMovimiento, ciclo])

  useEffect(() => {
    if (modo === 'final' && guion) pintar(estadoEn(guion, guion.duracion))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, guion])

  // Con el amarre manual, tocar un barreno lo suma al orden de salida.
  const alTocar = (e) => {
    if (!onTocar || modo !== 'edicion') return
    const caja = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - caja.left) / caja.width) * ANCHO
    const y = ((e.clientY - caja.top) / caja.height) * ALTO
    let mejor = -1
    let distancia = RADIO_TOQUE
    posiciones.current.forEach((p, i) => {
      const d = Math.hypot(p.px - x, p.py - y)
      if (d < distancia) { distancia = d; mejor = i }
    })
    if (mejor >= 0) onTocar(mejor)
  }

  return (
    <canvas
      ref={canvas}
      onClick={alTocar}
      data-tocable={onTocar ? 'si' : undefined}
      className={styles.escena}
      width={ANCHO}
      height={ALTO}
      role="img"
      aria-label={`Frente de ${desafio.geometria.nombre.toLowerCase()} con la plantilla de barrenación`}
    />
  )
}
