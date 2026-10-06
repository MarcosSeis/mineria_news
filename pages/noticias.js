import Layout from "@/components/layout";
import styles from '@/styles/gridEventos.module.css';
import Post from "@/components/noticia";
import { fetchList } from "@/lib/api";
import useActualizacionAutomatica from "@/hooks/useActualizacionAutomatica";
import { ordenarPorFechaDesc } from "@/utils/helpers";

export default function Noticias({posts}) {

  useActualizacionAutomatica()

  const postsOrdenados = ordenarPorFechaDesc(posts)

  return (
    <>
    <Layout
        title={'Noticias'}
        description={'Mineria news, noticias de mineria, noticias geologia, geofisica, ciencias de la tierra, metalurgia'}
    >

    <main>
      <h1>Ultimas Noticias</h1>
      <div className={styles.grid}>
      {postsOrdenados.map(post => (
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
    const posts = await fetchList('noticia')

    return {
        props: { posts },
        revalidate: 10,
    }
}
