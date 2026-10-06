import { useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/meses.module.css';
import { parseFecha, urlSegura } from '@/utils/helpers';

const formatear = (fecha, opciones) =>
    parseFecha(fecha)?.toLocaleDateString("es-ES", { timeZone: 'UTC', ...opciones }) ?? ''

export default function Evento({evento}) {

    const {titulo, horario, imagen, detalles, ubicacion, pagina_evento, calendario_google, fecha_ini, fecha_fin} = evento

    const inicia_weekday = formatear(fecha_ini, { weekday: "short" })
    const inicia_day = formatear(fecha_ini, { day: "numeric" })
    const fin_weekday = formatear(fecha_fin, { weekday: "short" })
    const fin_day = formatear(fecha_fin, { day: "numeric" })

    const paginaEvento = urlSegura(pagina_evento)
    const calendario = urlSegura(calendario_google)

    const [mostrar, setMostrar] = useState(false);

  return (
    <>
     <button
        type="button"
        className={styles.lista_evento}
        aria-expanded={mostrar}
        onClick={() => setMostrar(!mostrar)}>
            <div>
            {imagen && <Image src={imagen} width={160} height={160} alt={`Imagen ${titulo}`} />}
            </div>

            <div className={styles.fechas}>
              <div className={styles.lista_fechaInicio}>
                <em>{inicia_weekday}</em>
                <em>{inicia_day}</em>
              </div>
              -
              <div className={styles.lista_fechaFinal}>
                <em>{fin_weekday}</em>
                <em>{fin_day}</em>
              </div>
            </div>

            <div className={styles.titulo_horario}>
              <h3>{titulo}</h3>
              <p>&#9202; {horario}</p>
            </div>
      </button>
            <div className={`${styles.lista_desplegable} ${mostrar ? styles.lista_desplegable_visible : ''}`}>
              <div>
                 {imagen && <Image src={imagen} width={600} height={400} alt={`Imagen ${titulo}`} />}
              </div>
              <div>
                <h3>Detalles del evento:</h3>
                <p>{detalles}</p>
              </div>
              <div>
                <h3>Horario:</h3>
                <p>{horario}</p>
              </div>
              <div>
                <h3>Ubicacion:</h3>
                <p>{ubicacion}</p>
              </div>
              <div className={styles.lista_desplegable_dos}>
                {paginaEvento && <a href={paginaEvento} target="_blank" rel="noopener noreferrer">Abrir página del evento</a>}
                {calendario && <a href={calendario} target="_blank" rel="noopener noreferrer">Google Calendar</a>}
              </div>
            </div>
    </>
  )
}
