import styles from '@/styles/metales.module.css'
import PrecioMetal from './precioMetal'

export default function PreciosMetales({ metales }) {
  return (
    <>
        <div className={styles.grid}>
            {metales.map(metal => (
                <PrecioMetal key={metal.symbol} metal={metal} />
            ))}
        </div>
        <p className={styles.fuente}>
            Precios spot referenciales en dólares, actualizados cada pocos minutos. Fuente: gold-api.com
        </p>
    </>
  )
}
