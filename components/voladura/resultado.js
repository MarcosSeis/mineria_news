import IconoPixel from './iconoPixel'
import { TIPOS_AMARRE } from '@/lib/voladura/amarre'
import styles from '@/styles/voladura.module.css'

const indicadores = [
  ['Avance', 'advance'],
  ['Fragmentación', 'fragmentation'],
  ['Control', 'overbreak'],
  ['Eficiencia', 'efficiency']
]

function Evento({ evento }) {
  const destacado = evento.rareza === 'raro' || evento.rareza === 'extremo'
  return (
    <li className={`${styles.evento} ${evento.positivo ? styles.eventoBueno : ''} ${destacado ? styles.eventoRaro : ''}`}>
      <IconoPixel nombre={evento.icono} />
      <div>
        <p className={styles.eventoTitulo}>
          {evento.nombre}
          {destacado && <span className={styles.insignia}>{evento.rarezaEtiqueta}</span>}
        </p>
        <p className={styles.humor}>“{evento.humor}”</p>
        <p className={styles.eventoDetalle}>{evento.detalle}</p>
        {evento.etiquetas.length > 0 && (
          <ul className={styles.etiquetas}>
            {evento.etiquetas.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}
      </div>
    </li>
  )
}

export default function Resultado({ resultado, numero, avisoCompartir, puedeCompartir, onCompartir, onRepetir, cuentaAtras }) {
  return (
    <section className={styles.resultado} aria-labelledby="titulo-resultado">
      <h2 id="titulo-resultado" className={styles.tituloResultado}>LA VOLADURA #{numero}</h2>
      <p className={styles.puntos} aria-label={`Puntuación ${resultado.score} de 100`}>
        <span className={styles.puntosNumero}>{resultado.score}</span><span className={styles.puntosMax}> / 100</span>
      </p>
      <p className={`${styles.nivel} ${styles[`nivel_${resultado.nivel.clave}`]}`}>{resultado.nivel.titulo}</p>

      <ul className={styles.indicadores}>
        {indicadores.map(([nombre, clave]) => (
          <li key={clave}>
            <span>{nombre}</span>
            <span className={styles.medidor} aria-hidden="true"><span style={{ width: `${resultado[clave]}%` }} /></span>
            <strong>{resultado[clave]}</strong>
          </li>
        ))}
      </ul>

      <p className={styles.amarreResultado}>Amarre: <strong>{TIPOS_AMARRE.find((t) => t.id === resultado.amarre.tipo)?.nombre}</strong></p>

      <div className={styles.suceso}>
        <h3>{resultado.events.length ? '¡Imprevisto en la operación!' : 'Sin imprevistos'}</h3>
        {resultado.events.length > 0
          ? <ul className={styles.eventos}>{resultado.events.map((e) => <Evento key={e.id} evento={e} />)}</ul>
          : <p className={styles.humor}>“{resultado.mensaje}”</p>}
      </div>

      <div className={styles.suceso}>
        <h3>Lo que pasó en el frente</h3>
        <ul className={styles.consejos}>
          {resultado.consejos.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>

      <div className={styles.compartir}>
        <button type="button" className={styles.botonPrincipal} onClick={() => onCompartir('nativo')}>
          {puedeCompartir ? 'COMPARTIR RESULTADO' : 'COPIAR RESULTADO'}
        </button>
        <div className={styles.redes} role="group" aria-label="Publicar en redes sociales">
          <button type="button" className={`${styles.red} ${styles.facebook}`} onClick={() => onCompartir('facebook')}>Facebook</button>
          <button type="button" className={`${styles.red} ${styles.linkedin}`} onClick={() => onCompartir('linkedin')}>LinkedIn</button>
          <button type="button" className={`${styles.red} ${styles.instagram}`} onClick={() => onCompartir('instagram')}>Instagram</button>
        </div>
        <div className={styles.acciones}>
          <button type="button" className={styles.botonSecundario} onClick={() => onCompartir('imagen')}>Descargar imagen</button>
          {puedeCompartir && <button type="button" className={styles.botonSecundario} onClick={() => onCompartir('copiar')}>Copiar texto</button>}
          <button type="button" className={styles.botonSecundario} onClick={onRepetir}>Ver la voladura otra vez</button>
        </div>
      </div>
      <p className={styles.aviso} role="status" aria-live="polite">{avisoCompartir}</p>

      <div className={styles.proximo}>
        <span>Próximo reto en</span>
        <strong>{cuentaAtras}</strong>
        <span>Hoy ya hiciste tu voladura. Mañana te toca otra roca.</span>
      </div>
    </section>
  )
}
