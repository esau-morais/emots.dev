import type { ReactNode } from 'react'

import { description, ogImage, title, url } from '@/utils/consts'

import './globals.css'

import { GeistMono } from 'geist/font/mono'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

import type { Viewport } from 'next'

export const metadata = {
  title: {
    default: title,
    template: '%s | Esaú Morais',
  },
  description,
  openGraph: {
    locale: 'en-UK',
    type: 'website',
    url: url,
    title: title,
    description: description,
    images: { url: ogImage, width: 1600, height: 630 },
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: {
      url: ogImage,
      width: 1600,
      height: 630,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    shortcut: '/favicon.ico',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // FIX: shouldnt next ts plugin be working?
} satisfies Viewport

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" className={GeistMono.variable} suppressHydrationWarning>
      <head />
      <body className="relative min-h-dvh w-full bg-mantle text-text">
        <Header />

        <main className="my-20 min-h-[calc(100dvh-80px-160px)]">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}

export default RootLayout
