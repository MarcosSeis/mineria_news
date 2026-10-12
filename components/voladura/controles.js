import { explosivos, distribuciones } from '@/data/voladura/explosivos'
import { TIPOS_AMARRE } from '@/lib/voladura/amarre'
import { BARRENOS_MIN, BARRENOS_MAX, RANGOS, aMetros } from '@/lib/voladura/config'
import styles from '@/styles/voladura.module.css'

const metros = (rango, valor) => `${aMetros(rango, valor).toFixed(1)} m`
const porcentajeCarga = (valor) => `${Math.round(aMetros(RANGOS.llenado, valor) * 100)} %`
const nombreAmarre = (id) => TIPOS_AMARRE.find((t) => t.id === id)?.nombre ?? ''

// Cuatro grupos de controles: cada uno cabe en pantalla sin desplazarse. "resumen" es el valor
// que se ve siempre en la ficha, para tener todo a la vista sin cambiar de grupo.
export const PASOS = [
  { id: 'plantilla', nombre: 'Plantilla', resumen: (c) => `${aMetros(RANGOS.burden, c.burden).toFixed(1)}×${aMetros(RANGOS.espaciamiento, c.espaciamiento).toFixed(1)} m` },
  { id: 'barreno', nombre: 'Barreno', resumen: (c) => `${metros(RANGOS.profundidad, c.profundidad)}·${Math.round(aMetros(RANGOS.llenado, c.carga) * 100)}%` },
  { id: 'explosivo', nombre: 'Explosivo', resumen: (c) => explosivos.find((e) => e.id === c.explosivo)?.nombre ?? '' },
  { id: 'amarre', nombre: 'Amarre', resumen: (c) => nombreAmarre(c.amarre) }
]

function Deslizador({ id, etiqueta, ayuda, valorTexto, bajo, alto, valor, onCambio }) {
  return (
    <div className={styles.control}>
      <div className={styles.controlTitulo}>
        <label htmlFor={id}>{etiqueta}</label>
        <output htmlFor={id} className={styles.valor}>{valorTexto}</output>
      </div>
      <p id={`${id}-ayuda`} className={styles.pista}>{ayuda}</p>
      <div className={styles.sliderFila}>
        <span>{bajo}</span>
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
        <span>{alto}</span>
      </div>
    </div>
  )
}

// Opciones en fila (botones grandes en vez de un desplegable): se ven todas de un vistazo.
function Segmentado({ id, etiqueta, opciones, valor, onCambio, descripcion, columnas }) {
  return (
    <div className={styles.control}>
      <span id={`${id}-etiqueta`} className={styles.controlTitulo}>{etiqueta}</span>
      <div className={styles.segmentos} role="radiogroup" aria-labelledby={`${id}-etiqueta`} style={{ '--columnas': columnas }}>
        {opciones.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={valor === o.id}
            className={`${styles.amarre} ${valor === o.id ? styles.amarreActivo : ''}`}
            onClick={() => onCambio(o.id)}
          >
            {o.corto ?? o.nombre}
          </button>
        ))}
      </div>
      <p className={styles.ayudaSelector}>{descripcion}</p>
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

