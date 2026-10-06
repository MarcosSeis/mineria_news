import Layout from "@/components/layout";
import styles from '@/styles/proveedores.module.css';
import Proveedor from "@/components/proveedor";
import { fetchList } from "@/lib/api";
import { ordenarPorFechaDesc } from "@/utils/helpers";

export default function Proveedores({proveedores}) {

  const provOrdenados = ordenarPorFechaDesc(proveedores)

  return (
    <>
    <Layout
        title={'Proveedores'}
        description={'Proveedores de mineria, proveedores geologia, proveedores geofisica, ciencias de la tierra, proveedores metalurgia'}
    >

    <main>
      <h1>Proveedores Premium</h1>
      <div className={styles.grid}>
        {provOrdenados.map(proveedor => (
            <Proveedor
              key={proveedor.id}
              proveedor={proveedor.acf}
            />
          ))
        }
      </div>
    </main>

    </Layout>
  </>
  )
}

export async function getStaticProps() {
    const proveedores = await fetchList('proveedor')

    return {
        props: { proveedores },
        revalidate: 10,
    }
}
