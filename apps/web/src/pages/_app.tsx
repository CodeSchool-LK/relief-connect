import type { AppProps } from 'next/app'
import Head from 'next/head'
import { appWithTranslation } from 'next-i18next'
import { DM_Sans, Inter } from 'next/font/google'
import { AuthProvider } from '../contexts/AuthContext'
import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import { IntroLoader } from '../components/IntroLoader'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

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
  const router = useRouter()
  const [pageHidden, setPageHidden] = useState(true)
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro')
    const isHome = router.pathname === '/'

    if (!hasSeenIntro && isHome) {
      setShowLoader(true)
    } else {
      setPageHidden(false)
    }
  }, [router.pathname])

  const handleIntroFinish = () => {
    localStorage.setItem('hasSeenIntro', 'true')
    setShowLoader(false)
    setPageHidden(false)
  }

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
        {showLoader && <IntroLoader onFinish={handleIntroFinish} />}

        {/* loading state while checking auth/intro status */}
        {/* {pageHidden && router.pathname === '/' && !showLoader && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
          </div>
        )} */}

        {/* hide page behind loader to prevent flash */}
        <div className={pageHidden ? 'page-hidden' : ''}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </>
  )
}

export default appWithTranslation(MyApp)
