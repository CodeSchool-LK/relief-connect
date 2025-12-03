import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { Navbar } from '@/components/organisms/common/navbar'
import { Footer } from '@/components/organisms/common/footer'
import { Toaster } from '@/components/atoms/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'RebuildSL.com - Rebuild Sri Lanka | Disaster Relief Platform',
  description:
    'Request/Provide help to the people in Sri Lanka who are affected by the natural disaster. Connecting communities in need with volunteers and organizations.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
