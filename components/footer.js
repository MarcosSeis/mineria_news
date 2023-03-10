import styles from "@/styles/footer.module.css"

export default function Footer() {
  return (
    <footer className={`contenedor ${styles.footer}`}>
      <div className={styles.redes}>

        <div>
          <h1>© MINERIA NEWS</h1>
        </div>

        <div className={styles.redes_iconos}>
          <a href="#">Fb</a>
          <a href="#">Ig</a>
          <a href="#">Tw</a>
        </div>

      </div>
  
      <h3>Contacto: info@minerinews.com</h3>
      <p>Mineria news es un medio independiente diseñado para tener las noticias mas importantes y actuales sobre la minera en México y en el mundo.</p>

    </footer>
  )
}
