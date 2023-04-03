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
            href="/nosotros">
            Nosotros
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
            href="/proveedores">
            Proveedores
        </Link>
        <Link 
            href="/trabajos">
            Bolsa de trabajo
        </Link>
      
    </>
  )
}

