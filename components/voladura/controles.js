import { explosivos, distribuciones } from '@/data/voladura/explosivos'
import { TIPOS_AMARRE } from '@/lib/voladura/amarre'
import { BARRENOS_MIN, BARRENOS_MAX, RANGOS, aMetros } from '@/lib/voladura/config'
import styles from '@/styles/voladura.module.css'

// Los controles se reparten en tres pasos cortos: cada uno cabe en pantalla sin desplazarse.
export const PASOS = [
  { id: 'plantilla', nombre: 'Plantilla', ayuda: 'Mueve los controles y mira arriba cómo se acomodan los barrenos.' },
  { id: 'carga', nombre: 'Carga', ayuda: 'Elige qué explosivo llevan los barrenos y cuánto.' },
  { id: 'amarre', nombre: 'Amarre', ayuda: 'Define en qué orden salen los barrenos. ¡Y a volar!' }
]

const metros = (rango, valor) => `${aMetros(rango, valor).toFixed(1)} m`

function Deslizador({ id, etiqueta, ayuda, valorTexto, bajo, alto, valor, onCambio }) {
  return (
    <div className={styles.control}>
      <div className={styles.controlTitulo}>
        <label htmlFor={id}>{etiqueta}</label>
        <output htmlFor={id} className={styles.valor}>{valorTexto}</output>
      </div>
      <p id={`${id}-ayuda`} className={styles.pista}>{ayuda}</p>
      <input
        id={id}
        type="range"
        min="0"
        max="100"
        step="1"
        value={valor}
        aria-describedby={`${id}-ayuda`}
        aria-valuetext={valorTexto}
        onChange={(e) => onCambio(Number(e.target.value))}
        className={styles.deslizador}
        style={{ '--valor': `${valor}%` }}
      />
      <div className={styles.extremos}><span>{bajo}</span><span>{alto}</span></div>
    </div>
  )
}

// Tubo del barreno: muestra cuánto se carga y cómo se reparte la carga.
function Tubo({ llenado, distribucion }) {
  return (
    <div className={styles.tubo} aria-hidden="true">
      <div className={styles.taco} style={{ height: `${(1 - llenado) * 100}%` }} />
      <div className={`${styles.carga} ${styles[`carga_${distribucion}`]}`} style={{ height: `${llenado * 100}%` }} />
    </div>
  )
}

// Pestañas de los tres pasos: van fijas junto a la escena para saber siempre dónde estás.
export function Pestanas({ paso, onPaso }) {
  return (
    <div className={styles.pasos} role="tablist" aria-label="Pasos del diseño">
      {PASOS.map((p, i) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          id={`paso-${p.id}`}
          aria-selected={i === paso}
          aria-controls="panel-controles"
          className={`${styles.paso_tab} ${i === paso ? styles.paso_activo : ''}`}
          onClick={() => onPaso(i)}
        >
          <span className={styles.paso_numero}>{i + 1}</span>
          {p.nombre}
        </button>
      ))}
    </div>
  )
}

