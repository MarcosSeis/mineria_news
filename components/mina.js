import Link from "next/link";
import styles from '@/styles/minas.module.css'
import { separarMinerales } from '@/utils/minas'

export default function Mina({ mina, id }) {
  const { titulo, estado, empresa, minerales, estatus } = mina

  return (
    <Link href={`/minas/${id}`} className={styles.tarjeta}>
        <h3>{titulo}</h3>
        <p className={styles.estado}>{[estado, estatus].filter(Boolean).join(' · ')}</p>
        {empresa && <p className={styles.empresa}>{empresa}</p>}
        <ul className={styles.etiquetas}>
            {separarMinerales(minerales).map(mineral => <li key={mineral}>{mineral}</li>)}
        </ul>
    </Link>
  )
}
