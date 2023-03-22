import Link from "next/link";
import { useRouter } from "next/router";


export default function LinksNav() {
    const router = useRouter();
  return (
    <>
        <Link 
        href="/">
        Inicio
        </Link>
        <Link 
            href="/noticias">
            Noticias
        </Link>
        <Link 
            href="/eventos">
            Eventos
        </Link>
        <Link 
            href="/recursos">
            recursos
        </Link>
        <Link 
            href="/provedores">
            Provedores
        </Link>
        <Link 
            href="/bolsa">
            Bolsa de trabajo
        </Link>
        <Link 
            href="/investigacion">
            Investigación
        </Link>
    </>
  )
}

