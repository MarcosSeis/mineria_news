import Layout from "@/components/layout";
import Link from "next/link";
import styles from '@/styles/jobs.module.css'

export default function Job({job}) {

    const {titulo, requisitos, fecha, sueldo, empresa, ubicacion, link } = job[0].attributes

    const hoy = new Date();
    const fecha_publicacion = new Date(fecha);
    const day_as_milliseconds = 86400000;
    const diff_mill = hoy - fecha_publicacion;
    const dif_days = Math.floor(diff_mill / day_as_milliseconds)


  return (
    <Layout
        title={`${titulo}`}
        >
        <article className={`${styles.post} ${styles['mt-3']}`}>
            <div className={styles.jobs}>
                <p>Hace {dif_days} {dif_days > 1 ? 'días': 'dia'}</p>
                <h3>{titulo}</h3>
                <p>{sueldo}</p>
                <p></p>
                <p className={styles.empresa}>{empresa}</p>
                <p className={styles.requisitos}>{requisitos}</p> 
                <p>Ubicacion: {ubicacion}</p>

                <div className={styles.button}>
                    <Link href={link} target="_blank">
                    <button>Ir a Oferta</button>
                    </Link>
                    <Link href="/trabajos">
                    <button>Volver a ofertas</button>
                    </Link>
                </div>    
            </div>
        </article>
    </Layout>
  )
}



export async function getServerSideProps({query: {url}}) { 
    
    const respuesta = await fetch (`${process.env.API_URL}/jobs?filters[url]=${url}&populate=imagen`);
    const { data: job } = await respuesta.json();

    return{
        props: {
            job
        }
    }}