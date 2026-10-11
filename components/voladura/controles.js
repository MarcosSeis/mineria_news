import { explosivos, distribuciones } from '@/data/voladura/explosivos'
import { TIPOS_AMARRE } from '@/lib/voladura/amarre'
import { BARRENOS_MIN, BARRENOS_MAX, RANGOS, aMetros } from '@/lib/voladura/config'
import styles from '@/styles/voladura.module.css'

function Deslizador({ id, etiqueta, bajo, alto, valor, onCambio, detalle }) {
  return (
    <div className={styles.control}>
      <div className={styles.controlTitulo}>
        <label htmlFor={id}>{etiqueta}</label>
        {detalle && <span className={styles.detalle}>{detalle}</span>}
      </div>
      <input id={id} type="range" min="0" max="100" step="1" value={valor} onChange={(e) => onCambio(Number(e.target.value))} className={styles.deslizador} style={{ '--valor': `${valor}%` }} />
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

export default function Controles({ config, onCambio, deshabilitado, numerados = 0, total = 0 }) {
  const cambiar = (campo) => (valor) => onCambio({ ...config, [campo]: valor })
  const distribucion = distribuciones.find((d) => d.id === config.distribucion)
  const explosivo = explosivos.find((e) => e.id === config.explosivo)
  const llenado = aMetros(RANGOS.llenado, config.carga)
  const amarre = TIPOS_AMARRE.find((t) => t.id === config.amarre)
  const elegirAmarre = (id) => onCambio({ ...config, amarre: id, orden: [] })

  return (
    <fieldset className={styles.controles} disabled={deshabilitado}>
      <legend className={styles.sr}>Parámetros de la voladura</legend>

      <Deslizador id="burden" etiqueta="Burden" bajo="BAJO" alto="ALTO" valor={config.burden} onCambio={cambiar('burden')} />
      <Deslizador id="espaciamiento" etiqueta="Espaciamiento" bajo="BAJO" alto="ALTO" valor={config.espaciamiento} onCambio={cambiar('espaciamiento')} />
      <Deslizador id="profundidad" etiqueta="Profundidad" bajo="BAJA" alto="ALTA" valor={config.profundidad} onCambio={cambiar('profundidad')} />

      <div className={styles.control}>
        <div className={styles.controlTitulo}><span id="etiqueta-barrenos">Número de barrenos</span></div>
        <div className={styles.contador} role="group" aria-labelledby="etiqueta-barrenos">
          <button type="button" className={styles.paso} aria-label="Menos barrenos" onClick={() => cambiar('barrenos')(Math.max(BARRENOS_MIN, config.barrenos - 1))} disabled={config.barrenos <= BARRENOS_MIN}>−</button>
          <output className={styles.cuenta} aria-live="polite">{config.barrenos}</output>
          <button type="button" className={styles.paso} aria-label="Más barrenos" onClick={() => cambiar('barrenos')(Math.min(BARRENOS_MAX, config.barrenos + 1))} disabled={config.barrenos >= BARRENOS_MAX}>+</button>
        </div>
      </div>

      <div className={`${styles.control} ${styles.carga_fila}`}>
        <div className={styles.cargaControl}>
          <Deslizador id="carga" etiqueta="Carga por barreno" bajo="POCA" alto="MUCHA" valor={config.carga} onCambio={cambiar('carga')} />
        </div>
        <Tubo llenado={llenado} distribucion={config.distribucion} />
      </div>

      <div className={styles.selectores}>
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
      </div>

      <div className={styles.control}>
        <div className={styles.controlTitulo}><span id="etiqueta-amarre">Amarre · orden de salida</span></div>
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
        {config.amarre === 'manual' && <p className={styles.ayudaSelector}>Los barrenos sin número salen todos juntos al final.</p>}
      </div>
    </fieldset>
  )
}
