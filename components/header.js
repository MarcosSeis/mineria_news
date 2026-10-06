import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/header.module.css"
import LinksNav from "./linksNav";
import imagen from "@/public/ads/banner_2025convencion.png"
import { CONTACT_EMAIL } from "@/lib/config";

const suscribirNada = () => () => {}

const fechaHoraActual = () => {
    const ahora = new Date();
    const hoy = ahora.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
    const hora = ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    return `${hoy} | Actualizado ${hora}`;
}

export default function Header() {

    const [navMenu, setNavMenu] = useState(false);
    // Vacío en el servidor y fecha real en el cliente: evita el desajuste de hidratación
    const fechaHora = useSyncExternalStore(suscribirNada, fechaHoraActual, () => '');

  return (
    <>
    <header className={styles.header}>
        <div className={styles.menu_mobil}>
            <div className={styles.hamburger}>
                <button
                    type="button"
                    className={styles.hamburger_img}
                    aria-label="Abrir menú"
                    aria-expanded={navMenu}
                    onClick={ () => setNavMenu(!navMenu)}>
                        <svg viewBox="0 0 100 60" width="40" height="40" aria-hidden="true">
                            <rect  width="100" height="6"></rect>
                            <rect y="20" width="80" height="6"></rect>
                            <rect y="40" width="100" height="6"></rect>
                        </svg>
                </button>

                <div className={styles.horas}>
                    <p>{fechaHora}</p>
                    <p className={styles.titulo_movil}>Minería News</p>
                </div>
            </div>
            <div className={navMenu ? styles.nav_menu: styles.nav_menu_close}>
                <nav>
                    <ul>
                        <LinksNav />
                    </ul>
                    <ul className={styles.nav_footer}>
                        <li>Contacto: {CONTACT_EMAIL}</li>
                        <li>Diseñado por Marcos</li>
                    </ul>
                </nav>
            </div>
        </div>
        <div className={`${styles.horas} contenedor`}>
        <p className={styles.ocultar_movil}>{fechaHora}</p>
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
    <div className={`contenedor`}>
        <div className={styles.banner}>
            <Link href="https://convencionmineramexico.mx/" target="_blank" rel="noopener noreferrer">
                <Image
                    src={imagen}
                    width={600}
                    height={200}
                    priority
                    alt="Convención Minera Acapulco 23 al 27 de octubre" />
            </Link>
        </div>
    </div>
    </>
  )
}
