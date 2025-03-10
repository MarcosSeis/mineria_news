import styles from "@/styles/footer.module.css"

export default function Footer() {
  return (
    <footer className={`contenedor ${styles.footer}`}>
      <div className={styles.redes}>

        <div>
          <h1>© MINERÍA NEWS</h1>
        </div>

        <div className={styles.redes_iconos}>
        
        </div>

      </div>
  
      <h3>Contacto: infominerianews@gmail.com</h3>
      <p>Mineria news es un medio independiente diseñado para tener las noticias mas importantes y actuales sobre la minería en México y en el mundo.</p>


    </footer>
  )
}
