import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { getDailyChallenge } from '@/lib/voladura/challengeEngine'
import { evaluateBlast } from '@/lib/voladura/blastEngine'
import { configInicial, normalizarConfig } from '@/lib/voladura/config'
import { valoresReales, calcularMetricas } from '@/lib/voladura/metricas'
import {
  textoCompartir, compartirResultado, copiarResultado, compartirImagen, descargarImagen, puedeCompartirArchivos,
  urlFacebook, urlLinkedIn, URL_INSTAGRAM, urlJuego
} from '@/lib/voladura/compartir'
import { crearEscena } from '@/lib/voladura/pixelart/escena'
import { etiquetasUtiles, alternarManual } from '@/lib/voladura/amarre'
import { dibujarTarjeta, aBlob } from '@/lib/voladura/tarjeta'
import { etiquetaCompetencia } from '@/data/voladura/rocas'
import useCuentaAtras from '@/hooks/useCuentaAtras'
import EscenaPixel from './escenaPixel'
import Controles from './controles'
import Resultado from './resultado'
import styles from '@/styles/voladura.module.css'

const clave = (fecha) => `la-voladura-${fecha}`
const CLAVE_AYUDA = 'la-voladura-ayuda-vista'
const HUMEDAD = { seco: 'Seco', humedo: 'Húmedo', muy_humedo: 'Muy húmedo' }
const FRACTURAMIENTO = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' }

const AVISOS = { compartido: '¡Compartido!', copiado: '¡Resultado copiado!', error: 'No se pudo copiar el resultado', cancelado: '' }

function Ayuda({ alCerrar }) {
  const boton = useRef(null)
  useEffect(() => { boton.current?.focus() }, [])
  return (
    <div className={styles.fondo} onClick={(e) => { if (e.target === e.currentTarget) alCerrar() }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-ayuda">
        <h2 id="titulo-ayuda">¿Cómo se juega?</h2>
        <ol className={styles.pasos}>
          <li>Mira el reto: roca, humedad y avance objetivo.</li>
          <li>Mueve los controles: los barrenos se reacomodan en el frente. Elige el amarre: en qué orden salen.</li>
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
  const [aviso, setAviso] = useState('')
  const [verAyuda, setVerAyuda] = useState(false)
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
      setFase('config')
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

  useEffect(() => {
    if (!verAyuda) return undefined
    const alPulsar = (e) => { if (e.key === 'Escape') cerrarAyuda() }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [verAyuda, cerrarAyuda])

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
      ventana(urlLinkedIn(texto()))
      await copiarResultado(texto())
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
    <div className={styles.pantalla}>
      <header className={styles.barra}>
        <Link href="/juegos" className={styles.circulo} aria-label="Volver a los juegos">←</Link>
        <h1>LA VOLADURA</h1>
        <button type="button" className={styles.circulo} aria-label="Cómo se juega" onClick={() => setVerAyuda(true)}>?</button>
      </header>

      {!desafio ? <p className={styles.cargando}>Preparando el frente de hoy…</p> : (
        <main className={styles.juego}>
          <div className={styles.columna}>
            <section className={styles.reto} aria-label="Reto del día">
              <p className={styles.retoNumero}>RETO #{desafio.numero} · {desafio.nivel.toUpperCase()} · {desafio.zona.toUpperCase()}</p>
              <h2 className={styles.retoTitulo}>{desafio.geometria.nombre} en {desafio.roca.nombre.toLowerCase()}</h2>
              <ul className={styles.fichas}>
                <li><span>Roca</span><strong>{desafio.roca.nombre} · {etiquetaCompetencia(desafio.roca.competencia)}</strong></li>
                <li><span>Humedad</span><strong>{HUMEDAD[desafio.humedad]}</strong></li>
                <li><span>Fracturas</span><strong>{FRACTURAMIENTO[desafio.fracturamiento]}</strong></li>
                <li><span>Sección</span><strong>{desafio.geometria.ancho} × {desafio.geometria.alto} m</strong></li>
                <li><span>Barreno</span><strong>Ø {desafio.diametro} mm</strong></li>
                <li><span>Dificultad</span><strong aria-label={`${desafio.dificultad} de 5`}>{'★'.repeat(desafio.dificultad)}{'☆'.repeat(5 - desafio.dificultad)}</strong></li>
              </ul>
              <p className={styles.objetivo}>Objetivo: avanzar <strong>{desafio.avanceObjetivo} m</strong></p>
            </section>

            {/* En el móvil la escena queda fija arriba para ver cómo se mueve la plantilla mientras se ajusta. */}
            <div className={`${styles.escenaWrap} ${fase === 'config' ? styles.fija : ''}`}>
              <EscenaPixel
                desafio={desafio}
                plantilla={vista?.plantilla}
                modo={modoEscena}
                resultado={resultado}
                onFin={alTerminarAnimacion}
                reducirMovimiento={reducirMovimiento}
                ciclo={ciclo}
                etiquetas={fase === 'config' ? etiquetas : null}
                onTocar={fase === 'config' && config.amarre === 'manual' ? tocarBarreno : null}
              />
              {fase === 'config' && vista && (
                <ul className={styles.lecturas} aria-label="Lecturas de la plantilla">
                  <li><span>Cobertura</span><strong>{Math.round(vista.cobertura * 100)}%</strong></li>
                  <li><span>Barrenos útiles</span><strong className={vista.plantilla.fuera ? styles.alerta : ''}>{vista.utiles}/{config.barrenos}</strong></li>
                  <li><span>Carga total</span><strong>{vista.kgTotal.toFixed(0)} kg</strong></li>
                </ul>
              )}
            </div>
          </div>

          <div className={styles.columna}>
            {fase === 'config' && vista && (
              <>
                <p className={styles.indicaciones}>1 · Diseña la plantilla &nbsp; 2 · Ajusta la carga &nbsp; 3 · Define el amarre &nbsp; 4 · ¡VOLAR!</p>
                <Controles
                  config={config}
                  onCambio={setConfig}
                  numerados={config.orden.filter((i) => vista.plantilla.barrenos[i]?.dentro).length}
                  total={vista.utiles}
                />
                <p className={styles.legal}>Juego de entretenimiento: no es una herramienta de diseño ni una recomendación real de voladura.</p>
                <div className={styles.barraAccion}>
                  <button type="button" className={styles.botonVolar} onClick={ejecutar}>¡VOLAR!</button>
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

      {verAyuda && <Ayuda alCerrar={cerrarAyuda} />}
    </div>
  )
}
