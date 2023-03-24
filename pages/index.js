import Layout from "@/components/layout";
import Link from "next/link";
import stylesNoticias from '@/styles/grid.module.css';
import stylesIndex from '@/styles/principal.module.css';
import stylesgrid from '@/styles/gridEventos.module.css';
import Post from "@/components/noticia";
import Job from "@/components/job";
import Proxevento from "@/components/proxevento";

export default function Home({jobs, posts, eventos}) {

  const fecha_hoy = new Date()
  const pev = [...eventos].filter(evento => fecha_hoy < (new Date(evento.attributes.fecha_ini)))

  const postsPrincipales = [... posts].sort((a, b) => a.attributes.publishedAt < b.attributes.publishedAt).slice(0, 3)
  const orden_jobs = [... jobs].sort((a, b) => a.attributes.fecha < b.attributes.fecha ).slice(0, 3)
  const postsMas = [... posts].sort((a, b) => a.attributes.publishedAt < b.attributes.publishedAt ).slice(3, 6)
  const proxEventos = [... pev].sort((a, b) => a.attributes.fecha_ini > b.attributes.fecha_ini ).slice(0, 3)

  return (
    <>
       <Layout
        title={'Inicio'}
        description={'Mineria news, noticias de mineria, geologia, geofisica, ciencias de la tierra, metalurgia'}
        >
          <section className="contenedor">
            <h2 className={stylesIndex.centrar}>Principales noticias</h2>
            <div className={stylesNoticias.grid}>
            {postsPrincipales.map(post => (
                    <Post 
                      key={post.id}
                      post={post.attributes}
                      />
                ))}
            </div>
          </section>


          <section className={`${stylesIndex.trabajos} contenedor`}>
            <h2 className={stylesIndex.centrar}> Ultimos trabajos </h2>
              <div className={stylesgrid.grid}>
              {orden_jobs.map(job => (
                      <Job
                        key={job.id}
                        job={job.attributes}
                        />
                  ))}
              </div>
              
                <div className={stylesIndex.centrar_boton}> 
                    <Link href="/trabajos" target="_blank">
                    <button>Ver más trabajos</button>
                    </Link>
                </div>    
     
          </section>

          <section className={`${stylesIndex.trabajos} contenedor`}>
            <h2 className={stylesIndex.centrar}>Más Noticias</h2>
            <div className={stylesgrid.grid}>
            {postsMas.map(post => (
                    <Post 
                      key={post.id}
                      post={post.attributes}
                      />
                ))}
            </div>
          </section>

          <section className={`${stylesIndex.trabajos} contenedor`}>
            <h2 className={stylesIndex.centrar}>Proximos Eventos</h2>
            <div className={stylesgrid.grid}>
            {proxEventos.map(evento => (
                    <Proxevento 
                      key={evento.id}
                      evento={evento.attributes}
                      />
                ))}
            </div>
          </section>

          

        </Layout>
     
    </>
  )
}

export async function getStaticProps() {
  const urlJobs = `${process.env.API_URL}/jobs?populate=imagen`
  const urlPosts = `${process.env.API_URL}/posts?populate=imagen`
  const urlEventos = `${process.env.API_URL}/eventos?populate=imagen`


  const [ resJobs, resPosts, resEventos ] = await Promise.all([
    fetch(urlJobs),
    fetch(urlPosts),
    fetch(urlEventos)
  ])
  const [{ data: jobs }, {data: posts}, {data: eventos}] = await Promise.all([
      resJobs.json(),
      resPosts.json(),
      resEventos.json()
  ])

  return {
      props: {
          jobs,
          posts,
          eventos
      }
  }
}