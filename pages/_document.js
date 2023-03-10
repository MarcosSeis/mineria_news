import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
    <Head>
      <meta name="description" content="Mineria news- Noticias sobre mineria, geologia, ciencias de la tierra, metalurgia" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap" rel="stylesheet" />
      <link rel='stylsheet' href='https://necolas.github.io/normalize.css/8.0.1/normalize.css' />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
  )
}
