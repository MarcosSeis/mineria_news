import Head from 'next/head'
import LaVoladura from '@/components/voladura/laVoladura'
import { SITE_NAME, urlPublica } from '@/lib/config'
import { RUTA_JUEGO } from '@/lib/voladura/compartir'

const titulo = `${SITE_NAME} - La Voladura`
const imagen = urlPublica('/og/la-voladura.png')
const direccion = urlPublica(RUTA_JUEGO)
const descripcion = 'La Voladura: diseña cada día la mejor voladura en un juego pixel art. ¿Podrás sacar 100? El juego diario de Minería News.'

export default function LaVoladuraPage() {
  return (
    <>
      <Head>
        <title>{titulo}</title>
        <meta name="description" content={descripcion} />
        <meta property="og:title" content={titulo} />
        <meta property="og:description" content={descripcion} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={direccion} />
        <meta property="og:image" content={imagen} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="La Voladura: frente de túnel en pixel art con la voladura en curso" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={imagen} />
      </Head>
      <LaVoladura />
    </>
  )
}
