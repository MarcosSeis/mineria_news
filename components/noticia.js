import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatearFecha } from "@/utils/helpers";
import styles from '@/styles/blog.module.css'


export default function Post({post, id, date}) {

    const { contenido, imagen, titulo } = post;

    const [imageUrl, setImageUrl] = useState('');

    
    useEffect(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${imagen}`)
          .then(response => response.json())
          .then(data => {
            const url = data.source_url;
            setImageUrl(url);
          })
        }, [imagen]);

  return (
    <article>
            <Link href={`/noticias/${id}`}
                className={styles.enlace_titulo}
                >
                 <Image src={imageUrl}
                        width={600}
                        height={400}
                        alt={`Imagen ${titulo}`}
                         />
            </Link>
       

        <div className={styles.contenido}>
            <Link href={`/noticias/${id}`}
                className={styles.enlace_titulo}
                >
                <h3 >{titulo}</h3>
            </Link>
            <p className={styles.fecha}>{formatearFecha(date)}</p>
            <p className={styles.resumen}>{contenido}</p>
        </div>
    </article>
  )
}