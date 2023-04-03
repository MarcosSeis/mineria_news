import Layout from "@/components/layout";
import styles from '@/styles/gridEventos.module.css';
import Post from "@/components/noticia";

export default function Noticias({posts}) {

  const postsPrincipales = [... posts].sort((a, b) => new Date(b.attributes.publishedAt) - new Date(a.attributes.publishedAt))

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
                post={post.attributes}
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

    const urlPosts = `${process.env.API_URL}/posts?populate=imagen&${query}`
 
    const respuesta = await fetch (urlPosts);
    const { data: posts } = await respuesta.json();
  
    return{
        props: {
            posts
        },
        revalidate: 10,
    }
  }