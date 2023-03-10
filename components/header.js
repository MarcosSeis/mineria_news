import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/header.module.css"
import logo from "@/public/img/logo.jpg"
import LinksNav from "./linksNav";

export default function Header() {
  
    const [navMenu, setNavMenu] = useState(false);

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
                <div>
                    <h1>Mineria News</h1>
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
       


        <div>
            <div className={styles.imagen}>
                <Link href="/">
                    <Image src={logo.src} width={100} height={40} alt='Logo de mineria news'/>
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
