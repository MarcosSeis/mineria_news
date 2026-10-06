import Image from "next/image";
import Link from "next/link";
import styles from '@/styles/blog.module.css'
import { formatearFecha, urlSegura } from "@/utils/helpers";

export default function Proxevento({evento}) {

  const {titulo, imagen, detalles, ubicacion, pagina_evento, fecha_ini, fecha_fin} = evento
  const enlace = urlSegura(pagina_evento)

  return (
        <div>
            {imagen && <Image src={imagen} width={200} height={200} alt={`Imagen ${titulo}`} />}
            <div className={styles.contenido}>
                {enlace ? (
                    <Link href={enlace}
                        className={styles.enlace_titulo}
                        target="_blank"
                        rel="noopener noreferrer">
                        <h3>{titulo}</h3>
                    </Link>
                ) : (
                    <h3>{titulo}</h3>
                )}

                <p className={styles.fecha}>{formatearFecha(fecha_ini)} - {formatearFecha(fecha_fin)}</p>
                <p className={styles.fecha}>Ubicación: {ubicacion}</p>
                <p className={styles.resumen}>{detalles}</p>
            </div>
        </div>
  )
}
