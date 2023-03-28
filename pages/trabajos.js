import Layout from "@/components/layout";
import stylesgrid from '@/styles/gridEventos.module.css';
import Job from "@/components/job";

export default function Noticias({jobs}) {

  const orden_jobs = [... jobs].sort((a, b) => new Date(b.attributes.fecha) - new Date(a.attributes.fecha));

  console.log(jobs)

  return (
    <>
    <Layout
        title={'Bolsa de trabajo'}
        description={'Bolsa de trabajo para mineria, geologia, geofisica, ciencias de la tierra, metalurgia'}
    >

    <main>

      <h1>Bolsa de Trabajo</h1>

      <div className={stylesgrid.grid}>
      {orden_jobs.map(job => (
              <Job
                key={job.id}
                job={job.attributes}
                />
          ))}
        
      </div>

    </main>

    </Layout>
  </>
  )
}


export async function getStaticProps() { 
 
    const respuesta = await fetch (`${process.env.API_URL}/jobs?populate=imagen`);
    const { data: jobs } = await respuesta.json();
  
    return{
        props: {
            jobs
        },
        revalidate: 10,
    }
  }