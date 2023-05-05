import Image from "next/image";
import Link from "next/link";
import { formatearFecha } from "@/utils/helpers";
import styles from '@/styles/blog.module.css'
import { useEffect, useState } from "react";

export default function Proxevento({evento}) {

  const {titulo, imagen, detalles, ubicacion, pagina_evento, fecha_ini, fecha_fin} = evento 

  const fechaIni = fecha_ini.slice(0, 8);
  const fechaFin = fecha_fin.slice(0, 8);

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
    <>
        <div>
            <Image src={imageUrl} width={200} height={200} alt={`Imagen blog ${titulo}`} />     
        <div className={styles.contenido}>
            <Link href={pagina_evento}
                    className={styles.enlace_titulo}
                    target="_blank"
                    >
            <h3 >{titulo}</h3>
            </Link>

            <p className={styles.fecha}>{formatearFecha(`${fechaIni.slice(0, 4)}-${fechaIni.slice(4, 6)}-${fechaIni.slice(6, 8)}`)} - {formatearFecha(`${fechaFin.slice(0, 4)}-${fechaFin.slice(4, 6)}-${fechaFin.slice(6, 8)}`)}</p>
            <p className={styles.fecha}>Ubicación: {ubicacion}</p>
            <p className={styles.resumen}>{detalles}</p>

        </div>
        </div>
   
    </>
  )
}
