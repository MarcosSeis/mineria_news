import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { getDailyChallenge } from '@/lib/voladura/challengeEngine'
import { evaluateBlast } from '@/lib/voladura/blastEngine'
import { configInicial, normalizarConfig } from '@/lib/voladura/config'
import { valoresReales, calcularMetricas } from '@/lib/voladura/metricas'
import {
  textoCompartir, textoLinkedIn, compartirResultado, copiarResultado, compartirImagen, descargarImagen, puedeCompartirArchivos,
  urlFacebook, urlLinkedIn, URL_INSTAGRAM, urlJuego
} from '@/lib/voladura/compartir'
import { crearEscena } from '@/lib/voladura/pixelart/escena'
import { etiquetasUtiles, alternarManual } from '@/lib/voladura/amarre'
import { dibujarTarjeta, aBlob } from '@/lib/voladura/tarjeta'
import useCuentaAtras from '@/hooks/useCuentaAtras'
import EscenaPixel from './escenaPixel'
import Controles, { Pestanas, PASOS } from './controles'
import Resultado from './resultado'
import FichaReto, { HUMEDAD } from './fichaReto'
import styles from '@/styles/voladura.module.css'

const clave = (fecha) => `la-voladura-${fecha}`
const CLAVE_AYUDA = 'la-voladura-ayuda-vista'
const claveFicha = (fecha) => `la-voladura-ficha-${fecha}`

const AVISOS = { compartido: '¡Compartido!', copiado: '¡Resultado copiado!', error: 'No se pudo copiar el resultado', cancelado: '' }

