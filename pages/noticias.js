import Layout from "@/components/layout";
import styles from '@/styles/gridEventos.module.css';
import Post from "@/components/noticia";
import axios from "axios";
import dayjs from 'dayjs';

export default function Noticias({posts}) {

  const postsPrincipales = [...posts].sort((a, b) => {
    // Convertir las fechas a objetos dayjs
    const fechaA = dayjs(a.date);
    const fechaB = dayjs(b.date);
  
    // Ordenar de forma descendente (de la más reciente a la más antigua)
    return fechaB - fechaA;
  });

  return (
    <>
    <Layout
        title={'Noticias'}
        description={'Mineria news, noticias de mineria, noticias geologia, geofisica, ciencias de la tierra, metalurgia'}
    >

    <main>
      <h1>Ultimas Noticias</h1>
      <div className={styles.grid}>
      {postsPrincipales.map(post => (
              <Post 
                key={post.id}
                post={post.acf}
                id={post.slug}
                date={post.date}
                />
          ))}
      </div>
    </main>

    </Layout>
  </>
  )
}


export async function getStaticProps() { 
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/noticia`);
    const posts = await response.data;
    
    return{
        props: {
            posts
        },
        revalidate: 10,
    }
  }