// Ficha de cada grupo: nombre y valor actual. Se ven siempre, sin desplazarse.
export function Pestanas({ config, paso, onPaso }) {
  return (
    <div className={styles.pasos} role="tablist" aria-label="Grupos de controles">
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
          <span className={styles.paso_nombre}>{p.nombre}</span>
          <span className={styles.paso_valor}>{p.resumen(config)}</span>
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
  const actual = PASOS[paso]

  return (
    <fieldset id="panel-controles" role="tabpanel" aria-labelledby={`paso-${actual.id}`} className={styles.controles}>
      <legend className={styles.sr}>{actual.nombre}</legend>

      {paso === 0 && (
        <>
          <Deslizador id="burden" etiqueta="Burden" ayuda="Distancia entre filas de barrenos." valorTexto={metros(RANGOS.burden, config.burden)} bajo="CERRADO" alto="ABIERTO" valor={config.burden} onCambio={cambiar('burden')} />
          <Deslizador id="espaciamiento" etiqueta="Espaciamiento" ayuda="Distancia entre barrenos de una misma fila." valorTexto={metros(RANGOS.espaciamiento, config.espaciamiento)} bajo="JUNTOS" alto="SEPARADOS" valor={config.espaciamiento} onCambio={cambiar('espaciamiento')} />
          <div className={styles.controlFila}>
            <div>
              <span id="etiqueta-barrenos" className={styles.controlTitulo}>Número de barrenos</span>
              <p className={styles.pista}>Cuántos perforas en el frente.</p>
            </div>
            <div className={styles.contador} role="group" aria-labelledby="etiqueta-barrenos">
              <button type="button" className={styles.paso_boton} aria-label="Menos barrenos" onClick={() => cambiar('barrenos')(Math.max(BARRENOS_MIN, config.barrenos - 1))} disabled={config.barrenos <= BARRENOS_MIN}>−</button>
              <output className={styles.cuenta} aria-live="polite">{config.barrenos}</output>
              <button type="button" className={styles.paso_boton} aria-label="Más barrenos" onClick={() => cambiar('barrenos')(Math.min(BARRENOS_MAX, config.barrenos + 1))} disabled={config.barrenos >= BARRENOS_MAX}>+</button>
            </div>
          </div>
        </>
      )}

      {paso === 1 && (
        <div className={styles.carga_fila}>
          <div className={styles.cargaControl}>
            <Deslizador id="profundidad" etiqueta="Profundidad" ayuda="Largo de cada barreno: define cuánto avanzas." valorTexto={metros(RANGOS.profundidad, config.profundidad)} bajo="CORTO" alto="LARGO" valor={config.profundidad} onCambio={cambiar('profundidad')} />
            <Deslizador id="carga" etiqueta="Carga por barreno" ayuda="Cuánto explosivo lleva cada barreno." valorTexto={porcentajeCarga(config.carga)} bajo="POCA" alto="MUCHA" valor={config.carga} onCambio={cambiar('carga')} />
          </div>
          <Tubo llenado={llenado} distribucion={config.distribucion} />
        </div>
      )}

      {paso === 2 && (
        <>
          <Segmentado id="explosivo" etiqueta="Explosivo" opciones={explosivos.map((e) => ({ id: e.id, nombre: e.nombre, corto: e.id === 'gel' ? 'Gel' : e.nombre }))} valor={config.explosivo} onCambio={cambiar('explosivo')} descripcion={explosivo?.descripcion} columnas={4} />
          <Segmentado id="distribucion" etiqueta="Distribución de carga" opciones={distribuciones.map((d) => ({ id: d.id, nombre: d.nombre, corto: { fondo: 'De fondo', columna: 'Columna', desacoplada: 'Desacoplada' }[d.id] }))} valor={config.distribucion} onCambio={cambiar('distribucion')} descripcion={distribucion?.descripcion} columnas={3} />
        </>
      )}

      {paso === 3 && (
        <div className={styles.control}>
          <span id="etiqueta-amarre" className={styles.controlTitulo}>Orden de salida</span>
          <div className={styles.amarres} role="radiogroup" aria-labelledby="etiqueta-amarre">
            {TIPOS_AMARRE.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={config.amarre === t.id}
                className={`${styles.amarre} ${config.amarre === t.id ? styles.amarreActivo : ''}`}
                onClick={() => onCambio({ ...config, amarre: t.id, orden: [] })}
              >
                {t.nombre}
              </button>
            ))}
          </div>
          <p className={styles.ayudaSelector}>{amarre?.descripcion}</p>
          {config.amarre === 'manual' && (
            <div className={styles.manual}>
              <span role="status">{numerados}/{total} numerados</span>
              <button type="button" className={styles.botonChico} onClick={() => onCambio({ ...config, orden: config.orden.slice(0, -1) })} disabled={!config.orden.length}>Deshacer</button>
              <button type="button" className={styles.botonChico} onClick={() => onCambio({ ...config, orden: [] })} disabled={!config.orden.length}>Borrar</button>
            </div>
          )}
          {config.amarre === 'manual' && <p className={styles.ayudaSelector}>Toca los barrenos de arriba en el orden que quieras. Los que no numeres salen juntos al final.</p>}
        </div>
      )}
    </fieldset>
  )
}
