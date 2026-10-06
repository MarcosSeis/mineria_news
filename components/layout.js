import Head from "next/head"
import Header from "./header"
import Footer from "./footer"
import { SITE_NAME } from "@/lib/config"

export default function Layout({children, title = '', description = ''}) {
  const fullTitle = title ? `${SITE_NAME} - ${title}` : SITE_NAME

  return (
    <>
        <Head>
          <title>{fullTitle}</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={fullTitle} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="website" />
        </Head>

        <Header />
        {children}
        <Footer />
    </>
  )
}
