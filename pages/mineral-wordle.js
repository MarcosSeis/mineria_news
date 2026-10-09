import Layout from '@/components/layout'
import MineralWordle from '@/components/mineralWordle'
import styles from '@/styles/mineralWordle.module.css'

export default function MineralWordlePage() {
  return (
    <Layout
      title={'Mineral Wordle'}
      description={'Mineral Wordle: adivina cada día el mineral o metal misterioso. El juego diario de Minería News.'}
    >
      <main className={styles.pagina}>
        <h1>⛏️ Mineral Wordle</h1>
        <MineralWordle />
      </main>
    </Layout>
  )
}
