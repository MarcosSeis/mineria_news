import Image from "next/image";
import Link from "next/link";
import { formatearFecha } from "@/utils/helpers";
import styles from '@/styles/blog.module.css'


export default function Post({post}) {

    const { contenido, imagen, titulo, url, publishedAt } = post;

  return (
    <article>
            <Link href={`/noticias/${url}`}
                className={styles.enlace_titulo}
                >
                 <Image src={imagen.data.attributes.url}
                        width={600}
                        height={400}
                        alt={`Imagen ${titulo}`}
                        fill
                        sizes="(max-width: 768px) 100vw,
                                (max-width: 1200px) 50vw,
                                33vw" />
            </Link>
       

        <div className={styles.contenido}>
            <Link href={`/noticias/${url}`}
                className={styles.enlace_titulo}
                >
                <h3 >{titulo}</h3>
            </Link>
            <p className={styles.fecha}>{formatearFecha(publishedAt)}</p>
            <p className={styles.resumen}>{contenido}</p>
        </div>
    </article>
  )
}