import Layout from "@/components/layout";
import styles from '@/styles/eventos.module.css';
import Meses from "@/components/meses";
import { fetchList } from "@/lib/api";

export default function Eventos({eventos}) {

    const year = new Date().getFullYear();

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
  const eventos = await fetchList('evento')

  return {
    props: { eventos },
    revalidate: 3600,
  }
}
