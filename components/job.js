import Link from 'next/link'
import styles from '@/styles/jobs.module.css'
import { diasDesde, textoHace } from '@/utils/helpers'

export default function Job({job, id}) {

  const {titulo, requisitos, fecha, sueldo, empresa, ubicacion } = job
  const dias = diasDesde(fecha)

  return (
      <article className={`${styles.post} ${styles['mt-3']}`}>
        <Link href={`/trabajos/${id}`} className={styles.enlace}>
            <div className={styles.jobs}>
                <p className={styles.resumen}>{textoHace(dias)}</p>
                <h3>{titulo}</h3>
                <p>{sueldo}</p>
                <p className={styles.resumen}>{requisitos}</p>
                <p className={styles.empresa}>{empresa}</p>
                <p>Ubicacion: <span className={styles.resumen}>{ubicacion}</span></p>
            </div>
        </Link>
      </article>
  )
}
