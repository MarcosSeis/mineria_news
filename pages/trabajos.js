import Layout from "@/components/layout";
import stylesgrid from '@/styles/gridEventos.module.css';
import Job from "@/components/job";
import axios from "axios";
import dayjs from 'dayjs';

export default function Trabajos({jobs}) {

  const orden_jobs = [...jobs].sort((a, b) => dayjs(b.date) - dayjs(a.date));
  

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
 
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/job`);
    const jobs = await response.data;
  
    return{
        props: {
            jobs
        },
        revalidate: 10,
    }
  }