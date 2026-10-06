import styles from '@/styles/meses.module.css';

export default function Mes({mes, id, actual, onClick}) {

  return (
        <button
          type="button"
          aria-pressed={actual === id}
          className={actual === id ? styles.actual : ''}
          onClick={() => onClick(id)}
        >{mes}</button>
  )
}
