import Image from "next/image";
import Link from "next/link";
import { formatearFecha } from "@/utils/helpers";
import styles from '@/styles/blog.module.css'
import { useEffect, useState } from "react";

export default function Proxevento({evento}) {

  const {titulo, imagen, detalles, ubicacion, pagina_evento, fecha_ini, fecha_fin} = evento 


  const [imageUrl, setImageUrl] = useState('');
    
  useEffect(() => {
    setImageUrl(imagen)
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

            <p className={styles.fecha}>{fecha_ini} - {fecha_fin}</p>
            <p className={styles.fecha}>Ubicación: {ubicacion}</p>
            <p className={styles.resumen}>{detalles}</p>

        </div>
        </div>
   
    </>
  )
}
