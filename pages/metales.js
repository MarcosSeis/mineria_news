import { useRouter } from "next/router";
import Layout from "@/components/layout";
import PreciosMetales from "@/components/preciosMetales";
import GraficaMetal from "@/components/graficaMetal";
import styles from '@/styles/metales.module.css';
import { leerMetalesConHistorico } from "@/lib/metales";

export default function Metales({ metales }) {
  const { query } = useRouter()
  const inicial = query.metal

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
            <GraficaMetal key={inicial} metales={metales} inicial={inicial} />
          </>
        : <p className={styles.vacio}>No pudimos cargar los precios en este momento. Intenta de nuevo en unos minutos.</p>}
    </main>
    </Layout>
    </>
  )
}

export function getStaticProps() {
  return { props: { metales: leerMetalesConHistorico() } }
}
