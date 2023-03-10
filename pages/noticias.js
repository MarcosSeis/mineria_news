import Layout from "@/components/layout";
import styles from '@/styles/grid.module.css';
import Post from "@/components/noticia";

export default function Noticias({posts}) {
  return (
    <>
    <Layout
        title={'Noticias'}
        description={'Mineria news, noticias de mineria, noticias geologia, geofisica, ciencias de la tierra, metalurgia'}
    >

    <main>
      <div className={styles.grid}>
      {posts.map(post => (
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
 
    const respuesta = await fetch (`${process.env.API_URL}/posts?populate=imagen`);
    const { data: posts } = await respuesta.json();
  
    return{
        props: {
            posts
        }
    }
  }