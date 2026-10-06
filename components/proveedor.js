import Link from "next/link"
import styles from '@/styles/proveedores.module.css';
import { urlSegura } from "@/utils/helpers";

export default function Proveedor({proveedor}) {

    const { nombre, web, telefono, correo, direccion, logo } = proveedor;

    const enlace = urlSegura(web)
    const logoSeguro = urlSegura(logo)
    const estiloLogo = logoSeguro ? { backgroundImage: `url("${logoSeguro}")` } : undefined

  return (
        <div className={styles.proveedor}>
            {enlace ? (
                <Link href={enlace} target="_blank" rel="noopener noreferrer">
                    <div className={styles.imagen} style={estiloLogo}></div>
                </Link>
            ) : (
                <div className={styles.imagen} style={estiloLogo}></div>
            )}
            <div className={styles.contenido}>
                <p>Nombre:<br></br> <span> {nombre}</span></p>
                <p>Pagina Web:<br></br> {enlace ? (
                    <Link href={enlace} target="_blank" rel="noopener noreferrer"><span>{web}</span></Link>
                ) : (
                    <span>{web}</span>
                )}</p>
                <p>Teléfono:<br></br><span> {telefono}</span></p>
                <p>Correo:<br></br> <span> {correo ? <Link href={`mailto:${correo}`}> {correo} </Link> : null}</span></p>
                <p>Dirección:<br></br><span> {direccion}</span></p>
            </div>
        </div>
  )
}
