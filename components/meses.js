import { useEffect, useState } from 'react';
import styles from '@/styles/meses.module.css';
import Mes from './mes';
import Evento from './evento';


export default function Meses({year, eventos}) {

    const actual = new Date().getMonth();

    const [mesSeleccionado, setMesSeleccionado] = useState(actual);
    const [eventos_meses, setEventos_meses] = useState([]);

    const meses = [{mes:'Enero', id:0}, {mes:'Febrero', id:1}, {mes:'Marzo', id:2}, {mes:'Abril', id:3}, {mes:'Mayo', id:4}, {mes:'Junio', id:5}, {mes:'Julio', id:6}, {mes:'Agosto', id:7}, {mes:'Septiembre', id:8}, {mes:'Octubre', id:9}, {mes:'Noviembre', id:10}, {mes:'Diciembre', id:11}]

  
    useEffect(() => {
      if(mesSeleccionado){
        const eventos_meses = eventos.filter(e => {
          const fecha = e.acf.fecha_ini;
          return meses[mesSeleccionado].mes.toLocaleLowerCase() === new Date(fecha).toLocaleDateString("es-ES", {month: "long"});
        });
        setEventos_meses(eventos_meses);
      }
     

    },[mesSeleccionado])

    console.log(eventos_meses)

  return (
    <>
     <div className={styles.meses}>
          {meses.map(mes => (
              <Mes 
                key={mes.id}
                id={mes.id}
                mes={mes.mes}
                actual={mesSeleccionado}
                onClick={e => setMesSeleccionado(+e.target.dataset.val)}
                />
          ))}
      </div>

    <h2>{meses[mesSeleccionado].mes}, {year}</h2>

    <div className={styles.lista}>
    <h2>{eventos_meses.length ? 'Eventos' : 'No hay eventos este mes'}</h2>
      
      {
          eventos_meses.map(evento => (
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