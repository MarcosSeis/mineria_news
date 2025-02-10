import Layout from "@/components/layout";
import styles from '@/styles/gridEventos.module.css';
import Post from "@/components/noticia";
import axios from "axios";

export default function Noticias({posts}) {

  const postsPrincipales = [... posts].sort((a, b) => new Date(b.date) - new Date(a.date))

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