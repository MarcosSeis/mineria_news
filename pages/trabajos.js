import Layout from "@/components/layout";
import stylesgrid from '@/styles/gridEventos.module.css';
import Job from "@/components/job";
import { fetchList } from "@/lib/api";
import { filtrarRecientes, ordenarPorFechaDesc } from "@/utils/helpers";

export default function Trabajos({jobs}) {

  const jobsRecientes = ordenarPorFechaDesc(filtrarRecientes(jobs))

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
      {jobsRecientes.map(job => (
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
    const jobs = await fetchList('job')

    return {
        props: { jobs },
        revalidate: 10,
    }
}
