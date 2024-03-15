import type { ReactNode } from 'react'

import { GoogleTagManager } from '@next/third-parties/google'
import { Space_Grotesk as FontSans } from 'next/font/google'

import { BottomBar } from '@/components/NavigationMenu'
import { cn } from '@/utils/classNames'
import { description, ogImage, title, url } from '@/utils/consts'

import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-space_grotesk',
  display: 'swap',
})

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
    images: {
      url: ogImage,
      width: 1600,
      height: 630,
    },
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

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html
      lang="en"
      className={cn('font-sans', fontSans.variable)}
      suppressHydrationWarning
    >
      <head />
      <body className="no-repeat relative w-full bg-[#161616] bg-[url(/bg.svg)] bg-cover bg-fixed text-white">
        {children}

        <BottomBar />
        <GoogleTagManager gtmId="GTM-NJZK738P" />
      </body>
    </html>
  )
}

export default RootLayout
