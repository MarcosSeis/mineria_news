import { useEffect, useState } from "react";
import Link from "next/link"
import styles from '@/styles/proveedores.module.css';

export default function Proveedor({proveedor}) {

    const { nombre, web, telefono, correo, direccion, logo } = proveedor;

    const back = `url(${logo})`

  return (
        <div className={styles.proveedor}>
            <Link href={web} target="_blank">
                <div className={styles.imagen} style={{backgroundImage: back}}>
                </div>
            </Link>
            <div className={styles.contenido}>
                <p>Nombre:<br></br> <span> {nombre}</span></p>
                <p>Pagina Web:<br></br> <Link href={web} target="_blank"><span>{web}</span></Link></p>
                <p>Teléfono:<br></br><span> {telefono}</span></p>
                <p>Correo:<br></br> <span> <Link href={`mailto:${correo}`}> {correo} </Link></span></p>
                <p>Dirección:<br></br><span> {direccion}</span></p>
            </div>
        </div> 
  )
}
