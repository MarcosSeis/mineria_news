import axios from "axios";
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
import Subscribe from "@/components/subscribe";
import dayjs from 'dayjs';

export default function Home({jobs, posts, eventos}) {

  

  const fecha_hoy = dayjs()
  
  const pev = eventos.filter(evento => {
   
    const fecha_ini = dayjs(evento.acf.fecha_ini, 'YYYYMMDD');
  
    return fecha_ini.isAfter(fecha_hoy);
  });
  

  const postsPrincipales =  [... posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3)

  const orden_jobs = [... jobs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3)

  const postsMas = [... posts].sort((a, b) => new Date(b.date) - new Date(a.date) ).slice(3, 6)

   
  const proxEventos = pev
  .slice(0, 3) 
  .sort((a, b) => {
    // Parsear las fechas usando dayjs y el formato 'YYYYMMDD'
    const fechaA = dayjs(a.acf.fecha_ini, 'YYYYMMDD');
    const fechaB = dayjs(b.acf.fecha_ini, 'YYYYMMDD');

    // Comparar las fechas
    return fechaA - fechaB;
  });



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


          <section className={`${stylesIndex.trabajos} contenedor`}>
            <h2 className={stylesIndex.centrar}> Últimos trabajos </h2>
              <div className={stylesgrid.grid}>
              {orden_jobs.map(job => (
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
            <Anuncio
              ruta={'/img/proveedores/logo-0_0000_SEIMPAC.png'} 
              link={'https://seimpac.com/'}
              />
            <Anuncio
              ruta={'/img/proveedores/logo-0_0001_RADIOCOM.png'} 
              link={'http://www.radiocom.com.mx/'}
              fondo={true}
              />
            <Anuncio
              ruta={'/img/proveedores/logo-0_0002_MAQUINTRA.png'}
              link={'http://www.maquinariaytractores.com.mx/'}
              />
            <Anuncio
              ruta={'/img/proveedores/logo-0_0003_MAMIPA.png'}
              link={'https://www.mamipa.com/'}
              />
            <Anuncio
              ruta={'/img/proveedores/logo-0_0004_IEESA.png'}
              link={'http://ieeesa.mx/'}
              fondo={true}
              />
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

          <section className="contenedor_boletin">
            <Subscribe />
          </section>
          
          

        </Layout>
     
    </>
  )
}

export async function getStaticProps() {

  const urlJobs = `${process.env.NEXT_PUBLIC_API_URL}/job`
  const urlPosts = `${process.env.NEXT_PUBLIC_API_URL}/noticia`
  const urlEventos = `${process.env.NEXT_PUBLIC_API_URL}/evento`

  const [ resJobs, resPosts, resEventos ] = await Promise.all([
    axios.get(urlJobs),
    axios.get(urlPosts),
    axios.get(urlEventos)
  ])
  const [{ data: jobs }, {data: posts}, {data: eventos}] = await Promise.all([
      resJobs,
      resPosts,
      resEventos
  ])

  return {
      props: {
          jobs,
          posts,
          eventos
      },
      revalidate: 10,
  }
}