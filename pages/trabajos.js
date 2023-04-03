import Layout from "@/components/layout";
import stylesgrid from '@/styles/gridEventos.module.css';
import Job from "@/components/job";

export default function Trabajos({jobs}) {

  const orden_jobs = [... jobs].sort((a, b) => new Date(b.attributes.fecha) - new Date(a.attributes.fecha));
  

  return (
    <>
    <Layout
        title={'Bolsa de trabajo'}
        description={'Bolsa de trabajo para mineria, geologia, geofisica, ciencias de la tierra, metalurgia'}
    >

    <main>

      <h1>Bolsa de Trabajo</h1>
      <h2>Ultimos 30 días</h2>

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
  const qs = require('qs');
  const query = qs.stringify({
      sort: ['publishedAt:desc'],
      pagination: {
        pageSize: 24,
        page: 1,
      },
      publicationState: 'live',
    }, {
      encodeValuesOnly: true, // prettify URL
    });

    const urlJobs = `${process.env.API_URL}/jobs?${query}`
 
    const respuesta = await fetch (urlJobs);
    const { data: jobs } = await respuesta.json();
  
    return{
        props: {
            jobs
        },
        revalidate: 10,
    }
  }