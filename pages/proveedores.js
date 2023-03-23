import Layout from "@/components/layout";
import styles from '@/styles/grid.module.css';

export default function Noticias({posts}) {
  return (
    <>
    <Layout
        title={'Proveedores'}
        description={'Proveedores de mineria, proveedores geologia, proveedores geofisica, ciencias de la tierra, proveedores metalurgia'}
    >

    <main>
      <div className={styles.grid}>
        <h1>Tu empresa aquí</h1>
      </div>
    </main>

    </Layout>
  </>
  )
}


export async function getStaticProps() { 
 
    const respuesta = await fetch (`${process.env.API_URL}/posts?populate=imagen`);
    const { data: posts } = await respuesta.json();
  
    return{
        props: {
            posts
        }
    }
  }