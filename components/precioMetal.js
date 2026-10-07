import styles from '@/styles/metales.module.css'
import { formatearPrecio } from '@/lib/metales'

export default function PrecioMetal({ metal }) {
  const { nombre, symbol, precio, unidad } = metal

  return (
    <div className={styles.tarjeta}>
        <p className={styles.simbolo}>{symbol}</p>
        <h3>{nombre}</h3>
        <p className={styles.precio}>{formatearPrecio(precio)}</p>
        <p className={styles.unidad}>{unidad}</p>
    </div>
  )
}