function Ayuda({ alCerrar }) {
  const boton = useRef(null)
  useEffect(() => { boton.current?.focus() }, [])
  return (
    <div className={styles.fondo} onClick={(e) => { if (e.target === e.currentTarget) alCerrar() }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-ayuda">
        <h2 id="titulo-ayuda">¿Cómo se juega?</h2>
        <ol className={styles.listaPasos}>
          <li>Mira el reto: roca, humedad y avance objetivo.</li>
          <li>Sigue los 3 pasos: plantilla, carga y amarre (el orden de salida). Los barrenos se reacomodan al mover los controles.</li>
          <li>Pulsa <strong>¡VOLAR!</strong>: el minero enciende la mecha y descubres qué salió bien (y qué no).</li>
        </ol>
        <p>Hay un reto nuevo cada día y un solo intento. El 100 es muy difícil: la geología y la operación también juegan.</p>
        <p className={styles.legal}>Es un juego de entretenimiento. Los parámetros son abstracciones y no sirven para diseñar voladuras reales.</p>
        <button ref={boton} type="button" className={styles.botonPrincipal} onClick={alCerrar}>¡A VOLAR!</button>
      </div>
    </div>
  )
}

export default function LaVoladura() {
  const [desafio, setDesafio] = useState(null)
  const [config, setConfig] = useState(configInicial)
  const [fase, setFase] = useState('cargando')
  const [resultado, setResultado] = useState(null)
  const [ciclo, setCiclo] = useState(0)
  const [paso, setPaso] = useState(0)
  const [aviso, setAviso] = useState('')
  const [verAyuda, setVerAyuda] = useState(false)
  const [verFicha, setVerFicha] = useState(false)
  const [reducirMovimiento, setReducirMovimiento] = useState(false)
  const [puedeCompartir, setPuedeCompartir] = useState(false)

  const iniciarDia = useCallback((hoy) => {
    const reto = getDailyChallenge(hoy)
    setDesafio(reto)
    setAviso('')
    let guardado = null
    try { guardado = JSON.parse(localStorage.getItem(clave(reto.fecha))) } catch (e) { /* sin almacenamiento */ }
    if (guardado?.config) {
      const guardada = normalizarConfig(guardado.config)
      setConfig(guardada)
      setResultado(evaluateBlast(guardada, reto))
      setFase('resultado')
    } else {
      setConfig(configInicial)
      setResultado(null)
      setPaso(0)
      setFase('config')
      // Las condiciones cambian cada día: el pop-up se abre solo la primera vez que se entra en el día.
      try { setVerFicha(!localStorage.getItem(claveFicha(reto.fecha))) } catch (e) { setVerFicha(true) }
    }
  }, [])

  useEffect(() => {
    // La fecha solo existe en el cliente: iniciar aquí evita desajustes de hidratación.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    iniciarDia(new Date())
    setReducirMovimiento(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
    setPuedeCompartir(typeof navigator.share === 'function')
    try { setVerAyuda(!localStorage.getItem(CLAVE_AYUDA)) } catch (e) { setVerAyuda(true) }
  }, [iniciarDia])

  const cerrarAyuda = useCallback(() => {
    setVerAyuda(false)
    try { localStorage.setItem(CLAVE_AYUDA, '1') } catch (e) { /* ignorar */ }
  }, [])

  const cerrarFicha = useCallback(() => {
    setVerFicha(false)
    try { if (desafio) localStorage.setItem(claveFicha(desafio.fecha), '1') } catch (e) { /* ignorar */ }
  }, [desafio])

  // La ayuda va primero; la ficha del reto queda detrás hasta cerrarla.
  const ventanaAbierta = verAyuda ? 'ayuda' : verFicha ? 'ficha' : null

  useEffect(() => {
    if (!ventanaAbierta) return undefined
    const alPulsar = (e) => {
      if (e.key !== 'Escape') return
      if (ventanaAbierta === 'ayuda') cerrarAyuda()
      else cerrarFicha()
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [ventanaAbierta, cerrarAyuda, cerrarFicha])

  const alCambiarDia = useCallback(() => iniciarDia(new Date()), [iniciarDia])
  const cuentaAtras = useCuentaAtras(fase === 'resultado', alCambiarDia, desafio?.fecha)

  const vista = useMemo(
    () => (desafio ? calcularMetricas(valoresReales(config), desafio) : null),
    [config, desafio]
  )

  // Números sobre los barrenos: el orden de salida de cada uno (en manual, solo los ya tocados).
  const etiquetas = useMemo(() => {
    if (!vista) return null
    const numeros = etiquetasUtiles(vista.amarre.rangos, vista.plantilla)
    return config.amarre === 'manual' ? numeros.map((n, i) => (config.orden.includes(i) ? n : null)) : numeros
  }, [vista, config.amarre, config.orden])

  const tocarBarreno = useCallback((indice) => {
    if (!vista?.plantilla.barrenos[indice]?.dentro) return
    setConfig((c) => (c.amarre === 'manual' ? { ...c, orden: alternarManual(c.orden, indice) } : c))
  }, [vista])

  const ejecutar = () => {
    const calculado = evaluateBlast(config, desafio)
    try { localStorage.setItem(clave(desafio.fecha), JSON.stringify({ config })) } catch (e) { /* ignorar */ }
    setResultado(calculado)
    setFase('animando')
  }

  const alTerminarAnimacion = useCallback(() => setFase('resultado'), [])

  const repetir = () => {
    setCiclo((c) => c + 1)
    setFase('animando')
  }

  const url = urlJuego
  const texto = () => textoCompartir({ numero: desafio.numero, score: resultado.score, mensaje: resultado.mensaje, url: url() })
  const imagen = () => aBlob(dibujarTarjeta(document.createElement('canvas'), { resultado, numero: desafio.numero, escena: crearEscena(desafio), url: url() }))
  const ventana = (direccion) => window.open(direccion, '_blank', 'noopener,noreferrer,width=600,height=600')

  const compartir = async (red) => {
    if (red === 'facebook') {
      ventana(urlFacebook(url(), texto()))
    } else if (red === 'linkedin') {
      // El editor de LinkedIn se abre con el texto y el enlace; el texto también se copia por si LinkedIn no lo rellena.
      const corto = textoLinkedIn({ numero: desafio.numero, score: resultado.score, mensaje: resultado.mensaje, url: url() })
      ventana(urlLinkedIn(corto))
      await copiarResultado(corto)
      setAviso('Se abrió LinkedIn con tu resultado y el enlace. Si quieres tu tarjeta, usa "Descargar imagen" y adjúntala.')
    } else if (red === 'instagram') {
      if (puedeCompartirArchivos()) {
        setAviso(AVISOS[await compartirImagen(await imagen(), texto())])
      } else {
        // Instagram web no permite publicar desde fuera: se descarga la imagen y se copia el texto.
        ventana(URL_INSTAGRAM)
        descargarImagen(await imagen())
        setAviso((await copiarResultado(texto())) === 'copiado' ? 'Imagen descargada y texto copiado: súbela a tu historia o publicación.' : 'Imagen descargada: súbela a tu historia o publicación.')
      }
    } else if (red === 'imagen') {
      descargarImagen(await imagen())
      setAviso('Imagen descargada.')
    } else if (red === 'copiar') {
      setAviso(AVISOS[await copiarResultado(texto())])
    } else {
      setAviso(AVISOS[await compartirResultado(texto(), url())])
    }
  }

  const enResultado = fase === 'resultado'
  const modoEscena = fase === 'config' ? 'edicion' : fase === 'animando' ? 'animacion' : 'final'

  return (
    <div className={`${styles.pantalla} ${fase === 'config' ? styles.pantallaConfig : ''}`}>
      <header className={styles.barra}>
        <Link href="/juegos" className={styles.circulo} aria-label="Volver a los juegos">←</Link>
        <h1>LA VOLADURA</h1>
        <button type="button" className={styles.circulo} aria-label="Cómo se juega" onClick={() => setVerAyuda(true)}>?</button>
      </header>

      {!desafio ? <p className={styles.cargando}>Preparando el frente de hoy…</p> : (
        <main className={styles.juego}>
          <div className={styles.columna}>
            <button type="button" className={styles.resumen} onClick={() => setVerFicha(true)} aria-label="Ver las condiciones del reto">
              <span className={styles.resumenNumero}>#{desafio.numero}</span>
              <span className={styles.resumenTexto}>{desafio.roca.nombre} · {HUMEDAD[desafio.humedad]} · {desafio.avanceObjetivo} m</span>
              <span className={styles.resumenVer}>VER ▸</span>
            </button>

            <div className={styles.escenaWrap}>
              <div className={styles.marco}>
                <EscenaPixel
                  desafio={desafio}
                  plantilla={vista?.plantilla}
                  modo={modoEscena}
                  resultado={resultado}
                  onFin={alTerminarAnimacion}
                  reducirMovimiento={reducirMovimiento}
                  ciclo={ciclo}
                  etiquetas={fase === 'config' ? etiquetas : null}
                  onTocar={fase === 'config' && paso === 3 && config.amarre === 'manual' ? tocarBarreno : null}
                />
                {fase === 'config' && vista && (
                  <ul className={styles.lecturas} aria-label="Lecturas de la plantilla">
                    <li><span>Cobertura</span> <strong>{Math.round(vista.cobertura * 100)}%</strong></li>
                    <li><span>Útiles</span> <strong className={vista.plantilla.fuera ? styles.alerta : ''}>{vista.utiles}/{config.barrenos}</strong></li>
                  </ul>
                )}
              </div>
              {fase === 'config' && <Pestanas config={config} paso={paso} onPaso={setPaso} />}
            </div>
          </div>

          <div className={styles.columna}>
            {fase === 'config' && vista && (
              <>
                <Controles
                  config={config}
                  onCambio={setConfig}
                  paso={paso}
                  numerados={config.orden.filter((i) => vista.plantilla.barrenos[i]?.dentro).length}
                  total={vista.utiles}
                />
                <div className={styles.barraAccion}>
                  <div className={styles.accionFila}>
                    {paso > 0 && <button type="button" className={styles.atras} aria-label="Paso anterior" onClick={() => setPaso(paso - 1)}>◂</button>}
                    {paso < PASOS.length - 1
                      ? <button type="button" className={styles.botonVolar} onClick={() => setPaso(paso + 1)}>SIGUIENTE ▸</button>
                      : <button type="button" className={styles.botonVolar} onClick={ejecutar}>¡VOLAR!</button>}
                  </div>
                </div>
              </>
            )}

          {fase === 'animando' && (
            <div className={styles.barraAccion}>
              <p className={styles.ejecutando} role="status">¡FUEGO EN EL HUECO!</p>
              <button type="button" className={styles.botonSecundario} onClick={alTerminarAnimacion}>Saltar ▸▸</button>
            </div>
          )}

          {enResultado && resultado && (
            <Resultado
              resultado={resultado}
              numero={desafio.numero}
              avisoCompartir={aviso}
              puedeCompartir={puedeCompartir}
              onCompartir={compartir}
              onRepetir={repetir}
              cuentaAtras={cuentaAtras}
            />
          )}
          </div>
        </main>
      )}

      {ventanaAbierta === 'ayuda' && <Ayuda alCerrar={cerrarAyuda} />}
      {ventanaAbierta === 'ficha' && desafio && <FichaReto desafio={desafio} alCerrar={cerrarFicha} />}
    </div>
  )
}
