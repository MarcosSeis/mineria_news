import Layout from "@/components/layout";
import stylesgrid from '@/styles/gridEventos.module.css';
import Job from "@/components/job";
import axios from "axios";

export default function Trabajos({jobs}) {

  const orden_jobs = [... jobs].sort((a, b) => new Date(b.date) - new Date(a.date));
  

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
                job={job.acf}
                id={job.slug}
                />
          ))}
        
      </div>

    </main>

    </Layout>
  </>
  )
}


export async function getStaticProps() { 
 
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts?acf_format=standard&categories=4&orderby=date`);
    const jobs = await response.data;
  
    return{
        props: {
            jobs
        },
        revalidate: 10,
    }
  }