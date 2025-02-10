import Link from 'next/link'
import styles from '@/styles/jobs.module.css'

export default function Job({job, id}) {
  
  const {titulo, requisitos, fecha, sueldo, empresa, ubicacion } = job
  

  const hoy = new Date();
  const fecha_publicacion = new Date(fecha);
  const day_as_milliseconds = 86400000;
  const diff_mill = hoy - fecha_publicacion;
  const dif_days = Math.floor(diff_mill / day_as_milliseconds)

  return (

      <main className={`${styles.post} ${styles['mt-3']}`}>
        <Link href={`/trabajos/${id}`} className={`${styles.enlace} ${dif_days > 28 ? 'ocultar': ''} `}>
            <div className={styles.jobs}>
                <p className={styles.resumen}>Hace {dif_days} {dif_days > 1 ? 'días': 'dia'}</p>
                <h3>{titulo}</h3>
                <p>{sueldo}</p>
                <p className={styles.resumen}>{requisitos}</p>
                <p className={styles.empresa}>{empresa}</p>
                <p>Ubicacion: <span className={styles.resumen}>{ubicacion}</span></p>
            </div>
        </Link> 
      </main>
        
        

  )
}
