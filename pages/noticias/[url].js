import Image from "next/image";
import Layout from "@/components/layout";
import { formatearFecha, urlSegura } from "@/utils/helpers";
import styles from '@/styles/blog.module.css'
import { fetchBySlug } from "@/lib/api";

export default function Post({post}) {

    const { titulo, contenido, imagen, resumen, fuente, fuente_url, credito_imagen } = post.acf
    const enlaceFuente = urlSegura(fuente_url)

  return (
    <Layout
        title={`${titulo}`}
        description={(resumen || contenido)?.slice(0, 160)}
        >
        <article className={`${styles.post} ${styles['mt-3']}`}>
        {imagen && (<Image src={imagen} width={1000} height={400} alt={`Imagen ${titulo}`} />)}
        {imagen && credito_imagen && (<p className={styles.credito}>{credito_imagen}</p>)}

            <div className={styles.contenido}>
                <h1>{titulo}</h1>
                <p className={styles.fecha}>{formatearFecha(post.date)}</p>
                <p className={styles.texto}>{contenido}</p>
                {fuente && (
                    <p className={styles.fuente}>
                        Fuente: {enlaceFuente
                            ? <a href={enlaceFuente} target="_blank" rel="noopener noreferrer nofollow">{fuente}</a>
                            : fuente}
                    </p>
                )}
            </div>
        </article>
    </Layout>
  )
}

export async function getStaticPaths() {
    return { paths: [], fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
    const post = await fetchBySlug('noticia', params.url)

    if (!post?.acf) {
        return { notFound: true, revalidate: 10 }
    }

    return {
        props: { post },
        revalidate: 60,
    }
}
