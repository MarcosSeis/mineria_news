import Layout from "@/components/layout";
import PreciosMetales from "@/components/preciosMetales";
import GraficaMetal from "@/components/graficaMetal";
import styles from '@/styles/metales.module.css';
import { fetchPrecios } from "@/lib/metales";
import { fetchHistorico } from "@/lib/historico";

export default function Metales({ metales, historico = {} }) {
  return (
    <>
    <Layout
        title={'Precios de metales'}
        description={'Precios de metales: oro, plata, cobre, platino y paladio en tiempo casi real'}
    >
    <main>
      <h1>Precios de metales</h1>
      {metales.length
        ? <>
            <PreciosMetales metales={metales} />
            <GraficaMetal historico={historico} />
          </>
        : <p className={styles.vacio}>No pudimos cargar los precios en este momento. Intenta de nuevo en unos minutos.</p>}
    </main>
    </Layout>
    </>
  )
}

export async function getStaticProps() {
  const [metales, historico] = await Promise.all([fetchPrecios(), fetchHistorico()])
  return {
    props: { metales, historico },
    revalidate: 300,
  }
}
