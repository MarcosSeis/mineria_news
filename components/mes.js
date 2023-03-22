import styles from '@/styles/meses.module.css';

export default function Mes({mes, id, actual, onClick}) {


  return (
        <a 
          data-val={id}  
          className={actual === id ? styles.actual : ''}
          onClick={onClick}
        >{mes}</a>
  )
}
