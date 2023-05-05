import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/styles/meses.module.css';

export default function Evento({evento}) {

    const {titulo, horario, imagen, detalles, ubicacion, pagina_evento, calendario_google, fecha_ini, fecha_fin} = evento 

    const fechaIni = fecha_ini.slice(0, 8);
    const fechaFin = fecha_fin.slice(0, 8);


    const inicia_weekday = new Date(`${fechaIni.slice(0, 4)}-${fechaIni.slice(4, 6)}-${fechaIni.slice(6, 8)}`).toLocaleDateString("es-Es", {timeZone: 'UTC', weekday: "short"})
    const inicia_day = new Date(`${fechaIni.slice(0, 4)}-${fechaIni.slice(4, 6)}-${fechaIni.slice(6, 8)}`).toLocaleDateString("es-Es", {timeZone: 'UTC', day: "numeric"}) 
    const fin_weekday = new Date(`${fechaFin.slice(0, 4)}-${fechaFin.slice(4, 6)}-${fechaFin.slice(6, 8)}`).toLocaleDateString("es-Es", {timeZone: 'UTC', weekday: "short"})
    const fin_day = new Date(`${fechaFin.slice(0, 4)}-${fechaFin.slice(4, 6)}-${fechaFin.slice(6, 8)}`).toLocaleDateString("es-Es", {timeZone: 'UTC', day: "numeric"})

    const [mostrar, setMostrar] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    
    useEffect(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${imagen}`)
          .then(response => response.json())
          .then(data => {
            const url = data.source_url;
            setImageUrl(url);
          })
        }, [imagen]);

  return (
    <>
     <div className={styles.lista_evento} onClick={() => setMostrar(!mostrar)}> 
            <div>
            <Image src={imageUrl} width={160} height={160} alt={`Imagen blog ${titulo}`} />
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
      </div>
            <div className={`${styles.lista_desplegable} ${mostrar ? styles.lista_desplegable_visible : ''}`}>
              <div>
                 <Image src={imageUrl} width={600} height={400} alt={`Imagen blog ${titulo}`} />
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
                <a href={pagina_evento} target="_blank">Abrir página del evento</a>
                <a href={calendario_google} target="_blank">Google Calendar</a>
              </div>
            </div>
    </>
  )
}
