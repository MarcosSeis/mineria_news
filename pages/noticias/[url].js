import Image from "next/image";
import Layout from "@/components/layout";
import { formatearFecha } from "@/utils/helpers";
import styles from '@/styles/blog.module.css'
import axios from "axios";

export default function Post({post}) {

    const { titulo, contenido, imagen} = post[0]?.acf

  return (
    <Layout
        title={`${titulo}`}
        >
        <article className={`${styles.post} ${styles['mt-3']}`}>
            <Image src={imagen} width={1000} height={400} alt={`Imagen ${titulo}`} />

            <div className={styles.contenido}>
                <h3 >{titulo}</h3>
                <p className={styles.fecha}>{formatearFecha(post[0].date)}</p>
                <p className={styles.texto}>{contenido}</p>
            </div>
        </article>
    </Layout>
  )
}



export async function getServerSideProps({query: {url}}) { 
   
    
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/noticia?slug=${url}`);
    const post = await response.data;
    

    return{
        props: {
            post
        }
    }}