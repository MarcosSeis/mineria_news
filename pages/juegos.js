import Link from 'next/link'
import Layout from '@/components/layout'
import { juegos } from '@/data/juegos'
import styles from '@/styles/juegos.module.css'

export default function Juegos() {
  return (
    <Layout
      title="Juegos"
      description="Juegos diarios de Minería News: Mineral Wordle y La Voladura. Un reto nuevo cada día para gente de minería."
    >
      <main>
        <h1 className="heading">Juegos</h1>
        <p className={styles.intro}>Un reto nuevo cada día. Juega, comparte tu resultado y vuelve mañana.</p>
        <ul className={styles.lista}>
          {juegos.map((juego) => (
            <li key={juego.href} className={styles.tarjeta} style={{ '--color': juego.color }}>
              <Link href={juego.href} className={styles.enlace}>
                <span className={styles.emoji} aria-hidden="true">{juego.emoji}</span>
                <h2>{juego.nombre}</h2>
                <p>{juego.descripcion}</p>
                <span className={styles.detalle}>{juego.detalle}</span>
                <span className={styles.jugar}>Jugar ▸</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </Layout>
  )
}
