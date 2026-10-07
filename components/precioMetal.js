import Link from "next/link";
import styles from '@/styles/metales.module.css'
import { formatearPrecio } from '@/lib/metales'

export default function PrecioMetal({ metal }) {
  const { nombre, symbol, precio, unidad } = metal

  return (
    <Link
        href={`/metales?metal=${symbol}#grafica`}
        className={styles.tarjeta}
        aria-label={`Ver gráfica de ${nombre}`}>
        <p className={styles.simbolo}>{symbol}</p>
        <h3>{nombre}</h3>
        <p className={styles.precio}>{formatearPrecio(precio)}</p>
        <p className={styles.unidad}>{unidad}</p>
    </Link>
  )
}
