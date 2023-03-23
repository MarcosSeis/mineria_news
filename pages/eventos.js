import Layout from "@/components/layout";
import styles from '@/styles/eventos.module.css';
import Meses from "@/components/meses";


export default function Noticias({eventos}) {

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
 
  const respuesta = await fetch (`${process.env.API_URL}/eventos?populate=imagen`);
  const { data: eventos } = await respuesta.json();
  
  return{
      props: {
          eventos
      }
  }
}