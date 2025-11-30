import type { AppProps } from 'next/app'
import Head from 'next/head'
import { appWithTranslation } from 'next-i18next'
import { DM_Sans, Inter } from 'next/font/google'
import { AuthProvider } from '../contexts/AuthContext'
import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import { IntroLoader } from '../components/IntroLoader'
import { useState, useEffect } from 'react'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

function MyApp({ Component, pageProps }: AppProps) {
  const [pageHidden, setPageHidden] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPageHidden(false)
    }, 100)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <>
      <Head>
        <title>RebuildSL</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </Head>

      <AuthProvider>
        <IntroLoader />

        {/* hide page behind loader to prevent flash */}
        <div className={`${dmSans.variable} ${inter.variable} ${pageHidden ? 'page-hidden' : ''}`}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </>
  )
}

export default appWithTranslation(MyApp)
