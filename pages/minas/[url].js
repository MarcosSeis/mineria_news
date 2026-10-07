import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/layout";
import styles from '@/styles/minas.module.css'
import { leerMina, leerMinas } from "@/lib/minas";
import { urlSegura } from "@/utils/helpers";
import { separarMinerales } from "@/utils/minas";

const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function FichaMina({ mina }) {
  const { titulo, estado, empresa, minerales, tipo, estatus, descripcion, imagen, sitio_web, telefono, correo, direccion } = mina.acf
  const sitio = urlSegura(sitio_web)
  const enlaceTelefono = telefono ? `tel:${telefono.replace(/[^\d+]/g, '')}` : null
  const enlaceCorreo = CORREO_REGEX.test(correo ?? '') ? `mailto:${correo}` : null
  const hayContacto = Boolean(enlaceTelefono || enlaceCorreo || direccion)
  const datos = [
    ['Estado', estado],
    ['Empresa', empresa],
    ['Minerales', separarMinerales(minerales).join(', ')],
    ['Tipo de operación', tipo],
    ['Estatus', estatus]
  ].filter(([, valor]) => valor)

  return (
    <Layout
        title={titulo}
        description={descripcion?.slice(0, 160) || `${titulo}${estado ? `, ${estado}` : ''}: directorio de minas de Minería News`}
    >
      <article className={styles.ficha}>
        <h1>{titulo}</h1>
        {imagen && <Image src={imagen} width={800} height={400} alt={`Imagen de ${titulo}`} />}

        <dl className={styles.datos}>
          {datos.map(([etiqueta, valor]) => (
            <div key={etiqueta}>
              <dt>{etiqueta}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>

        {descripcion && <p className={styles.descripcion}>{descripcion}</p>}

        {hayContacto && (
          <section aria-labelledby="contacto">
            <h2 id="contacto" className={styles.subtitulo}>Contacto de la empresa</h2>
            <dl className={styles.datos}>
              {direccion && <div><dt>Dirección</dt><dd>{direccion}</dd></div>}
              {enlaceTelefono && <div><dt>Teléfono</dt><dd><a href={enlaceTelefono}>{telefono}</a></dd></div>}
              {enlaceCorreo && <div><dt>Correo</dt><dd><a href={enlaceCorreo}>{correo}</a></dd></div>}
            </dl>
          </section>
        )}

        <div className={styles.botones}>
          {sitio && (
            <Link href={sitio} target="_blank" rel="noopener noreferrer">
              <button>Sitio web</button>
            </Link>
          )}
          <Link href="/minas">
            <button>Volver al directorio</button>
          </Link>
        </div>
      </article>
    </Layout>
  )
}

export function getStaticPaths() {
  return { paths: leerMinas().map(m => ({ params: { url: m.slug } })), fallback: false }
}

export function getStaticProps({ params }) {
  const mina = leerMina(params.url)
  return mina ? { props: { mina } } : { notFound: true }
}
