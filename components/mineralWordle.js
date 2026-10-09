import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { minerales } from '@/data/minerales'
import {
  MAX_INTENTOS, INTENTOS_PARA_PISTA, mineralDelDia, evaluar, estadoTeclas, textoCompartir, urlFacebook, dibujarTarjeta, fechaLocal, URL_SITIO
} from '@/lib/mineralWordle'
import styles from '@/styles/mineralWordle.module.css'

const filasTeclado = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM']

const clave = (fecha) => `mineral-wordle-${fechaLocal(fecha)}`
const CLAVE_INSTRUCCIONES = 'mineral-wordle-instrucciones-vistas'

function Instrucciones({ alCerrar }) {
  const boton = useRef(null)
  useEffect(() => { boton.current?.focus() }, [])

  return (
    <div className={styles.fondo} onClick={(e) => { if (e.target === e.currentTarget) alCerrar() }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-instrucciones">
        <h2 id="titulo-instrucciones">¿Cómo se juega?</h2>
        <p>Adivina el mineral o metal del día en {MAX_INTENTOS} intentos. Escribe una palabra del largo indicado y pulsa <strong>Enter</strong>; no hace falta que sea un mineral real.</p>
        <ul className={styles.ejemplos}>
          <li><span className={`${styles.muestra} ${styles.correcta}`}>C</span> Verde: la letra está y en el lugar correcto.</li>
          <li><span className={`${styles.muestra} ${styles.presente}`}>O</span> Amarillo: la letra está, pero en otro lugar.</li>
          <li><span className={`${styles.muestra} ${styles.ausente}`}>X</span> Gris: la letra no está en la palabra.</li>
        </ul>
        <p>Sin tildes: <strong>NIQUEL</strong>, no <em>Níquel</em>. Desde el intento {INTENTOS_PARA_PISTA} aparece una pista. Cada día hay un mineral nuevo.</p>
        <button ref={boton} type="button" className={styles.jugar} onClick={alCerrar}>¡A jugar!</button>
      </div>
    </div>
  )
}

export default function MineralWordle() {
  const [fecha, setFecha] = useState(null)
  const [intentos, setIntentos] = useState([])
  const [actual, setActual] = useState('')
  const [aviso, setAviso] = useState('')
  const [verInstrucciones, setVerInstrucciones] = useState(false)

  useEffect(() => {
    const hoy = new Date()
    // La fecha solo existe en el cliente; fijarla aquí evita desajustes de hidratación.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFecha(hoy)
    try {
      const guardado = JSON.parse(localStorage.getItem(clave(hoy)))
      if (Array.isArray(guardado)) setIntentos(guardado)
      // Los jugadores nuevos ven las instrucciones abiertas hasta que las cierran una vez.
      setVerInstrucciones(!localStorage.getItem(CLAVE_INSTRUCCIONES))
    } catch (e) { setVerInstrucciones(true) }
  }, [])

  const cerrarInstrucciones = useCallback(() => {
    setVerInstrucciones(false)
    try { localStorage.setItem(CLAVE_INSTRUCCIONES, '1') } catch (e) { /* ignorar */ }
  }, [])

  const mineral = fecha ? mineralDelDia(fecha, minerales) : null
  const secreta = mineral?.palabra
  const acertado = secreta && intentos[intentos.length - 1] === secreta
  const terminado = acertado || intentos.length >= MAX_INTENTOS

  const escribir = useCallback((letra) => {
    if (terminado || !secreta) return
    setActual((a) => (a.length < secreta.length ? a + letra : a))
  }, [terminado, secreta])

  const borrar = useCallback(() => setActual((a) => a.slice(0, -1)), [])

  const enviar = useCallback(() => {
    if (terminado || !secreta || actual.length !== secreta.length) return
    const nuevos = [...intentos, actual]
    setIntentos(nuevos)
    setActual('')
    try { localStorage.setItem(clave(fecha), JSON.stringify(nuevos)) } catch (e) { /* ignorar */ }
  }, [terminado, secreta, actual, intentos, fecha])

  useEffect(() => {
    const alPulsar = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (verInstrucciones) {
        if (e.key === 'Escape') cerrarInstrucciones()
        return
      }
      if (e.key === 'Enter') enviar()
      else if (e.key === 'Backspace') borrar()
      else if (/^[a-zA-ZñÑ]$/.test(e.key)) escribir(e.key.toUpperCase())
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [enviar, borrar, escribir, verInstrucciones, cerrarInstrucciones])

  const urlJuego = () => `${window.location.origin}/mineral-wordle`
  const resultado = () => textoCompartir(intentos, secreta, fecha)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoCompartir(intentos, secreta, fecha, urlJuego()))
      return true
    } catch (e) {
      return false
    }
  }

  const compartirCopiar = async () => setAviso((await copiar()) ? '¡Copiado!' : 'No se pudo copiar')

  const compartirFacebook = () => {
    window.open(urlFacebook(urlJuego(), resultado()), '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  const compartirInstagram = async () => {
    const ok = await copiar()
    setAviso(ok ? 'Resultado copiado: pégalo en tu historia, mensaje o publicación.' : 'No se pudo copiar el resultado')
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
  }

  const descargarImagen = () => {
    const canvas = dibujarTarjeta(document.createElement('canvas'), intentos, secreta, fecha, URL_SITIO)
    canvas.toBlob((blob) => {
      const enlace = document.createElement('a')
      enlace.href = URL.createObjectURL(blob)
      enlace.download = `mineral-wordle-${fechaLocal(fecha)}.png`
      enlace.click()
      setTimeout(() => URL.revokeObjectURL(enlace.href), 1000)
    }, 'image/png')
    setAviso('Imagen descargada: súbela a tu historia o publicación.')
  }

  const compartirNativo = async () => {
    try {
      await navigator.share({ text: resultado(), url: urlJuego() })
    } catch (e) { /* el jugador canceló */ }
  }

  const teclas = secreta ? estadoTeclas(intentos, secreta) : {}
  const mostrarPista = terminado || intentos.length >= INTENTOS_PARA_PISTA

  return (
    <div className={styles.pantalla}>
      <header className={styles.barra}>
        <Link href="/" className={styles.volver} aria-label="Volver al inicio">←</Link>
        <h1>⛏️ Mineral Wordle</h1>
        <button type="button" className={styles.ayuda} aria-label="Cómo se juega" onClick={() => setVerInstrucciones(true)}>?</button>
      </header>

      {!secreta ? <p className={styles.cargando}>Cargando el mineral del día…</p> : (
        <section className={styles.juego}>
          <p className={styles.pista}>
            {mostrarPista ? `💡 ${mineral.pista}` : `${secreta.length} letras · intento ${intentos.length + 1} de ${MAX_INTENTOS}`}
          </p>

          <div className={styles.tablero} role="grid" aria-label="Tablero" style={{ '--letras': secreta.length }}>
            {Array.from({ length: MAX_INTENTOS }, (_, fila) => {
              const intento = intentos[fila]
              const texto = intento ?? (fila === intentos.length ? actual : '')
              const estados = intento ? evaluar(intento, secreta) : []
              return (
                <div key={fila} className={styles.fila} role="row">
                  {Array.from({ length: secreta.length }, (_, i) => (
                    <div
                      key={i}
                      role="gridcell"
                      className={`${styles.celda} ${estados[i] ? styles[estados[i]] : ''}`}
                      data-estado={estados[i] || (texto[i] ? 'escribiendo' : 'vacia')}
                    >
                      {texto[i] || ''}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>


          {terminado ? (
            <div className={styles.resultado} role="status">
              <p>{acertado ? `¡Excelente! Era ${secreta} 🎉` : `Se acabaron los intentos. Era ${secreta}.`}</p>
              <div className={styles.compartir} role="group" aria-label="Compartir resultado">
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button type="button" className={styles.botonCompartir} onClick={compartirNativo}>Compartir</button>
                )}
                <button type="button" className={`${styles.botonCompartir} ${styles.facebook}`} onClick={compartirFacebook}>Facebook</button>
                <button type="button" className={`${styles.botonCompartir} ${styles.instagram}`} onClick={compartirInstagram}>Instagram</button>
                <button type="button" className={styles.botonCompartir} onClick={descargarImagen}>Descargar imagen</button>
                <button type="button" className={styles.botonCompartir} onClick={compartirCopiar}>Copiar resultado</button>
              </div>
              {aviso && <p className={styles.nota} aria-live="polite">{aviso}</p>}
              <p className={styles.nota}>Vuelve mañana por un nuevo mineral.</p>
            </div>
          ) : (
            <div className={styles.teclado}>
              {filasTeclado.map((fila, n) => (
                <div key={fila} className={styles.filaTeclas}>
                  {n === 2 && <button type="button" className={styles.tecla} onClick={enviar}>Enter</button>}
                  {[...fila].map((letra) => (
                    <button
                      key={letra}
                      type="button"
                      className={`${styles.tecla} ${teclas[letra] ? styles[teclas[letra]] : ''}`}
                      onClick={() => escribir(letra)}
                    >
                      {letra}
                    </button>
                  ))}
                  {n === 2 && <button type="button" className={styles.tecla} onClick={borrar} aria-label="Borrar">⌫</button>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {verInstrucciones && <Instrucciones alCerrar={cerrarInstrucciones} />}
    </div>
  )
}
