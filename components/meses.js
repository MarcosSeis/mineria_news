import { useState, useMemo } from 'react';
import styles from '@/styles/meses.module.css';
import Mes from './mes';
import Evento from './evento';
import { parseFecha } from '@/utils/helpers';

export const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
].map((mes, id) => ({ mes, id }))

export default function Meses({year, eventos}) {

    const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());

    const eventosMes = useMemo(() => eventos.filter(e => {
        const fecha = parseFecha(e.acf?.fecha_ini)
        return fecha !== null && fecha.getUTCMonth() === mesSeleccionado && fecha.getUTCFullYear() === year
    }), [eventos, mesSeleccionado, year])

  return (
    <>
     <div className={styles.meses}>
          {MESES.map(mes => (
              <Mes
                key={mes.id}
                id={mes.id}
                mes={mes.mes}
                actual={mesSeleccionado}
                onClick={setMesSeleccionado}
                />
          ))}
      </div>

    <h2>{MESES[mesSeleccionado].mes}, {year}</h2>

    <div className={styles.lista}>
    <h2>{eventosMes.length ? 'Eventos' : 'No hay eventos este mes'}</h2>

      {
          eventosMes.map(evento => (
            <Evento
              key={evento.id}
              evento={evento.acf}
              />
          ))
      }
    </div>

    </>

  )
}