export default function Controles({ config, onCambio, paso = 0, numerados = 0, total = 0 }) {
  const cambiar = (campo) => (valor) => onCambio({ ...config, [campo]: valor })
  const distribucion = distribuciones.find((d) => d.id === config.distribucion)
  const explosivo = explosivos.find((e) => e.id === config.explosivo)
  const llenado = aMetros(RANGOS.llenado, config.carga)
  const amarre = TIPOS_AMARRE.find((t) => t.id === config.amarre)
  const elegirAmarre = (id) => onCambio({ ...config, amarre: id, orden: [] })
  const actual = PASOS[paso]

  return (
    <div className={styles.controlesWrap}>
      <p className={styles.indicaciones}>{actual.ayuda}</p>

      <fieldset id="panel-controles" role="tabpanel" aria-labelledby={`paso-${actual.id}`} className={styles.controles}>
        <legend className={styles.sr}>{actual.nombre}</legend>

        {paso === 0 && (
          <>
            <Deslizador id="burden" etiqueta="Burden" ayuda="Distancia entre filas de barrenos." valorTexto={metros(RANGOS.burden, config.burden)} bajo="CERRADO" alto="ABIERTO" valor={config.burden} onCambio={cambiar('burden')} />
            <Deslizador id="espaciamiento" etiqueta="Espaciamiento" ayuda="Distancia entre barrenos de una misma fila." valorTexto={metros(RANGOS.espaciamiento, config.espaciamiento)} bajo="JUNTOS" alto="SEPARADOS" valor={config.espaciamiento} onCambio={cambiar('espaciamiento')} />
            <div className={styles.control}>
              <div className={styles.controlTitulo}>
                <span id="etiqueta-barrenos">Número de barrenos</span>
                <output className={styles.valor}>{config.barrenos}</output>
              </div>
              <p className={styles.pista}>Cuántos barrenos perforas en el frente.</p>
              <div className={styles.contador} role="group" aria-labelledby="etiqueta-barrenos">
                <button type="button" className={styles.paso_boton} aria-label="Menos barrenos" onClick={() => cambiar('barrenos')(Math.max(BARRENOS_MIN, config.barrenos - 1))} disabled={config.barrenos <= BARRENOS_MIN}>−</button>
                <output className={styles.cuenta} aria-live="polite">{config.barrenos}</output>
                <button type="button" className={styles.paso_boton} aria-label="Más barrenos" onClick={() => cambiar('barrenos')(Math.min(BARRENOS_MAX, config.barrenos + 1))} disabled={config.barrenos >= BARRENOS_MAX}>+</button>
              </div>
            </div>
            <Deslizador id="profundidad" etiqueta="Profundidad" ayuda="Largo de cada barreno: define cuánto avanzas." valorTexto={metros(RANGOS.profundidad, config.profundidad)} bajo="CORTO" alto="LARGO" valor={config.profundidad} onCambio={cambiar('profundidad')} />
          </>
        )}

        {paso === 1 && (
          <>
            <div className={styles.carga_fila}>
              <div className={styles.cargaControl}>
                <Deslizador id="carga" etiqueta="Carga por barreno" ayuda="Cuánto explosivo lleva cada barreno." valorTexto={`${Math.round(llenado * 100)} %`} bajo="POCA" alto="MUCHA" valor={config.carga} onCambio={cambiar('carga')} />
              </div>
              <Tubo llenado={llenado} distribucion={config.distribucion} />
            </div>

            <div className={styles.control}>
              <label htmlFor="explosivo" className={styles.controlTitulo}>Explosivo</label>
              <select id="explosivo" className={styles.selector} value={config.explosivo} onChange={(e) => cambiar('explosivo')(e.target.value)}>
                {explosivos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
              <p className={styles.ayudaSelector}>{explosivo?.descripcion}</p>
            </div>
            <div className={styles.control}>
              <label htmlFor="distribucion" className={styles.controlTitulo}>Distribución de carga</label>
              <select id="distribucion" className={styles.selector} value={config.distribucion} onChange={(e) => cambiar('distribucion')(e.target.value)}>
                {distribuciones.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
              <p className={styles.ayudaSelector}>{distribucion?.descripcion}</p>
            </div>
          </>
        )}

        {paso === 2 && (
          <div className={styles.control}>
            <div className={styles.controlTitulo}><span id="etiqueta-amarre">Orden de salida</span></div>
            <div className={styles.amarres} role="radiogroup" aria-labelledby="etiqueta-amarre">
              {TIPOS_AMARRE.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={config.amarre === t.id}
                  className={`${styles.amarre} ${config.amarre === t.id ? styles.amarreActivo : ''}`}
                  onClick={() => elegirAmarre(t.id)}
                >
                  {t.nombre}
                </button>
              ))}
            </div>
            <p className={styles.ayudaSelector}>{amarre?.descripcion}</p>
            {config.amarre === 'manual' && (
              <div className={styles.manual}>
                <span role="status">{numerados}/{total} barrenos numerados</span>
                <button type="button" className={styles.botonChico} onClick={() => onCambio({ ...config, orden: config.orden.slice(0, -1) })} disabled={!config.orden.length}>Deshacer</button>
                <button type="button" className={styles.botonChico} onClick={() => onCambio({ ...config, orden: [] })} disabled={!config.orden.length}>Borrar</button>
              </div>
            )}
            {config.amarre === 'manual' && <p className={styles.ayudaSelector}>Toca los barrenos de arriba en el orden que quieras. Los que no numeres salen todos juntos al final.</p>}
          </div>
        )}
      </fieldset>
    </div>
  )
}
