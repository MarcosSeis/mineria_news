import Layout from "@/components/layout";
import styles from '@/styles/eventos.module.css';
import Meses from "@/components/meses";
import axios from 'axios';



export default function Eventos({eventos}) {

    const year =  new Date().getFullYear();

  return (
    <>
    <Layout
        title={'Eventos'}
        description={'Mineria news, Eventos de mineria, Eventos geologia, geofisica, ciencias de la tierra, metalurgia'}
    >

    <main>
     <h1 className={styles.encabezado}> Próximos Eventos {year} </h1>
        <Meses 
          year={year}
          eventos={eventos}
          />
    </main>

    </Layout>
  </>
  )
}



export async function getStaticProps() {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts?acf_format=standard&categories=2`);
  const eventos = await response.data;
  
  return {
    props: {
      eventos
    }
  }
}
