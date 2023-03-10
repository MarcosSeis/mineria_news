import Link from "next/link";
import { useRouter } from "next/router";
import styles from "@/styles/header.module.css"

export default function LinksNav() {
    const router = useRouter();
  return (
    <>
        <Link 
        href="/"
        className={router.pathname === '/' ? styles.active : ''}>
        Inicio
        </Link>
        <Link 
            href="/noticias"
            className={router.pathname === '/nosotros' ? styles.active : ''}>
            Noticias
        </Link>
        <Link 
            href="/articulos"
            className={router.pathname === '/tienda' ? styles.active : ''}>
            Eventos
        </Link>
        <Link 
            href="/blog"
            className={router.pathname === '/blog' ? styles.active : ''}>
            Metales
        </Link>
    </>
  )
}

