import Head from "next/head"
import Header from "./header"
import Footer from "./footer"

export default function Layout({children, title = '', description = ''}) {
  return (
    <>
        <Head>
        <title>{`Mineria News - ${title}`}</title>
        <meta name={description}></meta>
        </Head>

        <Header />
        {children}
        <Footer />

    </>
  )
}
