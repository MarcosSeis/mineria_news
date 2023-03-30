import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/header.module.css"
import LinksNav from "./linksNav";

export default function Header() {
  
    const [navMenu, setNavMenu] = useState(false);
    const hoy = new Date().toLocaleDateString("es-Es", {timeZone: 'UTC', year: "numeric", month: "short", day: "numeric"});
    const hora = new Date().toLocaleTimeString("es-Es", { hour: "2-digit", minute: "2-digit" });

  return (
    <header className={styles.header}>
        <div className={styles.menu_mobil}>
            <div className={styles.hamburger}>
                <div className={styles.hamburger_img}
                    onClick={ () => setNavMenu(!navMenu)}>
                        <svg viewBox="0 0 100 60" width="40" height="40">
                            <rect  width="100" height="6"></rect>
                            <rect y="20" width="80" height="6"></rect>
                            <rect y="40" width="100" height="6"></rect>
                        </svg>
                </div>

                <div className={styles.horas}>
                    <p> {hoy} | Actualizado {hora} CS</p>
                    <h1>Minería News</h1>
                </div>
            </div>
            <div className={navMenu ? styles.nav_menu: styles.nav_menu_close}>
                <nav>
                    <ul>
                        <LinksNav />
                    </ul>
                    <ul className={styles.nav_footer}>
                        <li>Contacto: info@minerianews.com</li>
                        <li>Diseñado por Marcos</li>
                    </ul>
                </nav>
            </div>
        </div>
        <div className={`${styles.horas} contenedor`}>
        <p className={styles.ocultar_movil}> {hoy} | Actualizado {hora} CST</p>
            <div className={styles.imagen}>
                <Link href="/">
                    <h1>Minería News</h1>
                    <p>el portal lider de minería</p>
                </Link>
            </div>
        </div>

    <div className={`contenedor ${styles.barra}`}>
        <nav className={styles.navegacion}>
        <LinksNav />
        </nav>
    </div>
   
</header>

  )
}
