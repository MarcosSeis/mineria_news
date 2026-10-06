import Link from "next/link";

const enlaces = [
    { href: '/', texto: 'Inicio' },
    { href: '/nosotros', texto: 'Nosotros' },
    { href: '/noticias', texto: 'Noticias' },
    { href: '/eventos', texto: 'Eventos' },
    { href: '/proveedores', texto: 'Proveedores' },
    { href: '/trabajos', texto: 'Bolsa de trabajo' }
]

export default function LinksNav() {
  return (
    <>
        {enlaces.map(({ href, texto }) => (
            <Link key={href} href={href}>
                {texto}
            </Link>
        ))}
    </>
  )
}
