import { useEffect, useRef } from 'react'
import { crearLienzo, aImageData, dibujarSprite } from '@/lib/voladura/pixelart/lienzo'
import { iconos } from '@/lib/voladura/pixelart/sprites'
import styles from '@/styles/voladura.module.css'

// Icono de 8×8 píxeles de un evento.
export default function IconoPixel({ nombre }) {
  const canvas = useRef(null)

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    const sprite = iconos[nombre] || iconos.chispa
    if (!ctx) return
    const lienzo = crearLienzo(8, 8)
    dibujarSprite(lienzo, sprite, 0, 0)
    ctx.putImageData(aImageData(lienzo), 0, 0)
  }, [nombre])

  return <canvas ref={canvas} className={styles.icono} width={8} height={8} aria-hidden="true" />
}
