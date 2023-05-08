import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatearFecha } from "@/utils/helpers";
import styles from '@/styles/blog.module.css'


export default function Post({post, id, date}) {

    const { contenido, imagen, titulo } = post;


  return (
    <article>
            <Link href={`/noticias/${id}`}
                className={styles.enlace_titulo}
                >
                 <Image src={imagen}
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