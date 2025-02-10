import Layout from "@/components/layout";
import styles from '@/styles/proveedores.module.css';
import axios from "axios";
import Proveedor from "@/components/proveedor";
import dayjs from 'dayjs';

export default function Proveedores({proveedores}) {

  const provOrdenados = [...proveedores].sort((a, b) => dayjs(b.date) - dayjs(a.date));
 
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
 
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/proveedor`);
    const proveedores = await response.data;
  
    return{
        props: {
            proveedores
        },
        revalidate: 10,
    }
  }