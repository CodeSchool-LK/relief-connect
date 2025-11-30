import type { AppProps } from 'next/app'
import Head from 'next/head'
import { appWithTranslation } from 'next-i18next'
import { AuthProvider } from '../contexts/AuthContext'
import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import { IntroLoader } from '../components/IntroLoader'
import { useState, useEffect } from 'react'

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <AuthProvider>
        <IntroLoader />

        {/* hide page behind loader to prevent flash */}
        <div className={pageHidden ? 'page-hidden' : ''}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </>
  )
}

export default appWithTranslation(MyApp)
