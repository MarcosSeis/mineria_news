import Head from 'next/head'
import MineralWordle from '@/components/mineralWordle'
import { SITE_NAME } from '@/lib/config'

const titulo = `${SITE_NAME} - Mineral Wordle`
const descripcion = 'Mineral Wordle: adivina cada día el mineral o metal misterioso. El juego diario de Minería News.'

export default function MineralWordlePage() {
  return (
    <>
      <Head>
        <title>{titulo}</title>
        <meta name="description" content={descripcion} />
        <meta property="og:title" content={titulo} />
        <meta property="og:description" content={descripcion} />
        <meta property="og:type" content="website" />
      </Head>
      <MineralWordle />
    </>
  )
}
