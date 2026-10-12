import { useEffect, useRef } from 'react'
import { etiquetaCompetencia } from '@/data/voladura/rocas'
import styles from '@/styles/voladura.module.css'

export const HUMEDAD = { seco: 'Seco', humedo: 'Húmedo', muy_humedo: 'Muy húmedo' }
export const FRACTURAMIENTO = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' }

// Pop-up con las condiciones del reto del día. Al cerrarlo solo quedan la escena y los controles.
export default function FichaReto({ desafio, alCerrar }) {
  const boton = useRef(null)
  useEffect(() => { boton.current?.focus() }, [])

  return (
    <div className={styles.fondo} onClick={(e) => { if (e.target === e.currentTarget) alCerrar() }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-reto">
        <p className={styles.retoNumero}>RETO #{desafio.numero} · {desafio.nivel.toUpperCase()} · {desafio.zona.toUpperCase()}</p>
        <h2 id="titulo-reto" className={styles.retoTitulo}>{desafio.geometria.nombre} en {desafio.roca.nombre.toLowerCase()}</h2>
        <ul className={styles.fichas}>
          <li><span>Roca</span><strong>{desafio.roca.nombre} · {etiquetaCompetencia(desafio.roca.competencia)}</strong></li>
          <li><span>Humedad</span><strong>{HUMEDAD[desafio.humedad]}</strong></li>
          <li><span>Fracturas</span><strong>{FRACTURAMIENTO[desafio.fracturamiento]}</strong></li>
          <li><span>Sección</span><strong>{desafio.geometria.ancho} × {desafio.geometria.alto} m</strong></li>
          <li><span>Barreno</span><strong>Ø {desafio.diametro} mm</strong></li>
          <li><span>Dificultad</span><strong aria-label={`${desafio.dificultad} de 5`}>{'★'.repeat(desafio.dificultad)}{'☆'.repeat(5 - desafio.dificultad)}</strong></li>
        </ul>
        <p className={styles.objetivo}>Objetivo: avanzar <strong>{desafio.avanceObjetivo} m</strong></p>
        <p className={styles.pistaRoca}>Pista: {desafio.roca.pista}</p>
        <button ref={boton} type="button" className={styles.botonPrincipal} onClick={alCerrar}>¡A DISEÑAR!</button>
      </div>
    </div>
  )
}
