import Layout from "@/components/layout";
import styles from '@/styles/proveedores.module.css';
import Proveedor from "@/components/proveedor";

export default function Proveedores({proveedores}) {

  const provOrdenados = [... proveedores].sort((a, b) => new Date(b.attributes.publishedAt) - new Date(a.attributes.publishedAt))

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
              proveedor={proveedor.attributes}
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
 
    const respuesta = await fetch (`${process.env.API_URL}/proveedores?populate=logo`);
    const { data: proveedores } = await respuesta.json();
  
    return{
        props: {
            proveedores
        },
        revalidate: 10,
    }
  }