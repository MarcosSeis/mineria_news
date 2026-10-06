import Layout from "@/components/layout";
import Link from "next/link";
import styles from '@/styles/jobs.module.css'
import { fetchBySlug } from "@/lib/api";
import { diasDesde, textoHace, urlSegura } from "@/utils/helpers";

export default function Job({job}) {

    const {titulo, requisitos, fecha, sueldo, empresa, ubicacion, link } = job.acf

    const enlaceOferta = urlSegura(link)

  return (
    <Layout
        title={`${titulo}`}
        description={requisitos?.slice(0, 160)}
        >
        <article className={`${styles.post} ${styles['mt-3']}`}>
            <div className={styles.jobs}>
                <p>{textoHace(diasDesde(fecha))}</p>
                <h1>{titulo}</h1>
                <p>{sueldo}</p>
                <p className={styles.empresa}>{empresa}</p>
                <p className={styles.requisitos}>{requisitos}</p>
                <p>Ubicacion: {ubicacion}</p>

                <div className={styles.button}>
                    {enlaceOferta && (
                        <Link href={enlaceOferta} target="_blank" rel="noopener noreferrer">
                        <button>Ir a Oferta</button>
                        </Link>
                    )}
                    <Link href="/trabajos">
                    <button>Volver a ofertas</button>
                    </Link>
                </div>
            </div>
        </article>
    </Layout>
  )
}

export async function getStaticPaths() {
    return { paths: [], fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
    const job = await fetchBySlug('job', params.url)

    if (!job?.acf) {
        return { notFound: true, revalidate: 10 }
    }

    return {
        props: { job },
        revalidate: 60,
    }
}
