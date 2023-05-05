import Layout from "@/components/layout";
import Link from "next/link";
import styles from '@/styles/jobs.module.css'
import axios from "axios";

export default function Job({job}) {

    const {titulo, requisitos, fecha, sueldo, empresa, ubicacion, link } = job[0].acf


  const fecha_pub = fecha.slice(0, 8);
  const fecha_form = `${fecha_pub.slice(0, 4)}-${fecha_pub.slice(4, 6)}-${fecha_pub.slice(6, 8)}`


    const hoy = new Date();
    const fecha_publicacion = new Date(fecha_form);
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
    
    
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts?slug=${url}&categories=4`);
    const job = await response.data;
    

    return{
        props: {
            job
        }
    }}