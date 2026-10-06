import styles from "@/styles/footer.module.css"
import { CONTACT_EMAIL } from "@/lib/config"

export default function Footer() {
  return (
    <footer className={`contenedor ${styles.footer}`}>
      <div className={styles.redes}>

        <div>
          <p className={styles.marca}>© MINERÍA NEWS</p>
        </div>

        <div className={styles.redes_iconos}>

        </div>

      </div>

      <h3>Contacto: {CONTACT_EMAIL}</h3>
      <p>Mineria news es un medio independiente diseñado para tener las noticias mas importantes y actuales sobre la minería en México y en el mundo.</p>


    </footer>
  )
}
