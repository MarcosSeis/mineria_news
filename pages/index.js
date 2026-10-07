import Layout from "@/components/layout";
import Link from "next/link";
import stylesNoticias from '@/styles/grid.module.css';
import stylesIndex from '@/styles/principal.module.css';
import stylesgrid from '@/styles/gridEventos.module.css';
import styleAnuncios from '@/styles/anuncio.module.css';
import Post from "@/components/noticia";
import Job from "@/components/job";
import Proxevento from "@/components/proxevento";
import Anuncio from "@/components/anuncio";
import PreciosMetales from "@/components/preciosMetales";
import { anuncios } from "@/data/anuncios";
import { fetchList } from "@/lib/api";
import { fetchPrecios } from "@/lib/metales";
import { eventosProximos, filtrarRecientes, ordenarPorFechaDesc } from "@/utils/helpers";

export default function Home({jobs, posts, eventos, metales = []}) {

  const postsOrdenados = ordenarPorFechaDesc(posts)
  const postsPrincipales = postsOrdenados.slice(0, 3)
  const postsMas = postsOrdenados.slice(3, 6)
  const ultimosJobs = ordenarPorFechaDesc(filtrarRecientes(jobs)).slice(0, 3)
  const proxEventos = eventosProximos(eventos, 3)

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
                      post={post.acf}
                      id={post.slug}
                      date={post.date}
                      />
                ))}
            </div>
          </section>

          {metales.length > 0 && (
            <section className={`${stylesIndex.trabajos} contenedor`}>
              <h2 className={stylesIndex.centrar}>Precios de metales</h2>
              <PreciosMetales metales={metales} />
              <div className={stylesIndex.centrar_boton}>
                <Link href="/metales">
                  <button>Ver más precios</button>
                </Link>
              </div>
            </section>
          )}

          <section className={`${stylesIndex.trabajos} contenedor`}>
            <h2 className={stylesIndex.centrar}> Últimos trabajos </h2>
              <div className={stylesgrid.grid}>
              {ultimosJobs.map(job => (
                      <Job
                        key={job.id}
                        job={job.acf}
                        id={job.slug}
                        />
                  ))}
              </div>

                <div className={stylesIndex.centrar_boton}>
                    <Link href="/trabajos">
                    <button>Ver más trabajos</button>
                    </Link>
                </div>

          </section>

          <section className={`${styleAnuncios.anuncios} contenedor`}>
            {anuncios.map(anuncio => (
              <Anuncio
                key={anuncio.link}
                ruta={anuncio.ruta}
                link={anuncio.link}
                alt={anuncio.alt}
                fondo={anuncio.fondo}
                />
            ))}
          </section>

          <section className={`${stylesIndex.trabajos} contenedor`}>
            <h2 className={stylesIndex.centrar}>Más Noticias</h2>
            <div className={stylesgrid.grid}>
            {postsMas.map(post => (
                    <Post
                      key={post.id}
                      post={post.acf}
                      id={post.slug}
                      date={post.date}
                      />
                ))}
            </div>
          </section>

          <section className={`${stylesIndex.trabajos} contenedor`}>
            <h2 className={stylesIndex.centrar}>Próximos Eventos</h2>
            <div className={stylesgrid.grid}>
            {proxEventos.map(evento => (
                    <Proxevento
                      key={evento.id}
                      evento={evento.acf}
                      />
                ))}
            </div>
          </section>

        </Layout>
    </>
  )
}

export async function getStaticProps() {
  const [jobs, posts, eventos, metales] = await Promise.all([
    fetchList('job'),
    fetchList('noticia'),
    fetchList('evento'),
    fetchPrecios()
  ])

  return {
      props: { jobs, posts, eventos, metales },
      revalidate: 10,
  }
}
